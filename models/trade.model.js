module.exports = (sequelize, Sequelize) => {
  const Trade = sequelize.define("trade", {
    id: { type: Sequelize.STRING, primaryKey: true },
    playerId: { type: Sequelize.STRING },
    from: { type: Sequelize.STRING },
    to: { type: Sequelize.STRING },
    fromAmount: { type: Sequelize.DOUBLE },
    toAmount: { type: Sequelize.DOUBLE },
    timestamp: { type: Sequelize.STRING }
  });

  return Trade;
};