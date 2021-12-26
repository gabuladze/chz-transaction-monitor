
const db = require('../db')

before(async function () {
  await db.connect()
})
