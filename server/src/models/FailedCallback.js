const mongoose = require('mongoose');

const failedCallbackSchema = new mongoose.Schema(
  {
    messageId: { type: String, required: true },
    campaignId: { type: String, required: true },
    status: { type: String, required: true },
    error: { type: String },
    payload: { type: mongoose.Schema.Types.Mixed },
    retryCount: { type: Number, default: 0 },
    resolved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FailedCallback', failedCallbackSchema);
