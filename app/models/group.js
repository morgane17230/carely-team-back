const { DataTypes, Model } = require("sequelize");
const sequelize = require("../sequelize");

class Group extends Model {}

Group.init(
  {
    type: DataTypes.STRING,
    title: DataTypes.STRING,
    start_time: DataTypes.DATE,
    end_time: DataTypes.DATE,
    company_id: DataTypes.INTEGER,
  },
  {
    sequelize,
    tableName: "group",
  }
);

module.exports = Group;
