const Order = require('../models/orderModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOrders = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Order.find(), req.query).filter();
  const orders = await features.query;

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders,
    },
  });
});
exports.createOrder = catchAsync(async (req, res, next) => {
  const newOrder = await Order.create({
    user: req.user,
    orderItems: req.body.orderItems,
  });
  res.status(201).json({
    status: 'success',
    data: {
      Order: newOrder,
    },
  });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('No se encontró un producto con ese id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});
exports.updateOrder = catchAsync(async (req, res, next) => {
  const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!updatedOrder) {
    return next(new AppError('No se encontró una orden con ese id', 404));
  }
  res.status(201).json({
    status: 'success',
    data: {
      order: updatedOrder,
    },
  });
});

exports.deleteOrder = catchAsync(async (req, res, next) => {
  const deletedOrder = await Order.findByIdAndDelete(req.params.id);
  res.status(201).json({
    status: 'success',
    data: {
      order: deletedOrder,
    },
  });
});
