const Joi = require('joi')

function validateRequest(req, key, fields, next) {
  const schema = Joi.object(fields)

  const options = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true
  }

  const { error, value } = schema.validate(req[key], options)

  if (error) {
    next(`Validation error: ${error.details.map(x => x.message).join(', ')}`)
  } else {
    req[key] = value
    next()
  }
}

const validatePost = async (req, res, next) => {
  let fields = {}

  switch (req.baseUrl + req.path) {
    case '/api/example':
      fields = {
        email: Joi.string().email().required()
      }
      break
  }

  validateRequest(req, 'body', fields, next)
}

const validateGet = async (req, res, next) => {
  let fields = {}

  switch (req.baseUrl + req.path) {
    case '/api/example':
      fields = {
        userId: Joi.string().required()
      }
      break
  }

  validateRequest(req, 'query', fields, next)
}

module.exports = {
  validatePost,
  validateGet
}