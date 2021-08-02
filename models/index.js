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
db.updateStatus = require('./updateStatus.model.js')(sequelize, Sequelize)
db.token = require('./token.model.js')(sequelize, Sequelize)
db.tournament = require('./tournament.model.js')(sequelize, Sequelize)
db.player = require('./player.model.js')(sequelize, Sequelize)
db.holding = require('./holding.model.js')(sequelize, Sequelize)
db.trade = require('./trade.model.js')(sequelize, Sequelize)

// Associations
db.tournament.hasMany(db.player)
db.player.belongsTo(db.tournament)

db.player.hasMany(db.holding)
db.player.hasMany(db.trade)

db.holding.belongsTo(db.player)
db.trade.belongsTo(db.player)

module.exports = db;