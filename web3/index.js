const Web3 = require('web3')
const { ETH_NODE } = require('../config')
const {
  WS_PORT,
  WS_HOST,
  WS_PROVIDER_TIMEOUT,
  WS_PROVIDER_RECONNECT,
  WS_PROVIDER_RECONNECT_DELAY,
  WS_PROVIDER_RECONNECT_MAX_ATTEMPTS,
  WS_PROVIDER_RECONNECT_ON_TIMEOUT
} = ETH_NODE

class Web3Singleton {
  async build () {
    const url = `ws://${WS_HOST}:${WS_PORT}`
    const options = {
      timeout: WS_PROVIDER_TIMEOUT, // ms
      clientConfig: {
        maxReceivedFrameSize: 100000000, // bytes - default: 1MiB, current: 100MiB
        maxReceivedMessageSize: 100000000 // bytes - default: 8MiB, current: 100Mib
      },
      reconnect: {
        auto: WS_PROVIDER_RECONNECT,
        delay: WS_PROVIDER_RECONNECT_DELAY, // ms
        maxAttempts: WS_PROVIDER_RECONNECT_MAX_ATTEMPTS,
        onTimeout: WS_PROVIDER_RECONNECT_ON_TIMEOUT
      }
    }
    console.log(`Connecting to Ethereum Node at ${url}`)
    const provider = new Web3.providers.WebsocketProvider(url, options)
    this.instance = new Web3(provider)
  }

  async getInstance () {
    if (!this.instance) await this.build()
    return this.instance
  }
}

module.exports = new Web3Singleton()
