const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const authRoutes = require('./src/routes/auth');
app.use('/api/auth', authRoutes);

const authenticateToken = require('./src/middleware/authMiddleware');
const roleMiddleware = require('./src/middleware/roleMiddleware');

const leadRoutes = require('./src/routes/lead');
app.use('/api/leads', leadRoutes);

const activityRoutes = require('./src/routes/activity');
app.use('/api/leads/:leadId/activities', activityRoutes);

const otpRoutes = require('./src/routes/otp');
app.use('/api/otp', otpRoutes);

app.use('/api/users', require('./src/routes/users'));

app.get('/', (req, res) => {
  res.send('Lead Management System Backend API');
});

app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'You have accessed a protected route!',
    user: req.user
  });
});

app.get('/api/admin-only', authenticateToken, roleMiddleware('admin'), (req, res) => {
  res.json({ message: 'Hello Admin!' });
});

app.get('/api/sales-only', authenticateToken, roleMiddleware('sales'), (req, res) => {
  res.json({ message: 'Hello Sales Rep!' });
});

app.get('/api/both', authenticateToken, roleMiddleware('admin', 'sales'), (req, res) => {
  res.json({ message: 'Hello Admin or Sales Rep!' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 