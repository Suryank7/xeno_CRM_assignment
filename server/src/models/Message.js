const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    channel: { type: String, enum: ['whatsapp', 'sms', 'email', 'rcs'], required: true },
    content: { type: String, required: true },
    variantId: { type: String }, // "A", "B", etc. for A/B testing


    // Current status in the delivery lifecycle
    status: {
      type: String,
      enum: ['queued', 'sent', 'delivered', 'failed', 'opened', 'read', 'clicked', 'purchased'],
      default: 'queued',
    },

    // Full history for audit trail and journey visualization
    statusHistory: [statusHistorySchema],

    sentAt: { type: Date },
    lastUpdatedAt: { type: Date },
  },
  { timestamps: true }
);

// Compound index for fast lookup: "all messages for campaign X with status Y"
messageSchema.index({ campaignId: 1, status: 1 });
messageSchema.index({ customerId: 1 });

module.exports = mongoose.model('Message', messageSchema);
