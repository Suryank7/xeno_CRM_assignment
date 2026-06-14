const mongoose = require('mongoose');

const messageVariantSchema = new mongoose.Schema(
  {
    variantId: { type: String, required: true }, // "A", "B", "C", "D"
    message: { type: String, required: true },
    tone: { type: String },
    predictedCTR: { type: Number },
    isWinner: { type: Boolean, default: false },
  },
  { _id: false }
);

const campaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    segmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Segment', required: true },
    channel: { type: String, enum: ['whatsapp', 'sms', 'email', 'rcs'], required: true },
    messageTemplate: { type: String, required: true },

    // Feature 6: Message Tournament — AI-generated variants
    messageVariants: [messageVariantSchema],

    // Feature 5: Campaign Simulator — predicted conversion per channel
    simulation: {
      emailPrediction: {
        openRate: Number,
        clickRate: Number,
        conversion: Number,
      },
      smsPrediction: {
        openRate: Number,
        clickRate: Number,
        conversion: Number,
      },
      whatsappPrediction: {
        openRate: Number,
        clickRate: Number,
        conversion: Number,
      },
      recommendedChannel: String,
      reasoning: String,
    },

    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sending', 'completed', 'failed'],
      default: 'draft',
    },

    // Feature 11: Live campaign stats for journey visualization
    stats: {
      total: { type: Number, default: 0 },
      sent: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      opened: { type: Number, default: 0 },
      read: { type: Number, default: 0 },
      clicked: { type: Number, default: 0 },
      purchased: { type: Number, default: 0 },
    },

    // Feature 10: AI Explainability
    aiExplanation: {
      reasoning: [{ type: String }],
      confidence: { type: Number, min: 0, max: 100 },
      dataPointsUsed: { type: Number },
      alternativesConsidered: [{ type: String }],
    },

    scheduledAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

campaignSchema.index({ status: 1 });
campaignSchema.index({ segmentId: 1 });

module.exports = mongoose.model('Campaign', campaignSchema);
