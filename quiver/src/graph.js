export { 
    createOrGetBlankGraph,
    createOrGetNodeColl,
    createOrGetEdgeColl,
    createOrGetGraph,
};

function createOrGetGraph(db, name, V=[], E=[]) 
{
    let graph = null;

    db.createGraph(name, V, E).then(
        g => { graph = g; },
        err => {
            // The graph already exists
        });

    if (graph == null)
        graph = db.graph(name);

    return graph;
}

function createOrGetEdgeColl(db, name)
{
    var edges = null;

    db.createEdgeCollection(name).then(
        coll => { edges = coll },
        err => { /* collection exists */ }
    );

    if (edges == null)
        edges = db.collection(name);

    return edges;
}

function createOrGetNodeColl(db, name)
{
    var nodes = null;

    db.createCollection(name).then(
        coll => { nodes = coll },
        err => { /* collection exists */ }
    );

    if (nodes == null)
        nodes = db.collection(name);

    return nodes;
}

function createOrGetBlankGraph(db, name) 
{
    let graph = null;

    db.createGraph(name, [], []).then(
        g => { graph = g; },
        err => {
            // The graph already exists
        });

    if (graph == null)
        graph = db.graph(name);

    return graph;
}

