const Caretaker = require("../models/Caretaker");
const CaretakerBooking = require("../models/CaretakerBooking");

const escapeRegExp = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const toRegex = (value) => new RegExp(escapeRegExp(value.trim()), "i");

/* ── GET /api/caretakers  (public) ─────────────── */
exports.getAllCaretakers = async (req, res, next) => {
  try {
    const {
      q,
      location,
      species,
      available,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};
    if (location) filter.location = toRegex(location);
    if (species) filter.petsAccepted = species.toLowerCase();
    if (available === "true" || available === "false") {
      filter.available = available === "true";
    }
    if (q) {
      const r = toRegex(q);
      filter.$or = [{ location: r }, { bio: r }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [caretakers, total] = await Promise.all([
      Caretaker.find(filter)
        .sort({ available: -1, ratingAverage: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("user", "name email")
        .lean(),
      Caretaker.countDocuments(filter),
    ]);

    res.json({
      caretakers,
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

/* ── GET /api/caretakers/:id  (public) ─────────── */
exports.getCaretakerById = async (req, res, next) => {
  try {
    const caretaker = await Caretaker.findById(req.params.id)
      .populate("user", "name email createdAt")
      .lean();

    if (!caretaker) {
      return res.status(404).json({ message: "Caretaker profile not found" });
    }

    res.json({ caretaker });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Caretaker profile not found" });
    }
    next(err);
  }
};

/* ── POST /api/caretakers/profile  (protected) ─── */
exports.upsertMyProfile = async (req, res, next) => {
  try {
    const {
      bio = "",
      location,
      phone = "",
      pricePerDay,
      petsAccepted,
      experienceYears = 0,
      available = true,
    } = req.body;

    const updateData = {
      bio,
      location,
      phone,
      pricePerDay: Number(pricePerDay),
      petsAccepted: Array.isArray(petsAccepted)
        ? petsAccepted
        : typeof petsAccepted === "string"
          ? petsAccepted.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
          : ["dog", "cat"],
      experienceYears: Number(experienceYears || 0),
      available,
    };

    const existing = await Caretaker.findOne({ user: req.user._id });

    let caretaker;
    if (existing) {
      caretaker = await Caretaker.findOneAndUpdate(
        { user: req.user._id },
        updateData,
        { new: true, runValidators: true },
      ).populate("user", "name email");
    } else {
      caretaker = await Caretaker.create({ user: req.user._id, ...updateData });
      await caretaker.populate("user", "name email");
    }

    res.status(existing ? 200 : 201).json({
      message: existing ? "Caretaker profile updated" : "Caretaker profile created",
      caretaker,
    });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/caretakers/me/profile  (protected) ─ */
exports.getMyProfile = async (req, res, next) => {
  try {
    const caretaker = await Caretaker.findOne({ user: req.user._id })
      .populate("user", "name email")
      .lean();

    if (!caretaker) {
      return res.status(404).json({ message: "Caretaker profile not found" });
    }

    res.json({ caretaker });
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/caretakers/book  (protected) ─────── */
exports.bookCaretaker = async (req, res, next) => {
  try {
    const { caretakerId, petName, petSpecies, startDate, endDate, notes } =
      req.body;

    if (!caretakerId || !startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "caretakerId, startDate, and endDate are required" });
    }

    const profile = await Caretaker.findById(caretakerId).populate(
      "user",
      "name email",
    );
    if (!profile || !profile.user) {
      return res.status(404).json({ message: "Caretaker not found" });
    }

    if (!profile.available) {
      return res
        .status(400)
        .json({ message: "This caretaker is currently unavailable" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid dates provided" });
    }

    if (end <= start) {
      return res
        .status(400)
        .json({ message: "End date must be after start date" });
    }

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = days * profile.pricePerDay;

    const booking = await CaretakerBooking.create({
      user: req.user._id,
      caretaker: profile.user._id,
      caretakerProfile: profile._id,
      caretakerName: profile.user.name,
      petName,
      petSpecies: petSpecies || "dog",
      startDate: start,
      endDate: end,
      notes,
      totalPrice,
    });

    await booking.populate([
      { path: "user", select: "name email" },
      { path: "caretaker", select: "name email" },
    ]);

    res.status(201).json({ message: "Booking created", booking });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/caretakers/me/bookings  (protected) ─ */
exports.getMyBookings = async (req, res, next) => {
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

    const [bookings, total] = await Promise.all([
      CaretakerBooking.find(filter)
        .populate("caretaker", "name email")
        .populate("caretakerProfile", "location pricePerDay petsAccepted")
        .sort({ startDate: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      CaretakerBooking.countDocuments(filter),
    ]);

    res.json({
      bookings,
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

/* ── PATCH /api/caretakers/bookings/:id/cancel (protected) */
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await CaretakerBooking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    if (booking.status === "completed") {
      return res
        .status(400)
        .json({ message: "Cannot cancel a completed booking" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled", booking });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Booking not found" });
    }
    next(err);
  }
};

/* ── GET /api/caretakers/me/incoming-bookings (protected) */
exports.getCaretakerBookings = async (req, res, next) => {
  try {
    const myProfile = await Caretaker.findOne({ user: req.user._id }).lean();
    if (!myProfile) {
      return res
        .status(404)
        .json({ message: "You don't have a caretaker profile yet" });
    }

    const { status, page = 1, limit = 20 } = req.query;

    const filter = { caretaker: req.user._id };
    if (
      status &&
      ["pending", "confirmed", "completed", "cancelled"].includes(status)
    ) {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      CaretakerBooking.find(filter)
        .populate("user", "name email")
        .sort({ startDate: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      CaretakerBooking.countDocuments(filter),
    ]);

    res.json({
      bookings,
      pagination: { page: pageNum, limit: limitNum, total },
    });
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/caretakers/bookings/:id/status (protected) */
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "completed", "cancelled"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${allowed.join(", ")}` });
    }

    const booking = await CaretakerBooking.findOne({
      _id: req.params.id,
      caretaker: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "completed" && status !== "completed") {
      return res
        .status(400)
        .json({ message: "Completed bookings cannot be moved back" });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: "Booking status updated", booking });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Booking not found" });
    }
    next(err);
  }
};
