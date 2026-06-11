const mongoose = require('mongoose');

const personaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // "Weekend Coffee Lovers"
    description: { type: String },

    characteristics: {
      ageRange: { type: String },
      avgSpend: { type: Number },
      avgOrders: { type: Number },
      preferredDay: { type: String },
      preferredChannel: { type: String },
      responseRate: { type: Number },
      topCategories: [{ type: String }],
      topCities: [{ type: String }],
    },

    customerCount: { type: Number, default: 0 },
    customerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Persona', personaSchema);
