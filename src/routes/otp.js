const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/request-email-change', authMiddleware, otpController.requestEmailChange);
router.post('/confirm-email-change', authMiddleware, otpController.confirmEmailChange);
router.post('/request-password-change', authMiddleware, otpController.requestPasswordChange);
router.post('/confirm-password-change', authMiddleware, otpController.confirmPasswordChange);

module.exports = router; 