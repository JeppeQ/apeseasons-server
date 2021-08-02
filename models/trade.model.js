module.exports = (sequelize, Sequelize) => {
  const Trade = sequelize.define("trade", {
    id: { type: Sequelize.STRING, primaryKey: true },
    playerId: { type: Sequelize.STRING },
    from: { type: Sequelize.STRING },
    to: { type: Sequelize.STRING },
    amountFrom: { type: Sequelize.DOUBLE },
    amountTo: { type: Sequelize.DOUBLE },
    timestamp: { type: Sequelize.STRING }
  });

  return Trade;
};