const Snack = require('../models/Snack');
const SnackOrder = require('../models/SnackOrder');
const fs = require('fs');

// @desc    Get all active snacks
// @route   GET /api/snacks
exports.getSnacks = async (req, res) => {
    try {
        const snacks = await Snack.find();
        res.status(200).json({ success: true, count: snacks.length, data: snacks });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Create new snack
// @route   POST /api/snacks
exports.createSnack = async (req, res) => {
    try {
        if (req.file) {
            req.body.image = req.file.filename;
        }

        const snack = await Snack.create(req.body);
        res.status(201).json({ success: true, data: snack });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Update a snack
// @route   PUT /api/snacks/:id
exports.updateSnack = async (req, res) => {
    try {
        let snack = await Snack.findById(req.params.id);
        if (!snack) {
            return res.status(404).json({ success: false, error: 'Snack not found' });
        }

        if (req.file) {
            req.body.image = req.file.filename;
        }

        snack = await Snack.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: snack });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Delete a snack
// @route   DELETE /api/snacks/:id
exports.deleteSnack = async (req, res) => {
    try {
        const snack = await Snack.findByIdAndDelete(req.params.id);
        if (!snack) {
            return res.status(404).json({ success: false, error: 'Snack not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================
// SNACK ORDER METHODS
// ============================

// @desc    Create snack order
// @route   POST /api/snacks/orders
// @access  Private (User)
exports.createOrder = async (req, res) => {
    try {
        req.body.user = req.user.id;
        
        // Ensure items is an array and totalAmount is calculated
        // Frontend should send: booking, items [{snack, quantity, price}], deliveryMethod, seatNumber
        
        const order = await SnackOrder.create(req.body);
        res.status(201).json({ success: true, data: order });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get user's snack orders
// @route   GET /api/snacks/orders/my
// @access  Private (User)
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await SnackOrder.find({ user: req.user.id })
            .populate('items.snack', 'name image price')
            .populate({
                path: 'booking',
                populate: {
                    path: 'showtime',
                    populate: { path: 'movie', select: 'title' }
                }
            })
            .sort('-createdAt');
            
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Get all snack orders
// @route   GET /api/snacks/orders
// @access  Private (Admin)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await SnackOrder.find()
            .populate('user', 'name email')
            .populate('items.snack', 'name price')
            .populate({
                path: 'booking',
                populate: {
                    path: 'showtime',
                    select: 'time date',
                    populate: { path: 'movie', select: 'title' }
                }
            })
            .sort('-createdAt');
            
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Update order status
// @route   PUT /api/snacks/orders/:id/status
// @access  Private (Admin)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Pending', 'Preparing', 'Ready', 'Delivered'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }
        
        const order = await SnackOrder.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true, runValidators: true }
        );
        
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        
        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
