# apeseasons-server

module.exports = {
    HOST: "localhost",
    PORT: 3306,
    USER: "root",
    PASSWORD: "",
    DB: "",
    dialect: "mysql",
    pool: {
      max: 80,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };