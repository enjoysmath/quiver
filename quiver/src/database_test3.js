const host = 'bolt://127.0.0.1:7687'
const username = 'neo4j'
const password = 'lunamoona'

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const neo4j = require("neo4j-driver")

const driver = neo4j.driver(host, neo4j.auth.basic(username, password))
const session = driver.session()
const nodeLaTeX = 'A'

try {
    const result = await session.run(`
        MATCH (n:Object {LaTeX: $latex})
        RETURN n`, {latex: nodeLaTeX})
    const singleRecord = result.records[0]
    const node = singleRecord.get(0)
    console.log(node.properties.LaTeX)
}
finally {
    await session.close()
}

await driver.close()
