module.exports = (sequelize, Sequelize) => {
  const Example = sequelize.define("example", {
    id: { type: Sequelize.STRING, primaryKey: true },
    name: { type: Sequelize.STRING, primaryKey: true },
    storage: { type: Sequelize.STRING },
  });

  return Example;
};