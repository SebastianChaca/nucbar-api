const mongoose = require('mongoose');

const Orderschema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    orderItems: [
      {
        qty: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
      },
    ],
    status: {
      enum: ['Pending', 'Rejected', 'Completed'],
      type: String,
    },
    total: {
      type: Number,
      // required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
  }
);
Orderschema.pre(/^find/, function (next) {
  this.populate({
    path: 'orderItems',
    populate: {
      path: 'product',
      select: ['stock', 'name', 'brand', 'price'],
    },
  }).populate({
    path: 'user',
    select: ['name', 'lastName', 'email'],
  });
  next();
});

// Orderschema.virtual('subTotal').get(function () {
//   console.log(this.orderItems);
//   return this.orderItems.qty * this.orderItems.product.price;
// });
module.exports = mongoose.model('Order', Orderschema);
