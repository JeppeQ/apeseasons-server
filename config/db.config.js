module.exports = {
    USER: "root",
    PASSWORD: process.env.DB_PASSWORD,
    DB: "prod",
    dialect: "mysql",
    pool: {
      max: 80,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      socketPath: ''
    }
  };