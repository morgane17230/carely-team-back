const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

// Using "sequelize.define" it automatically manages the name internally and adds "s" at the end to reference the relation table
const GroupHasUsers = sequelize.define('group_has_user', {
  role: DataTypes.TEXT
}, { timestamps: false });

module.exports = GroupHasUsers;