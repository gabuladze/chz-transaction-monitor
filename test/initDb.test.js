const chai = require('chai')

const { expect } = chai
const { MONGODB } = require('../config')
const mongo = require('../db')
const db = mongo.db(MONGODB.DB_NAME)
const initDb = require('../scripts/initDb.js')

describe('Test initDb', function () {
  it('must create processedBlocks collection if it doesn\'t exist', async function () {
    let collections = await db.collections({ filter: { name: 'processedBlocks' }, nameOnly: true })
    if (collections.length > 0) await db.collection('processedBlocks').drop()

    await initDb.run()
    collections = await db.collections({ filter: { name: 'processedBlocks' }, nameOnly: true })

    expect(collections.length).to.be.greaterThan(0)
  })

  it('must re-create processedBlocks collection if it exists', async function () {
    let collections = await db.collections({ filter: { name: 'processedBlocks' }, nameOnly: true })
    if (collections.length < 0) await db.collection('processedBlocks').insertOne({ test: true })

    await initDb.run()
    collections = await db.collections({ filter: { name: 'processedBlocks' }, nameOnly: true })
    const processedBlocksDocumentCount = await db.collection('processedBlocks').count({})

    expect(collections.length).to.be.greaterThan(0)
    expect(processedBlocksDocumentCount).to.equal(0)
  })

  it('must drop transacitons collection ', async function () {
    await db.collection('transactions').insertOne({ test: true })

    await initDb.run()
    const transactionDocumentCount = await db.collection('transactions').countDocuments({})

    expect(transactionDocumentCount).to.equal(0)
  })
})
