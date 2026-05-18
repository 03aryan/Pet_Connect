const mongoose = require("mongoose");

const caretakerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Caretaker user reference is required"],
      unique: true,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [1200, "Bio cannot exceed 1200 characters"],
      default: "",
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [120, "Location cannot exceed 120 characters"],
    },

    phone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone cannot exceed 20 characters"],
      default: "",
    },

    pricePerDay: {
      type: Number,
      required: [true, "Price per day is required"],
      min: [0, "Price cannot be negative"],
    },

    petsAccepted: {
      type: [String],
      enum: ["dog", "cat", "rabbit", "bird", "other"],
      default: ["dog", "cat"],
    },

    experienceYears: {
      type: Number,
      min: [0, "Experience cannot be negative"],
      max: [60, "Experience looks invalid"],
      default: 0,
    },

    available: {
      type: Boolean,
      default: true,
    },

    ratingAverage: {
      type: Number,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
      default: 0,
    },

    ratingCount: {
      type: Number,
      min: [0, "Rating count cannot be negative"],
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

caretakerSchema.index({ location: 1, available: 1 });
caretakerSchema.index({ pricePerDay: 1 });
caretakerSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Caretaker", caretakerSchema);
