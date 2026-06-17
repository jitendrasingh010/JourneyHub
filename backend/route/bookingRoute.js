const express = require('express');
const router = express.Router();
const BookingController = require('../controller/bookingContoller');
const auth = require('../middelware/auth');
router.post('/addbooking', auth, BookingController.addBooking);
router.get('/booked-seats', BookingController.getBookedSeats);
router.get('/getbooking', auth, BookingController.getBooking);
router.get('/getbooking/:id', auth, BookingController.getBookingById);
router.put('/cancelbooking/:id', auth, BookingController.cancelBooking);
router.put('/confirmbooking/:id', auth, BookingController.confirmBooking);

module.exports = router;
