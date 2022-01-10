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
        startTime: { [Op.gt]: BigInt(DateTime.utc()) }
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
        startTime: { [Op.lt]: BigInt(DateTime.utc()) },
        endTime: { [Op.gt]: BigInt(DateTime.utc()) }
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
        endTime: { [Op.lt]: BigInt(DateTime.utc()) }
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

module.exports = {
  getUpcomingTournaments,
  getRunningTournaments,
  getCompletedTournaments
}
