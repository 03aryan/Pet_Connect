const mongoose = require("mongoose");

const vetProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Vet user reference is required"],
      unique: true,
    },

    clinicName: {
      type: String,
      trim: true,
      maxlength: [120, "Clinic name cannot exceed 120 characters"],
      default: "",
    },

    specialty: {
      type: String,
      required: [true, "Specialty is required"],
      trim: true,
      maxlength: [100, "Specialty cannot exceed 100 characters"],
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [120, "Location cannot exceed 120 characters"],
    },

    experienceYears: {
      type: Number,
      min: [0, "Experience cannot be negative"],
      max: [60, "Experience looks invalid"],
      default: 0,
    },

    consultationFee: {
      type: Number,
      required: [true, "Consultation fee is required"],
      min: [0, "Consultation fee cannot be negative"],
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [1200, "Bio cannot exceed 1200 characters"],
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number cannot exceed 20 characters"],
      default: "",
    },

    languages: {
      type: [String],
      default: [],
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

vetProfileSchema.index({ specialty: 1, location: 1, available: 1 });
vetProfileSchema.index({ createdAt: -1 });

module.exports = mongoose.model("VetProfile", vetProfileSchema);
