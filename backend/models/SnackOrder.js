const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    snack: {
        type: mongoose.Schema.ObjectId,
        ref: 'Snack',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    } // Storing price at time of order is a good practice
});

const snackOrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    booking: {
        type: mongoose.Schema.ObjectId,
        ref: 'Booking',
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    deliveryMethod: {
        type: String,
        enum: ['In-Seat', 'Pickup'],
        required: true
    },
    seatNumber: {
        type: String,
        // Only required if delivery method is In-Seat
        required: function() {
            return this.deliveryMethod === 'In-Seat';
        }
    },
    status: {
        type: String,
        enum: ['Pending', 'Preparing', 'Ready', 'Delivered'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SnackOrder', snackOrderSchema);
