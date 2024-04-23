const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    
    email: { type: String, required: true, unique: true },
    
    code: { type: String }// Array of group codes
});

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;


