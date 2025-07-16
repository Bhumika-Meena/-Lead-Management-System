const crypto = require('crypto');

exports.generateOtp = () => (Math.floor(100000 + Math.random() * 900000)).toString();
exports.hashPassword = (password) => require('bcryptjs').hash(password, 10);
exports.comparePassword = (password, hash) => require('bcryptjs').compare(password, hash); 