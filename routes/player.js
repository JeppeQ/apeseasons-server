const express = require('express')
const { tournamentInterface } = require('../interfaces/tournamentInterface')
const router = express.Router()
const playerService = require('../services/playerService')

router.get('/tournaments/upcoming', async (req, res) => {
  const { address } = req.query
  
  const tournaments = await playerService.getUpcomingTournaments(address)

  const interface = tournamentInterface(tournaments)
  res.send(interface)
})

router.get('/tournaments/running', async (req, res) => {
  const { address } = req.query

  const tournaments = await playerService.getRunningTournaments(address)

  const interface = tournamentInterface(tournaments)
  res.send(interface)
})

router.get('/tournaments/completed', async (req, res) => {
  const { address } = req.query

  const tournaments = await playerService.getCompletedTournaments(address)

  const interface = tournamentInterface(tournaments)
  res.send(interface)
})

router.get('/participant', async (req, res) => {
  const { address, tournamentId } = req.query

  const player = await playerService.isParticipant(address, tournamentId)

  res.send(player)
})

module.exports = router