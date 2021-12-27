const web3Singleton = require('../web3')
const mongo = require('../db')
const { MONGODB } = require('../config')
const db = mongo.db(MONGODB.DB_NAME)

const RUN_DELAY = 3000

const run = async () => {
  const web3 = await web3Singleton.getInstance()

  const lastProcessedBlock = await db.collection('processedBlocks').findOne({}, { sort: { $natural: -1 } })

  const blockNumber = lastProcessedBlock ? Number(lastProcessedBlock.height) + 1 : await web3.eth.getBlockNumber()

  const blockData = await web3.eth.getBlock(blockNumber)
  // If getBlock returns falsy value (null),
  // this means that the block hasn't been mined yet
  if (!blockData) return setTimeout(run, RUN_DELAY)

  const isInMainChain = await web3.eth.getBlock(blockData.hash)
  if (!isInMainChain) {
    console.log(`Block is not in main chain! hash=${blockData.hash}`)
    return setTimeout(run, RUN_DELAY)
  }

  console.log(`Processing block. number=${blockData.number} hash=${blockData.hash}`)

  for (let i = 0; i < blockData.transactions.length; i++) {
    // TODO: process transaction
    // const transactionHash = blockData.transactions[i]
  }

  // Block has been processed successfully, add it to processedBlocks
  await db.collection('processedBlocks').insertOne({ height: blockNumber, hash: blockData.hash, parentHash: blockData.parentHash })

  return setTimeout(run, RUN_DELAY)
}

module.exports = { run }
