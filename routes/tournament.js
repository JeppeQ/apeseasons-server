const express = require('express')
const { playerInterface } = require('../interfaces/tournamentInterface')
const router = express.Router()
const { getUpcoming, getRunning, getPlayers } = require('../services/tournamentService')

router.get('/upcoming', async (req, res) => {
  const tournaments = await getUpcoming()

  res.send(tournaments)
})

router.get('/running', async (req, res) => {
  const tournaments = await getRunning()

  res.send(tournaments)
})

router.get('/players', async (req, res) => {
  const { tournamentId } = req.query

  const players = await getPlayers(tournamentId)

  const interface = playerInterface(players)
  res.send(interface)
})

module.exports = router