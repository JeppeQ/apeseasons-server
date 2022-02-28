const express = require('express')
const router = express.Router()
const updateService = require('../services/updateService')
const { createTask } = require('../helpers/tasks')

router.post('/tournaments', async (req, res) => {
  try {
    await updateService.updateAll()
    await createTask('/api/update/tournaments', 'update-tournaments', 15)
    res.send()
  } catch (ex) {
    console.log(ex)
    res.status(500).send()
  }
})

router.post('/tokens', async (req, res) => {
  try {
    await updateService.updateTokens()
    await createTask('/api/update/tokens', 'update-tokens', 15)
    res.send()
  } catch (ex) {
    console.log(ex)
    res.status(500).send()
  }
})

router.post('/finalize', async (req, res) => {
  try {
    await updateService.finalizeTournaments()
    await createTask('/api/update/finalize', 'finalize-tournaments', 15)
    res.send()
  } catch (ex) {
    console.log(ex)
    res.status(500).send()
  }
})

module.exports = router