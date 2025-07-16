const sequelize = require('./src/config/database');
const User = require('./src/models/User');
const Lead = require('./src/models/Lead');
const Activity = require('./src/models/Activity');

// Define associations (if not already in models)
User.hasMany(Lead, { foreignKey: 'assigned_to' });
Lead.belongsTo(User, { foreignKey: 'assigned_to' });

Lead.hasMany(Activity, { foreignKey: 'lead_id' });
Activity.belongsTo(Lead, { foreignKey: 'lead_id' });

User.hasMany(Activity, { foreignKey: 'created_by' });
Activity.belongsTo(User, { foreignKey: 'created_by' });

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established!');
    await sequelize.sync({ alter: true }); // Use { force: true } to drop and recreate tables
    console.log('All models were synchronized successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
})();