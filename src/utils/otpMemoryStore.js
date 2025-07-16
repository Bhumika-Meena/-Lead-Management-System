// Simple in-memory store: { userId: { otp, expiresAt, newEmail, newPassword } }
const otpStore = {};

exports.setOtp = (userId, data) => {
  otpStore[userId] = data;
};

exports.getOtp = (userId) => otpStore[userId];

exports.clearOtp = (userId) => {
  delete otpStore[userId];
}; 