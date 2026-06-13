const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userEmail: { type: String },
    action: { type: String, required: true }, // e.g. "CREATE_CAMPAIGN"
    resource: { type: String, required: true }, // e.g. "campaigns"
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    method: { type: String, required: true }, // POST, PUT, DELETE
    path: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed }, // Body/Params
    status: { type: Number },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
