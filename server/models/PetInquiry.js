const mongoose = require("mongoose");

const petInquirySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner reference is required"],
    },

    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: [true, "Pet reference is required"],
    },

    type: {
      type: String,
      enum: {
        values: ["buy", "rent"],
        message: "Type must be buy or rent",
      },
      required: [true, "Inquiry type is required"],
    },

    startDate: {
      type: Date,
      default: null,
    },

    days: {
      type: Number,
      min: [1, "Days must be at least 1"],
      max: [30, "Days cannot exceed 30"],
      default: null,
    },

    contactPhone: {
      type: String,
      trim: true,
      maxlength: [20, "Contact phone cannot exceed 20 characters"],
      default: "",
    },

    message: {
      type: String,
      trim: true,
      maxlength: [600, "Message cannot exceed 600 characters"],
      default: "",
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "accepted", "rejected", "cancelled", "completed"],
        message: "Invalid inquiry status",
      },
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

petInquirySchema.index({ user: 1, createdAt: -1 });
petInquirySchema.index({ owner: 1, status: 1, createdAt: -1 });
petInquirySchema.index({ pet: 1, status: 1 });

module.exports = mongoose.model("PetInquiry", petInquirySchema);
