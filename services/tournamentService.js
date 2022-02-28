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
    order: [['rank', 'ASC']],
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

finalizeStandings = async (address, sortedPlayers) => {
  const tournament = await db.tournament.findByPk(address)

  const players = sortedPlayers.map((p, i) => {
    return {
      id: address + p[0],
      netWorth: p[1],
      rank: i + 1,
      prize: calculatePrize(tournament.ticketPrice, tournament.prizePool, sortedPlayers.length, i, tournament.prizeStructure)
    }
  })

  await db.player.bulkCreate(players, { updateOnDuplicate: ["netWorth", "rank", "prize"] })

  tournament.finalized = true
  await tournament.save()
}

module.exports = {
  getUpcoming,
  getRunning,
  getPlayers,
  finalizeStandings
}
