const db = require("../models")
const { Op } = require("sequelize")
const { DateTime } = require('luxon')

getUpcoming = async () => {
  const tournaments = await db.tournament.findAll({
    where: {
      startTime: { [Op.gt]: BigInt(DateTime.utc()) }
    }
  })

  return tournaments
}

getRunning = async () => {
  const tournaments = await db.tournament.findAll({
    where: {
      startTime: { [Op.lt]: BigInt(DateTime.utc()) },
      endTime: { [Op.gt]: BigInt(DateTime.utc()) }
    }
  })
  
  return tournaments
}

getPlayers = async (tournamentId) => {
  return db.player.findAll({
    where: {
      tournamentId
    },
    raw: true
  })
}

module.exports = {
  getUpcoming,
  getRunning,
  getPlayers
}
