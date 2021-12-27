const mongo = require('../db')
const { MONGODB } = require('../config')
const db = mongo.db(MONGODB.DB_NAME)

/**
 * Recreates processedBlocks collection
 */
const resetProcessedBlocks = async () => {
  const collections = await db.listCollections({ name: 'processedBlocks' }).toArray()
  if (collections.length > 0) await db.collection('processedBlocks').drop()
  await db.createCollection('processedBlocks', { capped: true, max: 10, size: 100000000 })
}

/**
 * Drops transactions collection
 */
const resetTransactions = async () => {
  const collections = await db.listCollections({ name: 'transactions' }).toArray()
  if (collections.length > 0) await db.collection('transactions').drop()
}

const run = async () => {
  await resetProcessedBlocks()
  await resetTransactions()
  return true
}

module.exports = { run }
