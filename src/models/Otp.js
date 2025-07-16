const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Otp = sequelize.define('Otp', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  otp: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('email_change', 'password_change'), allowNull: false },
  newEmail: { type: DataTypes.STRING, allowNull: true },
  newPassword: { type: DataTypes.STRING, allowNull: true },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  isUsed: { type: DataTypes.BOOLEAN, defaultValue: false }
});

module.exports = Otp; 