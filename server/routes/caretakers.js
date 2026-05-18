const router = require("express").Router();
const {
  getAllCaretakers,
  getCaretakerById,
  upsertMyProfile,
  getMyProfile,
  bookCaretaker,
  getMyBookings,
  cancelBooking,
  getCaretakerBookings,
  updateBookingStatus,
} = require("../controllers/caretakerController");
const { protect } = require("../middleware/auth");

// GET   /api/caretakers                          — public list
router.get("/", getAllCaretakers);

// POST  /api/caretakers/profile                  — create/update my caretaker profile
router.post("/profile", protect, upsertMyProfile);

// GET   /api/caretakers/me/profile               — my caretaker profile
router.get("/me/profile", protect, getMyProfile);

// GET   /api/caretakers/me/incoming-bookings     — bookings assigned to me (caretaker)
router.get("/me/incoming-bookings", protect, getCaretakerBookings);

// GET   /api/caretakers/me/bookings              — my bookings (pet owner)
router.get("/me/bookings", protect, getMyBookings);

// POST  /api/caretakers/book                     — book a caretaker
router.post("/book", protect, bookCaretaker);

// PATCH /api/caretakers/bookings/:id/cancel      — cancel a booking (owner)
router.patch("/bookings/:id/cancel", protect, cancelBooking);

// PATCH /api/caretakers/bookings/:id/status      — update status (caretaker)
router.patch("/bookings/:id/status", protect, updateBookingStatus);

// GET   /api/caretakers/:id                      — public single caretaker profile
router.get("/:id", getCaretakerById);

module.exports = router;
