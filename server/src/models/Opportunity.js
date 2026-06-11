const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true }, // "Churning VIP Customers"
    description: { type: String, required: true },
    audienceSize: { type: Number, required: true },
    potentialRevenue: { type: Number },
    suggestedAction: { type: String }, // "Win-back Campaign"
    segmentRules: { type: mongoose.Schema.Types.Mixed }, // MongoDB query
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    status: { type: String, enum: ['new', 'acted', 'dismissed'], default: 'new' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Opportunity', opportunitySchema);
