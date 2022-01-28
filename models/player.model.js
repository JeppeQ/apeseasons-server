module.exports = (sequelize, Sequelize) => {
  const Player = sequelize.define("player", {
    id: { type: Sequelize.STRING, primaryKey: true },
    tournamentId: { type: Sequelize.STRING },
    address: { type: Sequelize.STRING },
    netWorth: { type: Sequelize.DOUBLE(18, 2) },
    rank: { type: Sequelize.INTEGER },
    prize: { type: Sequelize.DOUBLE(18, 2) },
    prizeStatus: { type: Sequelize.STRING, defaultValue: 'unclaimed' },
    rewardAmount: { type: Sequelize.BIGINT },
  });

  return Player;
};