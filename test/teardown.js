
const Web3Singleton = require('../web3')
const mongo = require('../db')

after(async function () {
  const web3 = await Web3Singleton.getInstance()
  web3.currentProvider.disconnect()
  await mongo.close()
})
