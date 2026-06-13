const mongoose = require('mongoose');

const webhookSubscriptionSchema = new mongoose.Schema({
  event: { type: String, required: true, enum: ['campaign.completed', 'customer.created', 'order.created'] },
  targetUrl: { type: String, required: true },
  secret: { type: String }, // For payload signing (HMAC)
  isActive: { type: Boolean, default: true },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('WebhookSubscription', webhookSubscriptionSchema);
