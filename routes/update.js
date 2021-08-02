const express = require('express')
const router = express.Router()
const { example } = require('../services/exampleService')
const { exampleInterface } = require('../interfaces/exampleInterface')

router.get('/all', async (req, res) => {
  const data = await example(res.locals.user.id)

  const interface = exampleInterface(data)

  res.send(interface)
})

router.get('/:id', async (req, res) => {

})

router.get('/players', async (req, res) => {

  
})

module.exports = router