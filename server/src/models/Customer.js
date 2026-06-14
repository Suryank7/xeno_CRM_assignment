const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    age: { type: Number, min: 0 },
    city: { type: String, trim: true },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastOrderDate: { type: Date },
    tags: [{ type: String, trim: true }],

    // Feature 8: Customer Digital Twin — AI-generated behavioral profile
    digitalTwin: {
      purchaseProbability: { type: Number, min: 0, max: 100 },
      preferredChannel: { type: String, enum: ['whatsapp', 'sms', 'email', 'rcs', null], default: null },
      likelyPurchaseWindow: { type: String },
      discountSensitivity: { type: String, enum: ['low', 'medium', 'high', null], default: null },
      churnRisk: { type: String, enum: ['low', 'medium', 'high', null], default: null },
      lifetimeValuePrediction: { type: Number },
      topCategories: [{ type: String }],
      lastUpdated: { type: Date },
    },
  },
  { timestamps: true }
);

// Indexes for fast segmentation queries
customerSchema.index({ totalSpent: 1 });
customerSchema.index({ totalOrders: 1 });
customerSchema.index({ lastOrderDate: 1 });
customerSchema.index({ city: 1 });
customerSchema.index({ age: 1 });
customerSchema.index({ 'digitalTwin.churnRisk': 1 });

module.exports = mongoose.model('Customer', customerSchema);
