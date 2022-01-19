const express = require('express')
const router = express.Router()
const playerService = require('../services/playerService')

router.get('/tournaments/upcoming', async (req, res) => {
  const { address } = req.query
  
  const tournaments = await playerService.getUpcomingTournaments(address)

  res.send(tournaments)
})

router.get('/tournaments/running', async (req, res) => {
  const { address } = req.query

  const tournaments = await playerService.getRunningTournaments(address)

  res.send(tournaments)
})

router.get('/tournaments/completed', async (req, res) => {
  const { address } = req.query

  const tournaments = await playerService.getCompletedTournaments(address)

  res.send(tournaments)
})

router.get('/participant', async (req, res) => {
  const { address, tournamentId } = req.query

  const player = await playerService.isParticipant(address, tournamentId)

  res.send(player)
})

module.exports = router