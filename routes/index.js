const errorHandler = require('../helpers/error-handler');
const { useJwt } = require('../helpers/jwt')

const example = require('./exampleRoute')

module.exports = function (app) {
  app.use(useJwt())

  // api routes
  app.use("/api/example", example)

  // global error handler
  app.use(errorHandler)
}