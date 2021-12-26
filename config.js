require('dotenv').config()

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'dev',
  APP_PORT: process.env.APP_PORT || 8000,
  MONGODB: {
    USERNAME: process.env.MONGODB_USERNAME,
    PASSWORD: process.env.MONGODB_PASSWORD,
    HOST: process.env.MONGODB_HOST,
    PORT: process.env.MONGODB_PORT,
    DB_NAME: process.env.MONGODB_DBNAME
  },
  ETH_NODE: {
    INFURA_URL: process.env.INFURA_URL,
    WS_PORT: process.env.WS_PORT,
    WS_HOST: process.env.WS_HOST,
    WS_PROVIDER_TIMEOUT: 3000,
    WS_PROVIDER_RECONNECT: true,
    WS_PROVIDER_RECONNECT_DELAY: 2000,
    WS_PROVIDER_RECONNECT_MAX_ATTEMPTS: 3,
    WS_PROVIDER_RECONNECT_ON_TIMEOUT: true
  },
  TOKEN: {
    SYMBOL: 'CHZ',
    CONTRACT_ADDRESS: '0x3506424f91fd33084466f402d5d97f05f8e3b4af',
    TOPICS: [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' // Transfer(address,address,uint256)
    ],
    TOPIC_HASH: {
      Transfer: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    }
  }
}
