const express = require('express')
const router = express.Router()
const { updateAll, updateTokens } = require('../services/updateService')

router.get('/tournaments', async (req, res) => {
  try {
    await updateAll()
    res.send()
  } catch (ex) {
    console.log(ex)
    res.status(500).send()
  }
})

router.get('/tokens', async (req, res) => {
  try {
    await updateTokens()
    res.send()
  } catch (ex) {
    console.log(ex)
    res.status(500).send()
  }
})

module.exports = router