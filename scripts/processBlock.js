const Web3Singleton = require('../web3')

const RUN_DELAY = 10000

const STATE = {
  processedBlocks: {},
  lastBlockNumber: null
}

const run = async () => {
  const web3 = await Web3Singleton.getInstance()

  const blockNumber = STATE.lastBlockNumber ? Number(STATE.lastBlockNumber) + 1 : await web3.eth.getBlockNumber()

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
  STATE.processedBlocks[blockNumber] = true
  STATE.lastBlockNumber = blockNumber

  return setTimeout(run, RUN_DELAY)
}

module.exports = { run }
