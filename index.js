const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./docs/swagger/swaggerFile.js')

const mongo = require('./db')
const processBlock = require('./scripts/processBlock.js')
const initDb = require('./scripts/initDb.js')

const { APP_PORT } = require('./config')
const app = require('./app.js')

async function start () {
  try {
    await mongo.connect()
    await initDb.run()

    app.listen(APP_PORT, () => console.log(`chz-transaction-monitor listening on port ${APP_PORT}`))

    app.use('/api-reference', swaggerUi.serve, swaggerUi.setup(swaggerFile))

    console.log('Starting processBlock script...')
    await processBlock.run()
  } catch (error) {
    console.log('An Error has occured!', error.stack)
  }
}

start()
