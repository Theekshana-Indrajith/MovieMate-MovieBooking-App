const mongoose = require('mongoose');

<<<<<<< HEAD
=======
// Seat Schema for Managing Movie Theater Seat Arrangement
>>>>>>> origin/anusara-IT24102789
const seatRowSchema = new mongoose.Schema({
    rowCode: {
        type: String,
        required: [true, 'Please add a row code e.g. A1, V1'],
        unique: true
    },
    type: {
        type: String,
        enum: ['Normal', 'VIP'],
        default: 'Normal'
    },
    seatsCount: {
        type: Number,
        default: 6
    },
    extraPrice: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Active', 'Maintenance'],
        default: 'Active'
    }
}, { timestamps: true });

module.exports = mongoose.model('SeatRow', seatRowSchema);
