const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    }
}, { timestamps: true });

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    genre: {
        type: String,
        required: [true, 'Please add a genre']
    },
    duration: {
        type: Number, // In minutes
        required: [true, 'Please add duration in minutes']
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    reviews: [reviewSchema],
    numReviews: {
        type: Number,
        default: 0
    },
    releaseDate: {
        type: Date,
        required: [true, 'Please add a release date']
    },
    poster: {
<<<<<<< HEAD
        type: String, // Filename store kireema
        default: 'no-image.jpg'
    },
=======
        type: String, 
        default: 'no-image.jpg'
    },
    backdrop: {
        type: String,
        default: 'no-backdrop.jpg'
    },
    cast: {
        type: [String],
        default: []
    },
>>>>>>> origin/theekshana-IT24102753
    isShowing: {
        type: Boolean,
        default: true
    },
    addedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema);
