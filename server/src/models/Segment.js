const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // MongoDB-compatible query rules. Stored as a flexible object so AI
    // can generate arbitrary filter conditions (e.g. { totalSpent: { $gt: 5000 } }).
    rules: { type: mongoose.Schema.Types.Mixed, required: true },

    audienceSize: { type: Number, default: 0 },

    // Track whether this segment was created by the marketer or AI
    createdBy: { type: String, enum: ['manual', 'ai'], default: 'manual' },

    // Feature 10: AI Explainability — why this segment was created
    aiExplanation: {
      reasoning: [{ type: String }],
      confidence: { type: Number, min: 0, max: 100 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Segment', segmentSchema);
