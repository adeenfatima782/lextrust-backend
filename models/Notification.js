const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    name: { type: String, trim: true, default: '' },
    email: { type: String, required: true, trim: true, lowercase: true },
    regarding: { type: String, trim: true, default: '' },
    message: { type: String, trim: true, default: '' },
    source: { type: String, enum: ['home', 'contact-page'], default: 'contact-page' },
    read: { type: Boolean, default: false },
    reply: { type: String, trim: true, default: '' },
    repliedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

module.exports = mongoose.model(
  'Notification',
  notificationSchema,
  process.env.COLLECTION_NOTIFICATIONS || 'notifications'
)