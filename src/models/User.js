const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'sales'),
    allowNull: false,
    defaultValue: 'sales',
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'Users', key: 'id' }
  }
});

// Register the self-association directly
User.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

module.exports = User; 