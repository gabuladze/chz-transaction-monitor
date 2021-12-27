const chai = require('chai')

const { expect } = chai
const mongo = require('../db')
const web3Singleton = require('../web3')
const TransactionsService = require('../services/transactionsService')
const { MONGODB } = require('../config')

let TransactionsServiceInstance = null
let web3 = null // web3 instance
const transactionsToDelete = []

describe('Test TransactionsService', function () {
  before(async function () {
    web3 = await web3Singleton.getInstance()
    TransactionsServiceInstance = new TransactionsService({ web3, mongo })
  })

  after(async function () {
    await mongo.db(MONGODB.DB_NAME).collection('transactions').deleteMany({ transactionHash: { $in: transactionsToDelete } })
  })

  describe('#getTransfers', function () {
    const assertTransferObject = (transferObj, expected) => {
      expect(transferObj).to.have.property('transactionHash', expected.transactionhash)
      expect(transferObj).to.have.property('from', expected.from).that.is.a('string')
      expect(transferObj).to.have.property('to', expected.to).that.is.a('string')
      expect(transferObj).to.have.property('amount').that.is.an('object')
      expect(transferObj.amount).to.have.property('native').that.is.an('string')
      expect(transferObj.amount).to.have.property('chz', expected.chzAmount).that.is.an('string')
    }

    it('must return array of transfers for contract transaction', async function () {
      const testTransactionHash = '0x0a388d3d8b5a5b9d622af074911e3bf88ed7249a3935d24c25d01ea66ea55986'
      const testTransactionReceipt = await web3.eth.getTransactionReceipt(testTransactionHash)
      const expected = {
        transactionhash: testTransactionHash,
        from: '0x79e8f6ce767aa75b8dd53fd19769ee6ed4becd9d',
        to: '0x22888de1e0621dc6d0444b645218bc9df37c33f4',
        chzAmount: '336.77916716'
      }

      const result = await TransactionsServiceInstance.getTransfers(testTransactionReceipt)

      expect(result).to.have.property('totalTokensTransfered').that.is.an('object')
      expect(result.totalTokensTransfered).to.have.property('native').that.is.a('number')
      expect(result.totalTokensTransfered).to.have.property('chz').that.is.a('number')
      for (let i = 0; i < result.length; i++) {
        assertTransferObject(result[i], expected)
      }
    })

    it('must return array of transfers for internal contract transaction', async function () {
      const testTransactionHash = '0x52c550eaf791bd69821dc42d2a17ade9c97cc0a660e45619865a69b11b02dac0'
      const testTransactionReceipt = await web3.eth.getTransactionReceipt(testTransactionHash)
      const expected = {
        transactionhash: testTransactionHash,
        from: '0x91db9e27e750c43a96926b2e04d795c24f13f67b',
        to: '0x1522900b6dafac587d499a862861c0869be6e428',
        chzAmount: '212273'
      }

      const result = await TransactionsServiceInstance.getTransfers(testTransactionReceipt)

      expect(result).to.have.property('totalTokensTransfered').that.is.an('object')
      expect(result.totalTokensTransfered).to.have.property('native').that.is.a('number')
      expect(result.totalTokensTransfered).to.have.property('chz').that.is.a('number')
      for (let i = 0; i < result.length; i++) {
        assertTransferObject(result[i], expected)
      }
    })
  })

  describe('#isTokenTransaction', function () {
    it('must return true for transaction that interacts directly with token contract', async function () {
      const testTransactionHash = '0x0a388d3d8b5a5b9d622af074911e3bf88ed7249a3935d24c25d01ea66ea55986'

      const result = await TransactionsServiceInstance.isTokenTransaction(testTransactionHash)

      expect(result).to.equal(true)
    })

    it('must return true for internal contract transaction', async function () {
      const testTransactionHash = '0x52c550eaf791bd69821dc42d2a17ade9c97cc0a660e45619865a69b11b02dac0'

      const result = await TransactionsServiceInstance.isTokenTransaction(testTransactionHash)

      expect(result).to.equal(true)
    })

    it('must return false for non contract transaction', async function () {
      const testTransactionHash = '0x0181c3e08abf4814ce65f762c4fde475fa6bf79df467bd5f0afba881dc287715'

      const result = await TransactionsServiceInstance.isTokenTransaction(testTransactionHash)

      expect(result).to.equal(false)
    })
  })

  describe('#processTransactionReceiptResponse', function () {
    const assert = (result, transactionDbRecord) => {
      expect(result).to.equal(true)
      expect(transactionDbRecord).to.have.property('totalTokensTransfered').that.is.an('object')
      expect(transactionDbRecord.totalTokensTransfered).to.have.property('native').that.is.a('number')
      expect(transactionDbRecord.totalTokensTransfered).to.have.property('chz').that.is.a('number')
    }

    it('must return true for transaction that interacts directly with token contract', async function () {
      const testTransactionHash = '0x0a388d3d8b5a5b9d622af074911e3bf88ed7249a3935d24c25d01ea66ea55986'
      const testTransactionReceipt = await web3.eth.getTransactionReceipt(testTransactionHash)

      const result = await TransactionsServiceInstance.processTransactionReceiptResponse(testTransactionReceipt)
      const transactionDbRecord = await mongo.db(MONGODB.DB_NAME).collection('transactions')
        .findOne({ transactionHash: testTransactionReceipt.transactionHash })
      transactionsToDelete.push(testTransactionReceipt.transactionHash)

      assert(result, transactionDbRecord)
    })

    it('must return true for internal contract transaction', async function () {
      const testTransactionHash = '0x52c550eaf791bd69821dc42d2a17ade9c97cc0a660e45619865a69b11b02dac0'
      const testTransactionReceipt = await web3.eth.getTransactionReceipt(testTransactionHash)

      const result = await TransactionsServiceInstance.processTransactionReceiptResponse(testTransactionReceipt)
      const transactionDbRecord = await mongo.db(MONGODB.DB_NAME).collection('transactions')
        .findOne({ transactionHash: testTransactionReceipt.transactionHash })
      transactionsToDelete.push(testTransactionReceipt.transactionHash)

      assert(result, transactionDbRecord)
    })

    it('must return true for non contract transaction. db must not have a record of the transaction', async function () {
      const testTransactionHash = '0x0181c3e08abf4814ce65f762c4fde475fa6bf79df467bd5f0afba881dc287715'
      const testTransactionReceipt = await web3.eth.getTransactionReceipt(testTransactionHash)

      const result = await TransactionsServiceInstance.processTransactionReceiptResponse(testTransactionReceipt)
      const transactionDbRecord = await mongo.db(MONGODB.DB_NAME).collection('transactions')
        .findOne({ transactionHash: testTransactionReceipt.transactionHash })

      expect(result).to.equal(true)
      expect(transactionDbRecord).to.equal(null)
    })
  })
})
