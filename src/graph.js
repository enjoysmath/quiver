export { createBlankGraph };


function createBlankGraph(db, name) 
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

