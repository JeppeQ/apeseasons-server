module.exports = (sequelize, Sequelize) => {
  const Tournament = sequelize.define("tournament", {
    id: { type: Sequelize.STRING, primaryKey: true },
    name: { type: Sequelize.STRING },
    startBlock: { type: Sequelize.BIGINT },
    endBlock: { type: Sequelize.BIGINT },
    startTime: { type: Sequelize.BIGINT },
    endTime: { type: Sequelize.BIGINT },
    ticketToken: { type: Sequelize.STRING },
    ticketTokenSymbol: { type: Sequelize.STRING },
    ticketPrice: { type: Sequelize.BIGINT },
    ticketPriceFloat: { type: Sequelize.DOUBLE },
    playerCount: { type: Sequelize.INTEGER },
    prizePool: { type: Sequelize.DOUBLE(18, 2) },
    placesPaid: { type: Sequelize.INTEGER },
    prizeStructure: { type: Sequelize.STRING, defaultValue: 'STANDARD' }, // STANDARD, etc
    finalized: { type: Sequelize.BOOLEAN, defaultValue: false }
  });

  return Tournament;
};