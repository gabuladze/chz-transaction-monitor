const web3Singleton = require('../web3')
const mongo = require('../db')
const { MONGODB } = require('../config')
const db = mongo.db(MONGODB.DB_NAME)
const TransactionsService = require('../services/transactionsService')

const RUN_DELAY = 10000

const run = async () => {
  try {
    const web3 = await web3Singleton.getInstance()

    const lastProcessedBlock = await db.collection('processedBlocks').findOne({}, { sort: { $natural: -1 } })

    const blockNumber = lastProcessedBlock ? Number(lastProcessedBlock.height) + 1 : await web3.eth.getBlockNumber()
    // const blockNumber = 13885382

    const blockData = await web3.eth.getBlock(blockNumber)

    // If getBlock returns falsy value (null),
    // this means that the block hasn't been mined yet
    if (!blockData) return setTimeout(run, RUN_DELAY)

    // Just double check that the block is part of the main chain
    const isInMainChain = await web3.eth.getBlock(blockData.hash)
    if (!isInMainChain) {
      console.log(`Block is not in main chain! hash=${blockData.hash}`)
      return setTimeout(run, RUN_DELAY)
    }

    // Handle chain reorganization
    // Check if current block's parentHash === previous block's hash
    // Only if we have lastProcessedBlock
    if (lastProcessedBlock && lastProcessedBlock.hash !== blockData.parentHash) {
    // Watson, we have a reorg!
      console.log(`Chain reorg detected at height=${blockNumber} hash=${blockData.hash} parentHash=${blockData.parentHash} lastBlock.hash=${lastProcessedBlock.hash}`)
      // Go back until and find a block that has matching number & hashes in db & wallet
      const processedBlocks = await db.collection('processedBlocks').find({}).sort({ $natural: -1 }).toArray()

      let forkBlock
      for (let i = 0; i < processedBlocks.length; i++) {
        const blockRecord = processedBlocks[i]
        const blockInWallet = await web3.eth.getBlock(blockRecord.height)
        if (blockRecord.hash === blockInWallet.hash) {
          forkBlock = blockRecord
          console.log(`Chain was forked at height=${forkBlock.height + 1}\nLast processed block from main chain: height=${forkBlock.height} hash=${forkBlock.hash}`)
          break
        }
      }

      // Re-insert forkBlock, so that processBlock will start with forkBlock.height + 1 on next run
      await db.collection('processedBlocks').insertOne({ height: forkBlock.height, hash: forkBlock.hash })

      return setTimeout(run, RUN_DELAY)
    }

    console.log(`Processing block. number=${blockData.number} hash=${blockData.hash}`)

    const TransactionsServiceInstance = new TransactionsService({ web3, mongo })

    await TransactionsServiceInstance.processTransactions(blockData.transactions)

    // Block has been processed successfully, add it to processedBlocks
    await db.collection('processedBlocks').insertOne({ height: blockNumber, hash: blockData.hash })
  } catch (error) {
    console.log('processBlock.js > ', error.stack)
  }

  return setTimeout(run, RUN_DELAY)
}

module.exports = { run }
