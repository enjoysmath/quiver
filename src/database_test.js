// var arangojs = require('arangojs-enlightenedcode');
// Database = arangojs.Database;

// Const variables for connecting to ArangoDB database
const host = '127.0.0.1'
const port = '8529'
const username = 'root'
const password = 'lunamoona'
const databasename = 'mydb'

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Using ES2015 string templates
var aql = require('arangojs').aql;

// or plain old Node-style
var arangojs = require('arangojs');
 // Connection to ArangoDB

 var db = new arangojs.Database({
    url: `http://${host}:${port}`,
    databaseName: databasename,
    precaptureStackTraces: true,
});

db.useBasicAuth(username, password);

import { 
    createOrGetNodeColl,
    createOrGetEdgeColl,
    createOrGetGraph,
} from '../src/graph.js'

// Using promises with ES2015 arrow functions
db.createDatabase('mydb').then(info => {}, err => {});

// // db.listCollections().then(
//     function(res) {
//         res.forEach((coll, i) => {
//             console.log(`${i+1}. ${coll.name} (ID=${coll.id}, system=${coll.isSystem})`)
//         });
//     }, 
//     function(err) {
//         const res = err.response.body;
//         console.log(`Error ${res.errorNum}: ${res.errorMessage} (HTTP ${res.code})`);
//     });


// // Node-style callbacks
// db.createDatabase('mydb', function (err, info) {
//     if (err) console.error(err.stack);
//     else {
//         // database created
//     }
// });



// let g = createBlankGraph(db, 'mygraph2');
// var V = createOrGetNodeColl(db, 'mynodes-js');

createOrGetNodeColl(db, 'mynodesjs');

db.query(aql`
    FOR i IN 1..10
        INSERT {
            LaTeX: CONCAT("A_", i),
        } IN mynodesjs`
).then(
    cursor => {
        cursor.all().then(
            vals => {
                // vals is an array containing the entire query result
                console.error(vals);
            });
    });

const V = db.collection('mynodesjs');
var E = createOrGetEdgeColl(db, 'myedgesjs');
var G = createOrGetGraph(db, 'mygraphjs', V, E);

console.info(G);

// console.info(g);

// db.listGraphs().then(
//     graphs => { console.error(graphs) });



const active = true;

