const mongoose = require("mongoose");
const OTPSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Number,
    required: true,
  },
  expiresAt: {
    type: Number,
    required: true,
  },
});

const OTP = mongoose.model("OTP", OTPSchema);
exports.OTP = OTP;
