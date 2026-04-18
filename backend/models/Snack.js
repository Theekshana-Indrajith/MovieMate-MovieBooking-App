const mongoose = require('mongoose');

// Snack Schema for Managing Canteen Items and Inventory
const snackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a snack name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a description']
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price']
    },
    image: {
        type: String,
        default: 'default-snack.jpg'
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Snack', snackSchema);
