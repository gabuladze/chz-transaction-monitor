const { MongoClient } = require('mongodb')
const { MONGODB } = require('../config')

const url = `mongodb://${MONGODB.USERNAME}:${MONGODB.PASSWORD}@${MONGODB.HOST}:${MONGODB.PORT}`
const client = new MongoClient(url)

module.exports = client
