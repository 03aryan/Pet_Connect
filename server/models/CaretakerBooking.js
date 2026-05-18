const mongoose = require("mongoose");

const caretakerBookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Pet owner reference is required"],
    },

    caretaker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Caretaker user reference is required"],
    },

    caretakerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caretaker",
      required: [true, "Caretaker profile reference is required"],
    },

    caretakerName: {
      type: String,
      trim: true,
      default: "",
    },

    petName: {
      type: String,
      required: [true, "Pet name is required"],
      trim: true,
      maxlength: [80, "Pet name cannot exceed 80 characters"],
    },

    petSpecies: {
      type: String,
      required: [true, "Pet species is required"],
      enum: ["dog", "cat", "rabbit", "bird", "other"],
      default: "dog",
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },

    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [600, "Notes cannot exceed 600 characters"],
      default: "",
    },

    totalPrice: {
      type: Number,
      min: [0, "Total price cannot be negative"],
      default: 0,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

caretakerBookingSchema.index({ user: 1, status: 1 });
caretakerBookingSchema.index({ caretaker: 1, status: 1 });
caretakerBookingSchema.index({ startDate: 1 });

module.exports = mongoose.model("CaretakerBooking", caretakerBookingSchema);
