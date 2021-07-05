const express = require('express')
const router = express.Router()
const { example } = require('../services/exampleService')
const { exampleInterface } = require('../interfaces/exampleInterface')

router.get('/', async (req, res) => {
  const data = await example(res.locals.user.id)

  const interface = exampleInterface(data)

  res.send(interface)
})

module.exports = router