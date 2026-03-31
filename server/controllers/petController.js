const Pet = require("../models/Pet");
const PetInquiry = require("../models/PetInquiry");

/* ── GET /api/pets ──────────────────────────────── */
exports.getAllPets = async (req, res, next) => {
  try {
    const { status, species, sort, page = 1, limit = 12 } = req.query;

    // Build filter object
    const filter = {};
    if (status) {
      const normalizedStatus =
        status.toLowerCase() === "sale" ? "buy" : status.toLowerCase();
      if (["buy", "rent"].includes(normalizedStatus)) {
        filter.status = normalizedStatus;
      }
    }
    if (
      species &&
      ["dog", "cat", "rabbit", "bird", "other"].includes(species.toLowerCase())
    ) {
      filter.species = species.toLowerCase();
    }

    // Sorting
    let sortObj = { createdAt: -1 }; // newest first by default
    if (sort === "price_asc") sortObj = { price: 1 };
    if (sort === "price_desc") sortObj = { price: -1 };
    if (sort === "name") sortObj = { name: 1 };

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Execute query + count in parallel
    const [pets, total] = await Promise.all([
      Pet.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate("owner", "name email")
        .lean(),
      Pet.countDocuments(filter),
    ]);

    res.json({
      pets,
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

/* ── GET /api/pets/:id ──────────────────────────── */
exports.getPetById = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id)
      .populate("owner", "name email")
      .lean();

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    res.json({ pet });
  } catch (err) {
    // Invalid ObjectId format
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Pet not found" });
    }
    next(err);
  }
};

/* ── POST /api/pets  (protected) ────────────────── */
exports.createPet = async (req, res, next) => {
  try {
    const { name, species, breed, age, status, price, description, imageURL } =
      req.body;

    const pet = await Pet.create({
      name,
      species,
      breed,
      age,
      status,
      price,
      description,
      imageURL,
      owner: req.user._id,
    });

    res.status(201).json({ message: "Pet listing created", pet });
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/pets/:id/inquiries  (protected) ─── */
exports.createPetInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message = "", startDate, days, contactPhone = "" } = req.body;

    const pet = await Pet.findById(id).populate("owner", "name email role");
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    if (!pet.owner) {
      return res
        .status(400)
        .json({ message: "This listing has no owner attached" });
    }

    if (String(pet.owner._id) === String(req.user._id)) {
      return res
        .status(400)
        .json({ message: "You cannot create an inquiry for your own listing" });
    }

    const type = pet.status;
    let normalizedStartDate = null;
    let normalizedDays = null;

    if (type === "rent") {
      if (!startDate || !days) {
        return res
          .status(400)
          .json({
            message: "startDate and days are required for rent bookings",
          });
      }

      normalizedStartDate = new Date(startDate);
      normalizedDays = parseInt(days, 10);

      if (Number.isNaN(normalizedStartDate.getTime())) {
        return res
          .status(400)
          .json({ message: "startDate must be a valid date" });
      }

      if (
        !Number.isInteger(normalizedDays) ||
        normalizedDays < 1 ||
        normalizedDays > 30
      ) {
        return res
          .status(400)
          .json({ message: "days must be between 1 and 30" });
      }
    }

    const existingPending = await PetInquiry.findOne({
      user: req.user._id,
      pet: pet._id,
      status: "pending",
    });

    if (existingPending) {
      return res
        .status(409)
        .json({ message: "You already have a pending request for this pet" });
    }

    const inquiry = await PetInquiry.create({
      user: req.user._id,
      owner: pet.owner._id,
      pet: pet._id,
      type,
      startDate: normalizedStartDate,
      days: normalizedDays,
      message,
      contactPhone,
    });

    await inquiry.populate([
      { path: "user", select: "name email role" },
      { path: "owner", select: "name email role" },
      { path: "pet", select: "name species breed status price imageURL" },
    ]);

    res.status(201).json({
      message:
        type === "rent"
          ? "Rent booking request submitted"
          : "Buy inquiry submitted",
      inquiry,
    });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Pet not found" });
    }
    next(err);
  }
};

/* ── GET /api/pets/my/inquiries  (protected) ───── */
exports.getMyPetInquiries = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = { user: req.user._id };
    if (
      status &&
      ["pending", "accepted", "rejected", "cancelled", "completed"].includes(
        status,
      )
    ) {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [inquiries, total] = await Promise.all([
      PetInquiry.find(filter)
        .populate("owner", "name email role")
        .populate("pet", "name species breed status price imageURL")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      PetInquiry.countDocuments(filter),
    ]);

    res.json({
      inquiries,
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

/* ── GET /api/pets/owner/inquiries  (protected) ── */
exports.getOwnerPetInquiries = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = { owner: req.user._id };
    if (
      status &&
      ["pending", "accepted", "rejected", "cancelled", "completed"].includes(
        status,
      )
    ) {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [inquiries, total] = await Promise.all([
      PetInquiry.find(filter)
        .populate("user", "name email role")
        .populate("pet", "name species breed status price imageURL")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      PetInquiry.countDocuments(filter),
    ]);

    res.json({
      inquiries,
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
