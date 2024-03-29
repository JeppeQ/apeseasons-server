const errorHandler = require('../helpers/error-handler');

const tournament = require('./tournament')
const token = require('./token')
const player = require('./player')
const update = require('./update')

module.exports = function (app) {
  // api routes
  app.use("/api/tournament", tournament)
  app.use("/api/token", token)
  app.use("/api/player", player)
  app.use("/api/update", update)

  // global error handler
  app.use(errorHandler)
}