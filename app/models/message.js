const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');

class Message extends Model {};

Message.init({
    content: DataTypes.TEXT,
    group_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
}, {
    sequelize,
    tableName: 'message',
});

module.exports = Message;