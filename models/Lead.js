const mongoose = require('mongoose')

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    message: { type: String, trim: true },
    regarding: { type: String, trim: true, default: '' },
    source: { type: String, enum: ['home', 'contact-page'], default: 'contact-page' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
)

module.exports = mongoose.model(
  'Lead',
  leadSchema,
  process.env.COLLECTION_LEADS || 'leads'
)
