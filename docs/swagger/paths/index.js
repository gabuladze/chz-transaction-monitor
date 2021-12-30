const transactionTotals = require('./transactionTotals.js')
const transactionCheck = require('./transactionCheck.js')

module.exports = {
  '/api/transactions/totals': transactionTotals,
  '/api/transactions/check/{hash}': transactionCheck
}
