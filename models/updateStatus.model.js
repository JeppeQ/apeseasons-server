module.exports = (sequelize, Sequelize) => {
  const UpdateStatus = sequelize.define("update_status", {
    entity: { type: Sequelize.STRING, primaryKey: true },
    block: { type: Sequelize.BIGINT },
  }, {
    freezeTableName: true
  });

  return UpdateStatus;
};