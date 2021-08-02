const errorHandler = require('../helpers/error-handler');

const tournament = require('./tournament')
const token = require('./token')
const player = require('./player')

module.exports = function (app) {
  // api routes
  app.use("/api/tournament", tournament)
  app.use("/api/token", token)
  app.use("/api/player", player)

  // global error handler
  app.use(errorHandler)
}