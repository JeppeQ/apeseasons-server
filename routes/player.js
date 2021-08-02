const express = require('express')
const router = express.Router()
const { getUpcomingTournaments, getRunningTournaments, getCompletedTournaments } = require('../services/playerService')

router.get('/tournaments/upcoming', async (req, res) => {
  const { address } = req.query
  
  const tournaments = await getUpcomingTournaments(address)

  res.send(tournaments)
})

router.get('/tournaments/running', async (req, res) => {
  const { address } = req.query

  const tournaments = await getRunningTournaments(address)

  res.send(tournaments)
})

router.get('/tournaments/completed', async (req, res) => {
  const { address } = req.query

  const tournaments = await getCompletedTournaments(address)

  res.send(tournaments)
})

module.exports = router