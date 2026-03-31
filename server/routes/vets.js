const router = require("express").Router();
const {
  getAllVets,
  getVetById,
  upsertMyVetProfile,
  getMyVetProfile,
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getVetAppointments,
  updateAppointmentStatus,
} = require("../controllers/vetController");
const { protect } = require("../middleware/auth");

// GET   /api/vets                              — public list for discovery
router.get("/", getAllVets);

// POST  /api/vets/profile                      — create/update my vet profile
router.post("/profile", protect, upsertMyVetProfile);

// GET   /api/vets/me/profile                   — my vet profile
router.get("/me/profile", protect, getMyVetProfile);

// GET   /api/vets/me/appointments              — appointments assigned to me (vet)
router.get("/me/appointments", protect, getVetAppointments);

// POST  /api/vets/book                         — book a new appointment
router.post("/book", protect, bookAppointment);

// GET   /api/vets/appointments                 — list my appointments (pet parent)
router.get("/appointments", protect, getMyAppointments);

// PATCH /api/vets/appointments/:id/cancel      — cancel an appointment
router.patch("/appointments/:id/cancel", protect, cancelAppointment);

// PATCH /api/vets/appointments/:id/status      — update appointment status (vet)
router.patch("/appointments/:id/status", protect, updateAppointmentStatus);

// GET   /api/vets/:id                          — public single vet profile
router.get("/:id", getVetById);

module.exports = router;
