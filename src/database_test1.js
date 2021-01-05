var arangojs = require('arangojs');

const aql = arangojs.aql;
const await = arangojs.await;

// Const variables for connecting to ArangoDB database
const host = '127.0.0.1'
const port = '8529'
const username = 'root'
const password = 'lunamoona'
const databasename = 'testDB'

 // Connection to ArangoDB
db = new arangojs.Database({
    url: `http://${host}:${port}`,
    databaseName: databasename,
    precaptureStackTraces: true,
});

db.useBasicAuth(username, password);



try {
  graph = db.createGraph('school', [], []);
}
catch (err)
{
  // console.log(err);
  graph = db.graph('school');
}

