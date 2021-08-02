const db = require("../models")

getTokens = async (network = 'polygon') => {
  return db.token.findAll({
    where: {
      network
    },
    raw: true
  })
}

module.exports = {
  getTokens
}
