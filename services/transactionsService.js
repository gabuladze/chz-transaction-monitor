const Decimal = require('decimal.js')
const Service = require('./service.js')
const IERC20 = require('../abis/IERC20')
const { TOKEN, MONGODB } = require('../config')

class TransactionsService extends Service {
  /**
   * Retrieves transaction receipts for specified hashes
   * and binds processTransactionReceiptResponse to each request response
   * @async
   * @param {string[]} transactionHashes - Array of transaction hashes
   */
  async processTransactions (transactionHashes) {
    const batchRequest = new this.web3.BatchRequest()
    console.log(`Creating batch request for ${transactionHashes.length} transactions`)

    for (let i = 0; i < transactionHashes.length; i++) {
      const hash = transactionHashes[i]
      batchRequest.add(
        this.web3.eth.getTransactionReceipt.request(hash, this.processTransactionReceiptResponse.bind(this))
      )
    }

    await batchRequest.execute()
  }

  /**
   * Saves token transaction to db
   * @async
   * @param {Object} transactionReceipt - Transaction receipt
   */
  async processTransactionReceiptResponse (error, transactionReceipt) {
    if (error) {
      console.log('Error when fetching transaction receipt:', error.stack)
    }
    const transfersResult = await this.getTransfers(transactionReceipt)
    if (transfersResult.transfers.length === 0) return true

    // Save totalChzTransfered in transaction receipt
    transactionReceipt.totalTokensTransfered = transfersResult.totalTokensTransfered

    // Save transaction to db
    await this.mongo.db(MONGODB.DB_NAME).collection('transactions').insertOne(transactionReceipt)
    console.log('Saved:', transactionReceipt.transactionHash)
    return true
  }

  /**
   * Returns transfer data from transactionReceipt.logs
   * @async
   * @param {object} transactionReceipt - Transaction receipt object
   * @returns array containing transfer data extracted from transaction logs
   */
  async getTransfers (transactionReceipt) {
    const Contract = new this.web3.eth.Contract(IERC20, TOKEN.CONTRACT_ADDRESS)
    const decimals = await Contract.methods.decimals().call()

    const result = {
      transfers: [],
      totalTokensTransfered: {
        native: 0,
        [TOKEN.SYMBOL.toLowerCase()]: 0
      }
    }

    // Index 0 is always topic hash, indexes 1-3 contain indexed params of the log
    const transferLogs = transactionReceipt.logs.filter((log) => log.address.toLowerCase() === TOKEN.CONTRACT_ADDRESS && log.topics[0] === TOKEN.TOPIC_HASH.Transfer)
    if (transferLogs.length === 0) return result

    for (let i = 0; i < transferLogs.length; i++) {
      const transferLog = transferLogs[i]

      const from = this.web3.eth.abi.decodeParameter('address', transferLog.topics[1]).toLowerCase()
      const to = this.web3.eth.abi.decodeParameter('address', transferLog.topics[2]).toLowerCase()
      const tokenAmountNative = this.web3.eth.abi.decodeParameter('uint256', transferLog.data)
      const tokenAmount = Decimal.div(tokenAmountNative, Decimal.pow(10, decimals)).toString()

      const transfer = {
        transactionHash: transactionReceipt.transactionHash,
        from,
        to,
        amount: {
          native: tokenAmountNative,
          [TOKEN.SYMBOL.toLowerCase()]: tokenAmount
        }
      }

      result.transfers.push(transfer)
      result.totalTokensTransfered.native = Decimal.add(result.totalTokensTransfered.native, tokenAmountNative).toNumber()
      result.totalTokensTransfered[TOKEN.SYMBOL.toLowerCase()] = Decimal.add(result.totalTokensTransfered[TOKEN.SYMBOL.toLowerCase()], tokenAmount).toNumber()
    }

    return result
  }

  /**
   * Returns true if transaction with hash transactionHash
   * is related to the token contract
   * @async
   * @param {string} transactionHash - Transaction hash
   */
  async isTokenTransaction (transactionHash) {
    const transactionReceipt = await this.web3.eth.getTransactionReceipt(transactionHash)
    const tokenTransfers = await this.getTransfers(transactionReceipt)
    return tokenTransfers.length > 0
  }
}

module.exports = TransactionsService
