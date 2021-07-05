const Company = require("./company");
const Group = require("./group");
const Message = require("./message");
const User = require("./user");
const GroupHasUsers = require("./group_has_users");

// Group table

Company.hasMany(Group, {
  as: "groups",
  foreignKey: "company_id",
});

Group.belongsTo(Company, {
  as: "company",
  foreignKey: "company_id",
});

// Company table

Company.hasMany(User, {
  as: "users",
  foreignKey: "company_id",
});

User.belongsTo(Company, {
  as: "company",
  foreignKey: "company_id",
})

// Message table

User.hasMany(Message, {
  as: "messages",
  foreignKey: "user_id",
});

Message.belongsTo(User, {
  as: "user",
  foreignKey: "user_id",
});

Group.hasMany(Message, {
  as: "messages",
  foreignKey: "group_id",
});

Message.belongsTo(Group, {
  as: "group",
  foreignKey: "group_id",
});

// Group_has_users table

User.belongsToMany(Group, {
  as: "groups",
  through: GroupHasUsers,
  foreignKey: "user_id",
  otherKey: "group_id",
  timestamps: false,
});

Group.belongsToMany(User, {
  as: "users",
  through: GroupHasUsers,
  foreignKey: "group_id",
  otherKey: "user_id",
  timestamps: false,
});

module.exports = { Company, Group, User, Message };
