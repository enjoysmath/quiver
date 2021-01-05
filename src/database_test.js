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

import { createBlankGraph } from '../src/graph.js'


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


// or plain old Node-style
var arangojs = require('arangojs');
 // Connection to ArangoDB

 var db = new arangojs.Database({
    url: `http://${host}:${port}`,
    databaseName: databasename,
    precaptureStackTraces: true,
});

db.useBasicAuth(username, password);

var aql = arangojs.aql(['RETURN ', ''], Date.now());
var query = aql.query;
var bindVars = aql.bindVars;

// // Node-style callbacks
// db.createDatabase('mydb', function (err, info) {
//     if (err) console.error(err.stack);
//     else {
//         // database created
//     }
// });

// Using promises with ES2015 arrow functions
db.createDatabase('mydb').then(info => {}, err => {});

let g = createBlankGraph(db, 'mygraph2');

console.info(g);

db.listGraphs().then(
    graphs => { console.error(graphs) });

// Using ES2015 string templates
var aql = require('arangojs').aql;

const active = true;

db.query(aql`
    FOR doc IN test
    FILTER doc.test == ${active}
    RETURN doc
`)
.then(cursor => {
    cursor.all().then(
        vals => {
            // vals is an array containing the entire query result
            console.error(vals);
        });
    });
