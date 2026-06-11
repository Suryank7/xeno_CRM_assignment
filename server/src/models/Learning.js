const mongoose = require('mongoose');

const learningSchema = new mongoose.Schema(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    insights: [{ type: String }],
    recommendations: [{ type: String }],
    performanceScore: { type: Number, min: 0, max: 100 },
    segmentType: { type: String },
    channelUsed: { type: String },
    appliedToFuture: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Learning', learningSchema);
