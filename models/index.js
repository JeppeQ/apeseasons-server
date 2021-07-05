const dbConfig = process.env.NODE_ENV === 'production' ? require("../config/db.config.js") : require("../config/db.local.config.js")

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: dbConfig.dialect,
  logging: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  },
  dialectOptions: dbConfig.dialectOptions
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Tables
db.example = require('./example.model.js')(sequelize, Sequelize);

// Associations

module.exports = db;