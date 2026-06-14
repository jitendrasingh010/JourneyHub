const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bookingType: {
      type: String,
      enum: ["hotel", "bus"],
      required: true,
    },

    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
    },

    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
    },

    bookingDate: {
      type: Date,
      default: Date.now,
    },

    journeyDate: {
      type: Date,
      required: true,
    },


    totalSeats: {
      type: Number,
      default: 1,
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Paid",
        "Failed",
        "Refunded"
      ],
      default: "Pending",
    },

    bookingStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Cancelled",
        "Completed"
      ],
      default: "Pending",
    },

    transactionId: {
      type: String,
    },

    specialRequest: {
      type: String,
    },

    cancellationReason: {
      type: String,
    },

  },
  {
    timestamps: true,
  },
  
);

module.exports = mongoose.model("Booking", bookingSchema);