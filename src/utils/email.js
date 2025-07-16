const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendOtpEmail = async (to, otp, type) => {
  const subject = type === 'email_change' ? 'Email Change OTP' : 'Password Change OTP';
  const text = `Your OTP is: ${otp}`;
  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
}; 