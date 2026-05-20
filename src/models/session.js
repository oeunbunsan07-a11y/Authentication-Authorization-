const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,

  refreshToken: String,

  userAgent: String,

  ipAddress: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Session", sessionSchema);
