const express = require('express')
const router = express.Router()
const { updateAll, updateTokens } = require('../services/updateService')

router.get('/tournaments', async (req, res) => {
  try {
    await updateAll()
    await createTask('/api/update/tournaments', 'update-tournaments', 15)
    res.send()
  } catch (ex) {
    console.log(ex)
    res.status(500).send()
  }
})

router.get('/tokens', async (req, res) => {
  try {
    await updateTokens()
    await createTask('/api/update/tokens', 'update-tokens', 15)
    res.send()
  } catch (ex) {
    console.log(ex)
    res.status(500).send()
  }
})

module.exports = router