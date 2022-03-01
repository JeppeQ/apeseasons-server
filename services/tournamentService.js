const db = require("../models")
const { Op } = require("sequelize")
const { DateTime } = require('luxon')
const polygonTokens = require('../whitelists/polygon.json')
const { utils } = require("ethers")
const { calculatePrize } = require("./prizeService")

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

finalizeStandings = async (tournament, sortedPlayers) => {
  const ticketToken = polygonTokens.find(t => t.address.toUpperCase() === tournament.ticketToken.toUpperCase())

  const players = sortedPlayers.map((p, i) => {
    return {
      id: tournament.id + p[0],
      netWorth: Number(utils.formatUnits(p[1], ticketToken.decimals)),
      rank: i + 1,
      prize: calculatePrize(tournament.ticketPrice, tournament.prizePool, sortedPlayers.length, i, tournament.prizeStructure)
    }
  })

  await db.player.bulkCreate(players, { updateOnDuplicate: ["netWorth", "rank", "prize"] })

  tournament.finalized = 'COMPLETED'
  await tournament.save()
}

module.exports = {
  getUpcoming,
  getRunning,
  getPlayers,
  finalizeStandings
}
