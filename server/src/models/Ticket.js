const mongoose = require('mongoose');

const ticketMessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['customer', 'agent', 'system'], required: true },
  senderName: { type: String },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    subject: { type: String, required: true },
    status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    messages: [ticketMessageSchema],
    category: { type: String, enum: ['order', 'product', 'shipping', 'other'], default: 'other' }
  },
  { timestamps: true }
);

// Auto-generate ticket number
ticketSchema.pre('save', function (next) {
  if (!this.ticketNumber) {
    this.ticketNumber = 'TK-' + Math.floor(100000 + Math.random() * 900000);
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
