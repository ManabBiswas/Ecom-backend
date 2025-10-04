const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');
const isLoggedIn = require('../middlewares/isLoggedIn');

// Get all orders for the owner
router.get('/orders/all', isLoggedIn('owner'), async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('productId', 'name price')
            .populate('userId', 'fullName')
            .sort('-orderDate');

        // Calculate total revenue
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

        res.json({
            success: true,
            data: {
                orders,
                totalOrders: orders.length,
                totalRevenue
            }
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders'
        });
    }
});

// Get recent orders
router.get('/orders/recent', isLoggedIn('owner'), async (req, res) => {
    try {
        const recentOrders = await Order.find()
            .populate('productId', 'name price')
            .populate('userId', 'fullName')
            .sort('-orderDate')
            .limit(5);

        res.json({
            success: true,
            orders: recentOrders
        });
    } catch (error) {
        console.error('Error fetching recent orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent orders'
        });
    }
});

module.exports = router;