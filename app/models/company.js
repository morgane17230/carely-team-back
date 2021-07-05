const { DataTypes, Model } = require("sequelize");
const sequelize = require("../sequelize");

class Company extends Model {}

Company.init(
  {
    finess: DataTypes.TEXT,
    name: DataTypes.STRING,
    num: DataTypes.INTEGER,
    type: DataTypes.STRING,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
  },
  {
    sequelize,
    tableName: "company",
  }
);

module.exports = Company;
