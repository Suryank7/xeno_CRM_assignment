const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    orderNumber: { type: String, required: true, unique: true },
    amount: { type: Number, required: true, min: 0 },
    items: [
      {
        name: { type: String, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, default: 1 },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'delivered',
    },
    orderDate: { type: Date, required: true },
  },
  { timestamps: true }
);

orderSchema.index({ customerId: 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ 'items.category': 1 });

module.exports = mongoose.model('Order', orderSchema);
