
const mongoose = require("mongoose");

const busSchema = new mongoose.Schema(
  {
    busName: {
      type: String,
      required: true,
      trim: true,
    },
    busNumber: {
      type: String,
      required: true,
      unique: true,
    },
    operatorName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Operator",
    },

    busType: {
      type: String,
      enum: [
        "AC Sleeper",
        "Non AC Sleeper",
        "AC Seater",
        "Non AC Seater",
        "Volvo",
        "Luxury"
      ],
      required: true,
    },

    fromCityID : {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },

    toCityID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    duration: {
      type: String,
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    availableSeats: {
      type: Number,
      required: true,
    },

    fare: {
      type: Number,
      required: true,
    },
    amenities: [
      {
        type: String,
      },
    ],
    boardingPoints: [
      {
        name: String,
        address: String,
        time: String,
      },
    ],
    droppingPoints: [
      {
        name: String,
        address: String,
        time: String,
      },
    ],

    rating: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    managedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
        images: [
        {
            type: String,
        },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bus", busSchema);
