const express = require('express')

const router = express.Router()
const errorMiddleware = require('../middleware/errorMiddleware.js')

const transactionsRouter = require('./transactionsRouter.js')

router.use('/api/transactions', transactionsRouter)

router.use(errorMiddleware)

module.exports = router
