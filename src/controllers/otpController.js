const User = require('../models/User');
const { generateOtp, hashPassword } = require('../utils/otp');
const { sendOtpEmail } = require('../utils/email');
const jwt = require('jsonwebtoken');
const otpMemoryStore = require('../utils/otpMemoryStore');

const OTP_EXPIRY_MINUTES = 10;
const OTP_JWT_SECRET = process.env.OTP_JWT_SECRET || 'otp_secret';

exports.requestEmailChange = async (req, res) => {
  const { email } = req.body;
  const user = await User.findByPk(req.user.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const otp = generateOtp();
  const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;
  otpMemoryStore.setOtp(user.id, { otp, expiresAt, newEmail: email });

  await sendOtpEmail(user.email, otp, 'email_change'); // Send to old email for security

  // Issue a short-lived JWT containing the OTP info (but not the OTP itself)
  const otpToken = jwt.sign(
    { userId: user.id, expiresAt, newEmail: email, type: 'email_change' },
    OTP_JWT_SECRET,
    { expiresIn: `${OTP_EXPIRY_MINUTES}m` }
  );

  res.json({ message: 'OTP sent to your current email', otpToken });
};

exports.confirmEmailChange = async (req, res) => {
  const { otp, otpToken } = req.body;
  let payload;
  try {
    payload = jwt.verify(otpToken, OTP_JWT_SECRET);
  } catch {
    return res.status(400).json({ message: 'Invalid or expired OTP token' });
  }
  const { userId, expiresAt, newEmail } = payload;
  const store = otpMemoryStore.getOtp(userId);
  if (!store || store.otp !== otp || store.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }
  const user = await User.findByPk(userId);
  user.email = newEmail;
  await user.save();
  otpMemoryStore.clearOtp(userId);
  res.json({ message: 'Email updated successfully', user });
};

exports.requestPasswordChange = async (req, res) => {
  const { newPassword } = req.body;
  const user = await User.findByPk(req.user.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const otp = generateOtp();
  const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;
  const hashed = await hashPassword(newPassword);
  otpMemoryStore.setOtp(user.id, { otp, expiresAt, newPassword: hashed });

  await sendOtpEmail(user.email, otp, 'password_change');

  const otpToken = jwt.sign(
    { userId: user.id, expiresAt, type: 'password_change' },
    OTP_JWT_SECRET,
    { expiresIn: `${OTP_EXPIRY_MINUTES}m` }
  );

  res.json({ message: 'OTP sent to your email', otpToken });
};

exports.confirmPasswordChange = async (req, res) => {
  const { otp, otpToken } = req.body;
  let payload;
  try {
    payload = jwt.verify(otpToken, OTP_JWT_SECRET);
  } catch {
    return res.status(400).json({ message: 'Invalid or expired OTP token' });
  }
  const { userId } = payload;
  const store = otpMemoryStore.getOtp(userId);
  if (!store || store.otp !== otp || store.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }
  const user = await User.findByPk(userId);
  user.password = store.newPassword;
  await user.save();
  otpMemoryStore.clearOtp(userId);
  res.json({ message: 'Password updated successfully' });
}; 