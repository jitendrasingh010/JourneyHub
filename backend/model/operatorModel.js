const mongoose = require("mongoose");

const operatorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    agencyName: {
      type: String,
      required: true,
      trim: true,
    },

    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },

    businessPhone: {
      type: String,
      required: true,
    },

    businessEmail: {
      type: String,
      required: true,
      lowercase: true,
    },

    gstNumber: {
      type: String,
      default: null,
    },

    headOfficeAddress: {
      city: String,
      state: String,
      pincode: String,
      fullAddress: String,
    },

    verificationDocuments: [
      {
        type: String,
      }
    ],

    isApproved: {
      type: Boolean,
      default: false, 
    },
    
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "inactive",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Operator", operatorSchema);
