module.exports = (sequelize, Sequelize) => {
  const Tokens = sequelize.define("token", {
    address: { type: Sequelize.STRING, primaryKey: true },
    network: { type: Sequelize.STRING, primaryKey: true },
    coingeckoId: { type: Sequelize.STRING },
    symbol: { type: Sequelize.STRING },
    name: { type: Sequelize.STRING },
    price: { type: Sequelize.DOUBLE },
    decimals: { type: Sequelize.INTEGER },
    priceChangeDay: { type: Sequelize.FLOAT(6, 1) }
  });

  return Tokens;
};