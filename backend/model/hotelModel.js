
const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    hotelName: {
      type: String,
      required: true,
      trim: true,
    },

    hotelType: {
      type: String,
      enum: ["hotel", "resort", "villa"],
      default: "hotel",
    },

    description: {
      type: String,
      required: true,
    },

    location: {
      address: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
      latitude: Number,
      longitude: Number,
    },

    contactNumber: {
      type: String,
      required: true,
    },

    email: {
      type: String,
    },

    pricePerNight: {
      type: Number,
      required: true,
    },

    totalRooms: {
      type: Number,
      required: true,
    },

    availableRooms: {
      type: Number,
      required: true,
    },

    amenities: [
      {
        type: String,
      },
    ],

    images: [
      {
        type: String,
      },
    ],

    rating: {
      type: Number,
      default: 0,
    },

    reviewsCount: {
      type: Number,
      default: 0,
    },

    checkInTime: {
      type: String,
      default: "12:00 PM",
    },

    checkOutTime: {
      type: String,
      default: "11:00 AM",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    approvalStatus: {
      status: {
        type: Boolean,
        default: false,
      },
      message: {
        type: String,
        default: "Pending for approval",
      },
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Hotel", hotelSchema);


