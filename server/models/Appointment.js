const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },

    vet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Vet reference is required"],
    },

    vetProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VetProfile",
      default: null,
    },

    vetName: {
      type: String,
      required: [true, "Vet name is required"],
      trim: true,
      maxlength: [100, "Vet name cannot exceed 100 characters"],
    },

    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      default: null,
    },

    petName: {
      type: String,
      trim: true,
      maxlength: [60, "Pet name cannot exceed 60 characters"],
      default: "",
    },

    date: {
      type: Date,
      required: [true, "Appointment date is required"],
      validate: {
        validator: function (v) {
          // Date must be today or in the future
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return v >= today;
        },
        message: "Appointment date cannot be in the past",
      },
    },

    time: {
      type: String,
      required: [true, "Appointment time is required"],
      trim: true,
      match: [
        /^\d{1,2}:\d{2}\s?(AM|PM)$/i,
        'Time must be in format "H:MM AM/PM" (e.g., "9:00 AM")',
      ],
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "completed", "cancelled"],
        message: "Status must be pending, confirmed, completed, or cancelled",
      },
      default: "pending",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

/* ── Indexes ────────────────────────────────────── */
appointmentSchema.index({ user: 1, date: -1 });
appointmentSchema.index({ vet: 1, date: -1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
