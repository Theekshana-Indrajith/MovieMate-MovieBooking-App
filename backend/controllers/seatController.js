const SeatRow = require('../models/Seat');

// @desc    Get all seat rows
// @route   GET /api/seats
// @access  Public
exports.getSeatRows = async (req, res, next) => {
    try {
        const rows = await SeatRow.find().sort({ rowCode: -1 }); // Basic sort
        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create a new seat row
// @route   POST /api/seats
// @access  Private (Admin)
exports.createSeatRow = async (req, res, next) => {
    try {
        const row = await SeatRow.create(req.body);
        res.status(201).json({ success: true, data: row });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, error: 'Row code already exists' });
        }
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update a seat row
// @route   PUT /api/seats/:id
// @access  Private (Admin)
exports.updateSeatRow = async (req, res, next) => {
    try {
        const row = await SeatRow.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!row) return res.status(404).json({ success: false, error: 'Row not found' });
        res.status(200).json({ success: true, data: row });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ success: false, error: 'Row code already exists' });
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete a seat row
// @route   DELETE /api/seats/:id
// @access  Private (Admin)
exports.deleteSeatRow = async (req, res, next) => {
    try {
        const row = await SeatRow.findById(req.params.id);
        if (!row) return res.status(404).json({ success: false, error: 'Row not found' });
        
        await row.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
