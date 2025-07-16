const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lead Management System (LMS) API',
      version: '1.0.0',
      description: 'API documentation for the LMS backend.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Unique user identifier (UUID)' },
            name: { type: 'string', description: 'Full name of the user' },
            email: { type: 'string', description: 'User email address (must be unique)' },
            password: { type: 'string', description: 'Hashed user password' },
            role: { type: 'string', enum: ['admin', 'sales'], description: 'User role (admin or sales)' }
          }
        },
        Lead: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Unique lead identifier (UUID)' },
            name: { type: 'string', description: 'Lead full name' },
            email: { type: 'string', description: 'Lead email address' },
            phone: { type: 'string', description: 'Lead phone number' },
            lead_source: { type: 'string', description: 'Source of the lead (e.g., Website, Referral)' },
            status: { type: 'string', enum: ['New', 'Contacted', 'Qualified', 'Disqualified', 'Converted'], description: 'Current status of the lead' },
            assigned_to: { type: 'string', format: 'uuid', description: 'User ID of the assigned sales rep' },
            created_at: { type: 'string', format: 'date-time', description: 'Lead creation timestamp' },
            updated_at: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
          }
        },
        Activity: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Unique activity identifier (UUID)' },
            lead_id: { type: 'string', format: 'uuid', description: 'ID of the lead this activity is linked to' },
            type: { type: 'string', enum: ['Call', 'Email', 'Meeting', 'Note'], description: 'Type of activity' },
            description: { type: 'string', description: 'Details about the activity' },
            created_by: { type: 'string', format: 'uuid', description: 'User ID of the creator' },
            created_at: { type: 'string', format: 'date-time', description: 'Activity creation timestamp' }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
