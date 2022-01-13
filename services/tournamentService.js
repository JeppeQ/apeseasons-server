const db = require("../models")
const { Op } = require("sequelize")
const { DateTime } = require('luxon')

getUpcoming = async () => {
  const tournaments = await db.tournament.findAll({
    where: {
      startTime: { [Op.gt]: DateTime.utc().valueOf() }
    }
  })

  return tournaments
}

getRunning = async () => {
  const tournaments = await db.tournament.findAll({
    where: {
      startTime: { [Op.lt]: DateTime.utc().valueOf() },
      endTime: { [Op.gt]: DateTime.utc().valueOf() }
    }
  })

  return tournaments
}

getPlayers = async (tournamentId) => {
  return db.player.findAll({
    where: {
      tournamentId
    },
    include: [{
      model: db.holding,
      where: {
        amountFloat: {
          [Op.gt]: 0
        }
      }
    }, {
      model: db.trade,
    }]
  })
}

module.exports = {
  getUpcoming,
  getRunning,
  getPlayers
}
