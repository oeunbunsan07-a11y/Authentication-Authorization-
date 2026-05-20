const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      unique: true,
    },

    password: String,

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: String,

    resetPasswordToken: String,

    refreshToken: String,

    googleId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
