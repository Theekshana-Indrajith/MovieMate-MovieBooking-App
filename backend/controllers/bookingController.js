const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');

// @desc    Get user's bookings (or all if admin)
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
    try {
        let query;

        // If admin, can see all bookings. If user, only their own.
        if (req.user.role === 'admin') {
            query = Booking.find().populate('user', 'name email').populate({
                path: 'showtime',
                populate: { path: 'movie', select: 'title poster' }
            });
        } else {
            query = Booking.find({ user: req.user.id }).populate({
                path: 'showtime',
                populate: { path: 'movie', select: 'title poster' }
            });
        }

        const bookings = await query;
        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (User)
exports.createBooking = async (req, res, next) => {
    try {
        const { showtime, time, seats } = req.body;

        if (!time) {
            return res.status(400).json({ success: false, error: 'Please provide a specific time slot for this booking.' });
        }

        // DOUBLE-BOOKING PREVENTION
        // 1. Fetch all confirmed seats for this specific showtime AND time
        const existingBookings = await Booking.find({ showtime: showtime, time: time, status: 'Confirmed' });
        
        let takenSeats = [];
        existingBookings.forEach(b => {
            takenSeats = takenSeats.concat(b.seats);
        });

        // 2. Check if any requested seat is already in takenSeats
        for (let seat of seats) {
            if (takenSeats.includes(seat)) {
                return res.status(400).json({ 
                    success: false, 
                    error: `Seat ${seat} was just booked by someone else for ${time}. Please choose another seat.` 
                });
            }
        }

        // 3. If safe, add user to body and make the booking
        req.body.user = req.user.id;

        const booking = await Booking.create(req.body);
        res.status(201).json({ success: true, data: booking });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (User/Admin)
exports.cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('showtime');
        
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized to cancel this booking' });
        }

        if (booking.status === 'Cancelled') {
            return res.status(400).json({ success: false, error: 'Booking is already cancelled' });
        }

        // Logic: 4 hours before the actual showtime starts
        const showDate = new Date(booking.showtime.date);
        let hours = 8; // fallback
        let minutes = 0;

        if (booking.time) {
            // Parse "02:30 PM", "10:00 AM" etc.
            const timeParts = booking.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (timeParts) {
                hours = parseInt(timeParts[1], 10);
                minutes = parseInt(timeParts[2], 10);
                const ampm = timeParts[3].toUpperCase();
                
                if (ampm === 'PM' && hours < 12) hours += 12;
                if (ampm === 'AM' && hours === 12) hours = 0;
            }
        }

        showDate.setHours(hours, minutes, 0, 0);

        // Subtract 4 hours to get the deadline
        const cancelDeadline = new Date(showDate.getTime() - (4 * 60 * 60 * 1000));
        const now = new Date();

        if (now > cancelDeadline && req.user.role !== 'admin') {
            return res.status(400).json({ 
                success: false, 
                error: `Cancellations are only allowed 4 hours before the showtime starts (Deadline was ${cancelDeadline.toLocaleTimeString()}).` 
            });
        }

        booking.status = 'Cancelled';
        await booking.save();

        res.status(200).json({ success: true, data: booking });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
