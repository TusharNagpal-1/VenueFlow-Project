const express = require("express");
const router = express.Router();
const { bookEvent ,getBookings} = require("../controllers/bookingController.js");

router.post("/book", bookEvent);
router.get("/bookings", getBookings);

module.exports = router;