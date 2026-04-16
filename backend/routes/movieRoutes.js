const express = require('express');
const { 
    getMovies, 
    getMovie, 
    createMovie, 
    updateMovie, 
    deleteMovie,
    createMovieReview,
    deleteMovieReview
} = require('../controllers/movieController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/upload');

// Include other resource routers
const showtimeRouter = require('./showtimeRoutes');

const router = express.Router();

// Re-route into other resource routers
router.use('/:movieId/showtimes', showtimeRouter);

// Middleware: Logged in status for all movie routes
router.use(protect);


router
    .route('/')
    .get(getMovies)
<<<<<<< HEAD
    .post(authorize('admin'), upload.single('poster'), createMovie);
=======
    .post(authorize('admin'), upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'backdrop', maxCount: 1 }]), createMovie);
>>>>>>> origin/theekshana-IT24102753

router
    .route('/:id')
    .get(getMovie)
<<<<<<< HEAD
    .put(authorize('admin'), upload.single('poster'), updateMovie)
=======
    .put(authorize('admin'), upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'backdrop', maxCount: 1 }]), updateMovie)
>>>>>>> origin/theekshana-IT24102753
    .delete(authorize('admin'), deleteMovie);

router.route('/:id/reviews').post(createMovieReview);
router.route('/:id/reviews/:reviewId').delete(authorize('admin'), deleteMovieReview);

module.exports = router;
