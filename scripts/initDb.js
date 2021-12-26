const mongo = require('../db')
const { MONGODB } = require('../config')

const run = async () => {
  await mongo.db(MONGODB.DB_NAME).collection('state').deleteMany()
  await mongo.db(MONGODB.DB_NAME).collection('state').insertOne({
    processedBlocks: {},
    processedBlocksCounter: 0,
    lastBlockNumber: null,
    totalTokensTransfered: {
      pending: 0,
      confirmed: 0
    }
  })
  console.log('App state has been initialzied!')
  return true
}

module.exports = { run }
