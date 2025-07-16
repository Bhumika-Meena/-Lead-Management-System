const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const authenticateToken = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { body, validationResult } = require('express-validator');

// All routes below require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/leads:
 *   post:
 *     summary: Create a new lead
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - lead_source
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               lead_source:
 *                 type: string
 *               status:
 *                 type: string
 *               assigned_to:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lead created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  roleMiddleware('admin', 'sales'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('lead_source').notEmpty().withMessage('Lead source is required')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  leadController.createLead
);

// Get all leads (admin: all, sales: only assigned)
/**
 * @swagger
 * /api/leads:
 *   get:
 *     summary: "Get all leads (admin: all, sales: only assigned)"
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: lead_source
 *         schema:
 *           type: string
 *         description: Filter by lead source
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search by name
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Search by email
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Results per page
 *     responses:
 *       200:
 *         description: List of leads
 */
router.get('/', roleMiddleware('admin', 'sales'), leadController.getLeads);

// Get a single lead by ID
/**
 * @swagger
 * /api/leads/{id}:
 *   get:
 *     summary: "Get a single lead by ID"
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lead ID
 *     responses:
 *       200:
 *         description: Lead details
 *       404:
 *         description: Lead not found
 */
router.get('/:id', roleMiddleware('admin', 'sales'), leadController.getLeadById);

// Update a lead
/**
 * @swagger
 * /api/leads/{id}:
 *   put:
 *     summary: "Update a lead"
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lead ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               lead_source:
 *                 type: string
 *               status:
 *                 type: string
 *               assigned_to:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lead updated successfully
 *       404:
 *         description: Lead not found
 */
router.put('/:id', roleMiddleware('admin', 'sales'), leadController.updateLead);

// Delete a lead
/**
 * @swagger
 * /api/leads/{id}:
 *   delete:
 *     summary : Delete a lead
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lead ID
 *     responses:
 *       200:
 *         description: Lead deleted successfully
 *       404:
 *         description: Lead not found
 */
router.delete('/:id', roleMiddleware('admin', 'sales'), leadController.deleteLead);

// Assign/Reassign a lead (admin only)
/**
 * @swagger
 * /api/leads/{id}/assign:
 *   put:
 *     summary: "Assign or reassign a lead to a sales rep (admin only)"
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lead ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assigned_to
 *             properties:
 *               assigned_to:
 *                 type: string
 *                 description: User ID of the sales rep
 *     responses:
 *       200:
 *         description: Lead assigned successfully
 *       404:
 *         description: Lead not found
 */
router.put('/:id/assign', roleMiddleware('admin'), leadController.assignLead);

module.exports = router;
