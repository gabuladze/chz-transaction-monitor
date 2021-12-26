
const Web3Singleton = require('../web3')

after(async function () {
  const web3 = await Web3Singleton.getInstance()
  web3.currentProvider.disconnect()
})
