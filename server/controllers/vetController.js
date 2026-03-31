const Appointment = require("../models/Appointment");
const VetProfile = require("../models/VetProfile");

const escapeRegExp = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toRegex = (value) => new RegExp(escapeRegExp(value.trim()), "i");

const parseLanguages = (languages) => {
  if (!languages) return [];

  if (Array.isArray(languages)) {
    return languages.map((entry) => String(entry).trim()).filter(Boolean);
  }

  if (typeof languages === "string") {
    return languages
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
};

const ensureVetRole = (req, res) => {
  if (req.user.role !== "vet") {
    res
      .status(403)
      .json({ message: "Only vet accounts can access this resource" });
    return false;
  }

  return true;
};

/* ── GET /api/vets  (public) ───────────────────── */
exports.getAllVets = async (req, res, next) => {
  try {
    const {
      q,
      specialty,
      location,
      available,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};
    if (specialty) filter.specialty = toRegex(specialty);
    if (location) filter.location = toRegex(location);
    if (available === "true" || available === "false") {
      filter.available = available === "true";
    }

    if (q) {
      const queryRegex = toRegex(q);
      filter.$or = [
        { clinicName: queryRegex },
        { specialty: queryRegex },
        { location: queryRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [vets, total] = await Promise.all([
      VetProfile.find(filter)
        .sort({ available: -1, ratingAverage: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("user", "name email role")
        .lean(),
      VetProfile.countDocuments(filter),
    ]);

    res.json({
      vets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/vets/:id  (public) ───────────────── */
exports.getVetById = async (req, res, next) => {
  try {
    const vet = await VetProfile.findById(req.params.id)
      .populate("user", "name email role createdAt")
      .lean();

    if (!vet) {
      return res.status(404).json({ message: "Vet profile not found" });
    }

    res.json({ vet });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Vet profile not found" });
    }
    next(err);
  }
};

/* ── POST /api/vets/profile  (protected) ───────── */
exports.upsertMyVetProfile = async (req, res, next) => {
  try {
    const {
      clinicName = "",
      specialty,
      location,
      consultationFee,
      experienceYears = 0,
      bio = "",
      phone = "",
      available = true,
      languages,
    } = req.body;

    const updateData = {
      clinicName,
      specialty,
      location,
      consultationFee,
      experienceYears,
      bio,
      phone,
      available,
      languages: parseLanguages(languages),
    };

    const existing = await VetProfile.findOne({ user: req.user._id });

    let vet;
    if (existing) {
      vet = await VetProfile.findOneAndUpdate(
        { user: req.user._id },
        updateData,
        {
          new: true,
          runValidators: true,
        },
      ).populate("user", "name email role");
    } else {
      vet = await VetProfile.create({ user: req.user._id, ...updateData });
      await vet.populate("user", "name email role");
    }

    if (req.user.role !== "vet") {
      req.user.role = "vet";
      await req.user.save();
    }

    res.status(existing ? 200 : 201).json({
      message: existing ? "Vet profile updated" : "Vet profile created",
      vet,
    });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/vets/me/profile  (protected) ─────── */
exports.getMyVetProfile = async (req, res, next) => {
  try {
    if (!ensureVetRole(req, res)) return;

    const vet = await VetProfile.findOne({ user: req.user._id })
      .populate("user", "name email role")
      .lean();

    if (!vet) {
      return res
        .status(404)
        .json({
          message: "Vet profile not found. Please complete onboarding.",
        });
    }

    res.json({ vet });
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/vets/book  (protected) ───────────── */
exports.bookAppointment = async (req, res, next) => {
  try {
    const { vetId, petName, date, time, notes } = req.body;

    if (!vetId || !date || !time) {
      return res
        .status(400)
        .json({ message: "vetId, date, and time are required" });
    }

    const vetProfile = await VetProfile.findById(vetId).populate(
      "user",
      "name email role",
    );
    if (!vetProfile || !vetProfile.user) {
      return res.status(404).json({ message: "Selected vet not found" });
    }

    if (!vetProfile.available) {
      return res
        .status(400)
        .json({ message: "This vet is currently unavailable" });
    }

    const bookingDate = new Date(date);
    if (Number.isNaN(bookingDate.getTime())) {
      return res.status(400).json({ message: "Invalid booking date" });
    }

    // Check for duplicate booking (same user, same vet, same date+time)
    const duplicate = await Appointment.findOne({
      user: req.user._id,
      vet: vetProfile.user._id,
      date: bookingDate,
      time,
      status: { $nin: ["cancelled"] },
    });

    if (duplicate) {
      return res.status(409).json({
        message:
          "You already have a booking with this vet at that date and time",
      });
    }

    const appointment = await Appointment.create({
      user: req.user._id,
      vet: vetProfile.user._id,
      vetProfile: vetProfile._id,
      vetName: vetProfile.user.name,
      petName,
      date: bookingDate,
      time,
      notes,
    });

    await appointment.populate([
      { path: "user", select: "name email role" },
      { path: "vet", select: "name email role" },
      {
        path: "vetProfile",
        select: "specialty location consultationFee available",
      },
    ]);

    res.status(201).json({ message: "Appointment booked", appointment });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/vets/appointments  (protected) ────── */
exports.getMyAppointments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { user: req.user._id };
    if (
      status &&
      ["pending", "confirmed", "completed", "cancelled"].includes(status)
    ) {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate("vet", "name email role")
        .populate("vetProfile", "specialty location consultationFee")
        .sort({ date: -1, time: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Appointment.countDocuments(filter),
    ]);

    res.json({
      appointments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/vets/appointments/:id/cancel  (protected) */
exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status === "cancelled") {
      return res
        .status(400)
        .json({ message: "Appointment is already cancelled" });
    }

    if (appointment.status === "completed") {
      return res
        .status(400)
        .json({ message: "Cannot cancel a completed appointment" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.json({ message: "Appointment cancelled", appointment });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Appointment not found" });
    }
    next(err);
  }
};

/* ── GET /api/vets/me/appointments  (protected, vet only) */
exports.getVetAppointments = async (req, res, next) => {
  try {
    if (!ensureVetRole(req, res)) return;

    const { status, page = 1, limit = 20 } = req.query;

    const filter = { vet: req.user._id };
    if (
      status &&
      ["pending", "confirmed", "completed", "cancelled"].includes(status)
    ) {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate("user", "name email role")
        .populate("vetProfile", "specialty location consultationFee")
        .sort({ date: 1, time: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Appointment.countDocuments(filter),
    ]);

    res.json({
      appointments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/vets/appointments/:id/status  (protected, vet only) */
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    if (!ensureVetRole(req, res)) return;

    const { status } = req.body;
    const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res
        .status(400)
        .json({
          message: `Status must be one of: ${allowedStatuses.join(", ")}`,
        });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      vet: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status === "completed" && status !== "completed") {
      return res
        .status(400)
        .json({ message: "Completed appointments cannot be moved back" });
    }

    appointment.status = status;
    await appointment.save();

    await appointment.populate([
      { path: "user", select: "name email role" },
      { path: "vet", select: "name email role" },
      { path: "vetProfile", select: "specialty location consultationFee" },
    ]);

    res.json({ message: "Appointment status updated", appointment });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Appointment not found" });
    }
    next(err);
  }
};
