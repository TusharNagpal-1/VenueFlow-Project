const express = require("express");
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventsController.js");
const {
  sendBookingOTP,
  bookEvent,
  confirmBooking,
  getMyBookings,
  cancelBooking,
} = require("../controllers/bookingControllers.js");
const { protect, admin } = require("../middleware/auth.js");

// Public routes
router.get("/", getEvents);

// Booking routes (must be before /:id to avoid param collision)
router.post("/send-otp", protect, sendBookingOTP);
router.post("/book", protect, bookEvent);
router.put("/confirm/:id", protect, admin, confirmBooking);
router.get("/my-bookings", protect, getMyBookings);
router.delete("/cancel/:id", protect, cancelBooking);

// Event CRUD (param routes after specific)
router.get("/:id", getEventById);
router.post("/", protect, admin, createEvent);
router.put("/:id", protect, admin, updateEvent);
router.delete("/:id", protect, admin, deleteEvent);

module.exports = router;
