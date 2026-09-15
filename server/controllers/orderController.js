const Order = require('../models/Order');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private (Protected)
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod = 'card',
      itemsPrice,
      taxPrice = 0,
      shippingPrice = 0,
      totalPrice,
      paymentResult
    } = req.body;

    // Validate order items
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items provided. Cart cannot be empty.'
      });
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a complete shipping address.'
      });
    }

    // Calculate totals fallback if not provided
    const calculatedItemsPrice = itemsPrice || orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const calculatedTotal = totalPrice || (calculatedItemsPrice + Number(taxPrice) + Number(shippingPrice));

    // Determine initial payment status based on method
    const isPrepaid = paymentMethod !== 'cod' && paymentResult && paymentResult.status === 'COMPLETED';

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice: calculatedItemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice: calculatedTotal,
      isPaid: isPrepaid,
      paidAt: isPrepaid ? Date.now() : undefined,
      paymentResult: isPrepaid ? paymentResult : undefined,
      status: 'Processing'
    });

    const createdOrder = await order.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: createdOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating order'
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private (Protected)
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching your orders'
    });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private (Protected)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found with id: ${req.params.id}`
      });
    }

    // Ensure only the user who placed the order (or an admin) can view it
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching order details'
    });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private (Protected)
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found with id: ${req.params.id}`
      });
    }

    // Ensure only the owner or an admin can update payment
    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify payment for this order'
      });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id || `TXN_${Date.now()}`,
      status: req.body.status || 'COMPLETED',
      update_time: req.body.update_time || new Date().toISOString(),
      email_address: req.body.email_address || req.user.email
    };

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Order marked as paid',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order to paid error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating payment status'
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid
};
