const express = require("express");
const router = express.Router();
const { bookEvent, getMyBookings } = require("../controllers/bookingControllers.js");

router.post("/book", bookEvent);
router.get("/bookings", getMyBookings);

module.exports = router;