require('dotenv').config()
const { loadEnvironmentVariables } = require('./config/environment.config')

loadEnvironmentVariables().then(() => {
  const express = require('express')
  const cors = require('cors')
  const app = express()

  const db = require("./models")
  db.sequelize.sync()

  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  require('./routes')(app)

  const port = process.env.PORT || 8080
  app.listen(port, () => console.log(`Server running on port ${port}...`))
}).catch(e => {
  console.log('Failed to start server', e)

  process.exit()
})