const express = require("express");
const router = express.Router();
const {
  sendBookingOTP,
  bookEvent,
  confirmBooking,
  getMyBookings,
  cancelBooking,
} = require("../controllers/bookingControllers.js");
const { protect, admin } = require("../middleware/auth.js");

router.post("/send-otp", protect, sendBookingOTP);
router.post("/", protect, bookEvent);
router.get("/my", protect, getMyBookings);
router.put("/:id/confirm", protect, admin, confirmBooking);
router.delete("/:id", protect, cancelBooking);

module.exports = router;
