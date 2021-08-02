const express = require('express')
const router = express.Router()
const { getTokens } = require('../services/tokenService')

router.get('/all', async (req, res) => {
  const tokens = await getTokens()

  res.send(tokens)
})

module.exports = router