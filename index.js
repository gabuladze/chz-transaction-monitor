const processBlock = require('./scripts/processBlock.js')

async function start () {
  try {
    console.log('Starting processBlock script...')
    await processBlock.run()
  } catch (error) {
    console.log('An Error has occured!', error.stack)
  }
}

start()
