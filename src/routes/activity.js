const express = require('express');
const router = express.Router({ mergeParams: true });
const activityController = require('../controllers/activityController');
const authenticateToken = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { body, validationResult } = require('express-validator');

// All activity routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/leads/{leadId}/activities:
 *   post:
 *     summary: Add an activity/note to a lead
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leadId
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
 *               - type
 *               - description
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [Call, Email, Meeting, Note]
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Activity added successfully
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  roleMiddleware('admin', 'sales'),
  [
    body('type').notEmpty().withMessage('Type is required'),
    body('description').notEmpty().withMessage('Description is required')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  activityController.addActivity
);

// Get all activities for a lead (admin or sales)
router.get('/', roleMiddleware('admin', 'sales'), activityController.getActivities);

router.delete('/:activityId', activityController.deleteActivity);

router.put('/:activityId', activityController.updateActivity);

module.exports = router;
