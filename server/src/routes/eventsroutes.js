const express = require("express");
const router = express.Router();
const {
  sendBookingOTP,
  bookEvent,
  confirmBooking,
  getMyBookings,
  cancelBooking,
} = require("../controllers/eventsController.js");

// Middleware to verify authentication (to be implemented in middleware folder)
// const { verifyToken } = require("../middleware/authMiddleware.js");

// Routes for event bookings
router.post("/send-otp", sendBookingOTP); // Send OTP for booking verification
router.post("/book", bookEvent); // Book an event
router.put("/confirm/:id", confirmBooking); // Confirm a booking (admin)
router.get("/my-bookings", getMyBookings); // Get all bookings (user/admin)
router.delete("/cancel/:id", cancelBooking); // Cancel a booking

module.exports = router;
