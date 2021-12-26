const mongo = require('../db')
const { MONGODB } = require('../config')
const db = mongo.db(MONGODB.DB_NAME)

/**
 * Resets processedBlocks collection
 */
const run = async () => {
  const collections = await db.collections({ filter: { name: 'processedBlocks' }, nameOnly: true })
  if (collections.length > 0) await db.collection('processedBlocks').drop()
  await mongo.db(MONGODB.DB_NAME).createCollection('processedBlocks', { capped: true, max: 10, size: 100000000 })

  return true
}

module.exports = { run }
