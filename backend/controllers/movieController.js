const Movie = require('../models/Movie');

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
exports.getMovies = async (req, res, next) => {
    try {
        const movies = await Movie.find();
        res.status(200).json({ success: true, count: movies.length, data: movies });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single movie
// @route   GET /api/movies/:id
// @access  Public
exports.getMovie = async (req, res, next) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ success: false, error: 'Movie not found' });
        res.status(200).json({ success: true, data: movie });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new movie
// @route   POST /api/movies
// @access  Private (Admin)
exports.createMovie = async (req, res, next) => {
    try {
        // Add user ID to movie
        req.body.addedBy = req.user.id;

<<<<<<< HEAD
        // Add poster if uploaded
        if (req.file) {
            req.body.poster = req.file.filename;
=======
        // Handle Multiple Uploads
        if (req.files) {
            if (req.files.poster) req.body.poster = req.files.poster[0].filename;
            if (req.files.backdrop) req.body.backdrop = req.files.backdrop[0].filename;
>>>>>>> origin/theekshana-IT24102753
        }

        const movie = await Movie.create(req.body);
        res.status(201).json({ success: true, data: movie });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private (Admin)
exports.updateMovie = async (req, res, next) => {
    try {
        let movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ success: false, error: 'Movie not found' });

<<<<<<< HEAD
        // Add poster if uploaded
        if (req.file) {
            req.body.poster = req.file.filename;
=======
        // Handle Multiple Uploads
        if (req.files) {
            if (req.files.poster) req.body.poster = req.files.poster[0].filename;
            if (req.files.backdrop) req.body.backdrop = req.files.backdrop[0].filename;
>>>>>>> origin/theekshana-IT24102753
        }

        movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: movie });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private (Admin)
exports.deleteMovie = async (req, res, next) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) return res.status(404).json({ success: false, error: 'Movie not found' });

        // Logic to prevent deletion if active bookings exist
        const Showtime = require('../models/Showtime');
        const Booking = require('../models/Booking');
        const fs = require('fs');
        const path = require('path');

        const showtimes = await Showtime.find({ movie: req.params.id });
        const showtimeIds = showtimes.map(st => st._id);

        const activeBookings = await Booking.find({ showtime: { $in: showtimeIds }, status: 'Confirmed' });

        if (activeBookings.length > 0) {
            return res.status(400).json({ 
                success: false, 
                error: `Cannot delete movie. Users have already paid and booked ${activeBookings.length} tickets for this. Cancel bookings first.` 
            });
        }

        // Safe to Delete - Cascade Delete processing
        // 1. Remove Physical Image from Server
        if (movie.poster) {
            const posterPath = path.join(__dirname, '..', 'uploads', 'movies', movie.poster);
            if (fs.existsSync(posterPath)) {
                fs.unlinkSync(posterPath); // Delete the junk file
            }
        }

        // 2. Remove all related Showtimes and any non-active/cancelled bookings
        await Booking.deleteMany({ showtime: { $in: showtimeIds } });
        await Showtime.deleteMany({ movie: req.params.id });

        // 3. Remove the Movie finally
        await movie.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new review
// @route   POST /api/movies/:id/reviews
// @access  Private
exports.createMovieReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ success: false, error: 'Movie not found' });
        }

        const alreadyReviewed = movie.reviews.find(r => r.user.toString() === req.user.id.toString());
        if (alreadyReviewed) {
            return res.status(400).json({ success: false, error: 'Movie already reviewed' });
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user.id
        };

        movie.reviews.push(review);
        movie.numReviews = movie.reviews.length;
        movie.rating = movie.reviews.reduce((acc, item) => item.rating + acc, 0) / movie.reviews.length;

        await movie.save();
        res.status(201).json({ success: true, message: 'Review added' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete a review
// @route   DELETE /api/movies/:id/reviews/:reviewId
// @access  Private (Admin)
exports.deleteMovieReview = async (req, res, next) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ success: false, error: 'Movie not found' });
        }

        const review = movie.reviews.id(req.params.reviewId);
        if (!review) {
            return res.status(404).json({ success: false, error: 'Review not found' });
        }

        // Remove the review
        review.deleteOne();

        // Recalculate rating
        movie.numReviews = movie.reviews.length;
        if (movie.reviews.length === 0) {
            movie.rating = 0;
        } else {
            movie.rating = movie.reviews.reduce((acc, item) => item.rating + acc, 0) / movie.reviews.length;
        }

        await movie.save();
        res.status(200).json({ success: true, message: 'Review removed' });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
