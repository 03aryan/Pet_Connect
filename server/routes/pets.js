const router = require("express").Router();
const {
  getAllPets,
  getPetById,
  createPet,
  createPetInquiry,
  getMyPetInquiries,
  getOwnerPetInquiries,
} = require("../controllers/petController");
const { protect } = require("../middleware/auth");

// GET  /api/pets          — public, supports ?status=buy|rent&species=dog&sort=price_asc&page=1&limit=12
router.get("/", getAllPets);

// GET  /api/pets/my/inquiries       — protected (my buy/rent requests)
router.get("/my/inquiries", protect, getMyPetInquiries);

// GET  /api/pets/owner/inquiries    — protected (requests on my listings)
router.get("/owner/inquiries", protect, getOwnerPetInquiries);

// POST /api/pets/:id/inquiries      — protected (buy/rent action)
router.post("/:id/inquiries", protect, createPetInquiry);

// GET  /api/pets/:id      — public
router.get("/:id", getPetById);

// POST /api/pets          — protected (logged-in users only)
router.post("/", protect, createPet);

module.exports = router;
