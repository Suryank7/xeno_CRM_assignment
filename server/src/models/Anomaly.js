const mongoose = require('mongoose');

const anomalySchema = new mongoose.Schema(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    type: { type: String, enum: ['LOW_OPEN_RATE', 'HIGH_FAILURE_RATE', 'LOW_CONVERSION'], required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
    description: { type: String, required: true },
    aiExplanation: { type: String },
    resolved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Anomaly', anomalySchema);
