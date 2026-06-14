const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    profileImage: String,

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    dob: Date,

    role: {
      type: String,
      enum: [
        "user",
        "super_admin",
        "hotel_admin",
        "flight_admin",
        "bus_admin"
      ],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: Date,

    otp: {
      type: String,
      default: null,
    },

    otpExpire: {
      type: Date,
      default: null,
    },

    address: {
      city: String,
      state: String,
      country: String,
      pincode: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
