const express = require('express')

const TransactionsRouter = express.Router()

const TransactionsService = require('../services/transactionsService.js')
const Web3Singleton = require('../web3')
const mongo = require('../db')

// Check if transaction interracts with token contract
TransactionsRouter.get('/check/:transactionHash', async (req, res, next) => {
  try {
    const web3 = await Web3Singleton.getInstance()
    const isTokenTransaction = await new TransactionsService({ web3, mongo }).isTokenTransaction(req.params.transactionHash)

    return res.json({ isTokenTransaction })
  } catch (error) {
    return next(error)
  }
})

module.exports = TransactionsRouter
