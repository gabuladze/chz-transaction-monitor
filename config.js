require('dotenv').config()

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'dev',
  APP_PORT: process.env.APP_PORT || 8000,
  ETH_NODE: {
    INFURA_URL: process.env.INFURA_URL,
    WS_PORT: process.env.WS_PORT,
    WS_HOST: process.env.WS_HOST,
    WS_PROVIDER_TIMEOUT: 3000,
    WS_PROVIDER_RECONNECT: true,
    WS_PROVIDER_RECONNECT_DELAY: 2000,
    WS_PROVIDER_RECONNECT_MAX_ATTEMPTS: 3,
    WS_PROVIDER_RECONNECT_ON_TIMEOUT: true
  }
}
