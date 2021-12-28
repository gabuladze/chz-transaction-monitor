const chai = require('chai')
const chaiHttp = require('chai-http')

chai.use(chaiHttp)
const { expect } = chai

const app = require('../app.js')

describe('Test TransactionsRouter', function () {
  describe('GET /api/transactions/check/:transactionHash', function () {
    it('must return true for transaction that interacts directly with token contract', async function () {
      const testTransactionHash = '0x0a388d3d8b5a5b9d622af074911e3bf88ed7249a3935d24c25d01ea66ea55986'

      const response = await chai.request(app).get(`/api/transactions/check/${testTransactionHash}`)

      expect(response).to.have.status(200)
      expect(response.body).to.have.property('isTokenTransaction', true)
    })

    it('must return true for internal contract transaction', async function () {
      const testTransactionHash = '0x52c550eaf791bd69821dc42d2a17ade9c97cc0a660e45619865a69b11b02dac0'

      const response = await chai.request(app).get(`/api/transactions/check/${testTransactionHash}`)

      expect(response).to.have.status(200)
      expect(response.body).to.have.property('isTokenTransaction', true)
    })

    it('must return false for non contract transaction', async function () {
      const testTransactionHash = '0x0181c3e08abf4814ce65f762c4fde475fa6bf79df467bd5f0afba881dc287715'

      const response = await chai.request(app).get(`/api/transactions/check/${testTransactionHash}`)

      expect(response).to.have.status(200)
      expect(response.body).to.have.property('isTokenTransaction', false)
    })
  })

  describe('GET /api/transactions/totals', function () {
    it('must return total tokens transfered', async function () {
      const response = await chai.request(app).get('/api/transactions/totals')

      expect(response).to.have.status(200)
      expect(response.body).to.have.property('totalTokensTransfered').that.is.a('number').greaterThanOrEqual(0)
      expect(response.body).to.have.property('totalTokensTransferedNative').that.is.a('number').greaterThanOrEqual(0)
    })
  })
})
