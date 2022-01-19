const db = require("../models")
const { Op } = require("sequelize")
const { DateTime } = require('luxon')

getUpcomingTournaments = async (address) => {
  const tournaments = await db.player.findAll({
    where: {
      address
    },
    include: [{
      model: db.tournament,
      required: true,
      where: {
        startTime: { [Op.gt]: DateTime.utc().valueOf() }
      }
    }, {
      model: db.holding,
      where: {
        amountFloat: {
          [Op.gt]: 0
        }
      }
    }]
  })

  return tournaments
}

getRunningTournaments = async (address) => {
  const tournaments = await db.player.findAll({
    where: {
      address
    },
    include: [{
      model: db.tournament,
      required: true,
      where: {
        startTime: { [Op.lt]: DateTime.utc().valueOf() },
        endTime: { [Op.gt]: DateTime.utc().valueOf() }
      }
    }, {
      model: db.holding,
      where: {
        amountFloat: {
          [Op.gt]: 0
        }
      }
    }]
  })

  return tournaments
}

getCompletedTournaments = async (address) => {
  const tournaments = await db.player.findAll({
    where: {
      address
    },
    include: [{
      model: db.tournament,
      required: true,
      where: {
        endTime: { [Op.lt]: DateTime.utc().valueOf() }
      }
    }, {
      model: db.holding,
      where: {
        amountFloat: {
          [Op.gt]: 0
        }
      }
    }]
  })

  return tournaments
}

isParticipant = async (address, tournamentId) => {
  const player = await db.player.findOne({
    where: {
      address,
      tournamentId
    }
  })

  return Boolean(player)
}

module.exports = {
  getUpcomingTournaments,
  getRunningTournaments,
  getCompletedTournaments,
  isParticipant
}
