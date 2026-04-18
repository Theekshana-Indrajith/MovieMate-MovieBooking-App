const express = require('express');
const { getBookings, createBooking, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getBookings)
    .post(createBooking);

router.route('/:id/cancel').put(cancelBooking);

module.exports = router;
