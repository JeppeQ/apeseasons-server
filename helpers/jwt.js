const expressJwt = require('express-jwt')
const jwt = require('jsonwebtoken')

useJwt = () => {
  return expressJwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'], resultProperty: 'locals.user' }).unless({
    path: [
      '/api/auth/google'
    ]
  });
}

generateJwt = (userId) => {
  const token = jwt.sign({
    id: userId
  }, process.env.JWT_SECRET)

  return token
}

module.exports = {
  useJwt,
  generateJwt
}