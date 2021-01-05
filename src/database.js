"use strict";

QuiverImportExport.database = new class extends QuiverImportExport {
    // insert long comment :)

    export(quiver) {
        // Remove the query string from the current URL and use that as a base.
        const URL_prefix = window.location.href.replace(/\?.*$/, "");

        if (quiver.is_empty()) {
            // No need to have an encoding of an empty quiver;
            // we'll just use the URL directly.
            return {
                data: URL_prefix,
                metadata: {},
            };
        }

        const cells = [];
        const indices = new Map();

        let offset = new Position(Infinity, Infinity);
        // We want to ensure that the top-left cell is in position (0, 0), so we need
        // to work out where the top-left cell actually is, to compute an offset.
        for (const vertex of quiver.cells[0]) {
            offset = offset.min(vertex.position);
        }
        for (const vertex of quiver.cells[0]) {
            const { label } = vertex;
            indices.set(vertex, cells.length);
            const position = vertex.position.sub(offset).toArray();
            const cell = [...position];
            // In the name of efficiency, we omit any parameter that is not necessary.
            if (label !== "") {
                cell.push(label);
            }
            cells.push(cell);
        }

        for (let level = 1; level < quiver.cells.length; ++level) {
            for (const edge of quiver.cells[level]) {
                const { label, options: { label_alignment, ...options } } = edge;
                const [source, target] = [indices.get(edge.source), indices.get(edge.target)];
                indices.set(edge, cells.length);
                const cell = [source, target];
                // We want to omit parameters that are unnecessary (i.e. have the default
                // values). However, because we store parameters in an array, the only way
                // we can distinguish missing values is by the length. Therefore, we can
                // only truncate the array (not omit elements partway through the array).
                // This means we may need to include unnecessary information if there is a
                // non-default parameter after a default one. The parameters most likely to
                // be default are placed further back in the array to reduce the frequency
                // of this situation.
                const end = [];

                // We compute a delta of the edge options compared
                // to the default, so we encode a minimum of data.
                const default_options = Edge.default_options({ level });

                // Recursively compute a delta between an `object` and `base`.
                const probe = (object, base) => {
                    const delta = {};
                    for (const [key, value] of Object.entries(object)) {
                        const default_value = base[key];
                        if (typeof default_value === "object" && typeof value === "object") {
                            const subdelta = probe(value, default_value);
                            if (Object.keys(subdelta).length > 0) {
                                delta[key] = subdelta;
                            }
                        } else if (base[key] !== value) {
                            delta[key] = value;
                        }
                    }
                    return delta;
                };

                const delta = probe(options, default_options);
                if (Object.keys(delta).length > 0) {
                    end.push(delta);
                }

                const push_if_necessary = (parameter, default_value, condition = true) => {
                    if (end.length > 0 || (parameter !== default_value && condition)) {
                        end.push(parameter);
                    }
                };

                const variant = { left: 0, centre: 1, right: 2, over: 3 }[label_alignment];
                // It's only necessary to encode the label alignment is the label is not blank.
                push_if_necessary(variant, 0, label !== "");
                push_if_necessary(label, "");

                cell.push(...end.reverse());
                cells.push(cell);
            }
        }

        // The version of the base64 output format exported by this version of quiver.
        const VERSION = 0;
        const output = [VERSION, quiver.cells[0].size, ...cells];

        return {
            // We use this `unescape`-`encodeURIComponent` trick to encode non-ASCII characters.
            data: `${URL_prefix}?q=${btoa(unescape(encodeURIComponent(JSON.stringify(output))))}`,
            metadata: {},
        };
    }

    import(ui, string) {
        const quiver = new Quiver();

        let input;
        try {
            // We use this `decodeURIComponent`-`escape` trick to encode non-ASCII characters.
            const decoded = decodeURIComponent(escape(atob(string)));
            if (decoded === "") {
                return quiver;
            }
            input = JSON.parse(decoded);
        } catch (_) {
            throw new Error("invalid base64 or JSON");
        }

        // Helper functions for dealing with bad input.

        const assert = (condition, message) => {
            const postfix = " in quiver encoding";
            if (!condition) {
                throw new Error(`${message}${postfix}`);
            }
        };
        const assert_kind = (object, kind) => {
            switch (kind) {
                case "array":
                    assert(Array.isArray(object), `expected array`);
                    break;
                case "integer":
                case "natural":
                    assert(Number.isInteger(object), `expected integer`);
                    if (kind === "natural") {
                        assert(object >= 0, `expected non-negative integer`);
                    }
                    break;
                case "string":
                    assert(typeof object === "string", `expected string`);
                    break;
                case "object":
                    assert(typeof object === "object", `expected object`);
                    break;
                default:
                    throw new Error(`unknown parameter kind \`${kind}\``);
            }
        };
        const assert_eq = (object, value) => {
            assert(object === value, `expected \`${value}\`, but found \`${object}\``);
        };

        // Check all of the non-cell data is valid.
        assert_kind(input, "array");
        const [version = 0, vertices = 0, ...cells] = input;
        assert_kind(version, "natural");
        assert_eq(version, 0);
        assert_kind(vertices, "natural");
        assert(vertices <= cells.length, "invalid number of vertices");

        // If we encounter errors while loading cells, we skip the malformed cell and try to
        // continue loading the diagram, but we want to report the errors we encountered afterwards,
        // to let the user know we were not entirely successful.
        const errors = [];

        // We don't want to relayout every time we add a new cell: instead, we should perform
        // layout once, once all of the cells have been created.
        ui.buffer_updates = true;

        const indices = [];
        for (const cell of cells) {
            try {
                assert_kind(cell, "array");

                if (indices.length < vertices) {
                    // This cell is a vertex.

                    assert(cell.length >= 2 && cell.length <= 3, "invalid vertex format");
                    const [x, y, label = ""] = cell;
                    assert_kind(x, "natural");
                    assert_kind(y, "natural");
                    assert_kind(label, "string");

                    const vertex = new Vertex(ui, label, new Position(x, y));
                    indices.push(vertex);
                } else {
                    // This cell is an edge.

                    assert(cell.length >= 2 && cell.length <= 5, "invalid edge format");
                    const [source, target, label = "", alignment = 0, options = {}]
                        = cell;
                    for (const [endpoint, name] of [[source, "source"], [target, "target"]]) {
                        assert_kind(endpoint, "natural");
                        assert(endpoint < indices.length, `invalid ${name} index`);
                    }
                    assert_kind(label, "string");
                    assert_kind(alignment, "natural");
                    assert(alignment <= 3, "invalid label alignment");
                    assert_kind(options, "object");

                    // We don't restrict the keys on `options`, because it is likely that `options`
                    // will be extended in the future, and this permits a limited form of backwards
                    // compatibility. We never access prototype properties on `options`, so this
                    // should not be amenable to injection. However, for those properties we do
                    // expect to exist, we do check they have the correct type (and in some cases,
                    // range), below.

                    let level = Math.max(indices[source].level, indices[target].level) + 1;
                    const { style = {} } = options;
                    delete options.style;

                    // Validate `options`.
                    if (options.hasOwnProperty("label_position")) {
                        assert_kind(options.label_position, "natural");
                        assert(options.label_position <= 100, "invalid label position");
                    }
                    if (options.hasOwnProperty("offset")) {
                        assert_kind(options.offset, "integer");
                    }
                    if (options.hasOwnProperty("curve")) {
                        assert_kind(options.curve, "integer");
                    }
                    if (options.hasOwnProperty("shorten")) {
                        let shorten = { source: 0, target: 0 };
                        if (options.shorten.hasOwnProperty("source")) {
                            assert_kind(options.shorten.source, "natural");
                            shorten.source = options.shorten.source;
                        }
                        if (options.shorten.hasOwnProperty("target")) {
                            assert_kind(options.shorten.target, "natural");
                            shorten.target = options.shorten.target;
                        }
                        assert(shorten.source + shorten.target <= 100, "invalid shorten");
                    }

                    // In previous versions of quiver, there was a single `length` parameter, rather
                    // than two `shorten` parameters. We convert from `length` into `shorten` here.
                    if (options.hasOwnProperty("length")) {
                        assert_kind(options.length, "natural");
                        assert(options.length >= 0 && options.length <= 100, "invalid length");
                        // If both `length` and `shorten` are present (which should not happen for
                        // diagrams exported by quiver), `shorten` takes priority.
                        if (!options.hasOwnProperty("shorten")) {
                            const shorten = 100 - options.length;
                            options.shorten = { source: shorten / 2, target: shorten / 2 };
                        }
                        delete options.length;
                    }

                    // In previous versions of quiver, `level` was only valid for some arrows, and
                    // was recorded in the body style, rather than as a property of the edge itself.
                    // For backwards-compatibility, we check for this case manually here.
                    if (style.hasOwnProperty("body") && style.body.hasOwnProperty("level")) {
                        assert_kind(style.body.level, "natural");
                        assert(style.body.level >= 1, "invalid level");
                        level = style.body.level;
                        delete style.body.level;
                    }

                    const edge = new Edge(
                        ui,
                        label,
                        indices[source],
                        indices[target],
                        Edge.default_options({
                            level,
                            label_alignment: ["left", "centre", "right", "over"][alignment],
                            ...options,
                        }, style),
                    );
                    indices.push(edge);
                }
            } catch (error) {
                errors.push(error);
            }
        }

        // Centre the view on the quiver.
        ui.centre_view();
        // Also centre the focus point, so that it's centre of screen.
        // We subtract 0.5 from the position so that when the view is centred perfectly between
        // two cells, we prefer the top/leftmost cell.
        ui.focus_point.class_list.remove("smooth");
        ui.reposition_focus_point(ui.position_from_offset(ui.view.sub(Point.diag(0.5))));
        delay(() => ui.focus_point.class_list.add("smooth"));

        // When cells are created, they are usually queued. We don't want any cells that have been
        // imported to be queued.
        for (const cell of indices) {
            cell.element.query_selector("kbd.queue").class_list.remove("queue");
        }

        // Update all the affected columns and rows.
        delay(() => ui.update_col_row_size(
            ...indices.filter((cell) => cell.is_vertex()).map((vertex) => vertex.position)
        ));

        // Stop buffering updates, so that individual changes to cells will resize the grid.
        ui.buffer_updates = false;

        // If the quiver is now nonempty, some toolbar actions will be available.
        ui.toolbar.update(ui);
        ui.update_focus_tooltip();

        if (errors.length > 0) {
            // Just throw the first error.
            throw errors[0];
        }

        return quiver;
    }
};