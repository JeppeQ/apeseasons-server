module.exports = (sequelize, Sequelize) => {
  const Holding = sequelize.define("holding", {
    playerId: { type: Sequelize.STRING, primaryKey: true },
    tokenAddress: { type: Sequelize.STRING, primaryKey: true },
    tokenName: { type: Sequelize.STRING },
    tokenSymbol: { type: Sequelize.STRING },
    amount: { type: Sequelize.BIGINT },
    amountFloat: { type: Sequelize.DOUBLE }
  });

  return Holding;
};