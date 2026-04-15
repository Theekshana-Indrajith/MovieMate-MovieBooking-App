const express = require('express');
const { getSeatRows, createSeatRow, updateSeatRow, deleteSeatRow } = require('../controllers/seatController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(getSeatRows)
    .post(protect, authorize('admin'), createSeatRow);

router.route('/:id')
    .put(protect, authorize('admin'), updateSeatRow)
    .delete(protect, authorize('admin'), deleteSeatRow);

module.exports = router;
