const mongoose = require('mongoose')

// Single-document settings store (office info, contact details, social links, office hours)
const settingsSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: 'main', unique: true }, // always "main" — only 1 doc
    phone: { type: String, default: '+1 (555) 234-7890' },
    email: { type: String, default: 'contact@lextrust.com' },
    address: { type: String, default: '128 Justice Avenue, Suite 400, New York, NY' },
    officeHours: {
      type: [{ day: String, hours: String }],
      default: [
        { day: 'Monday – Friday', hours: '9:00 AM – 6:00 PM' },
        { day: 'Saturday', hours: '10:00 AM – 2:00 PM' },
        { day: 'Sunday', hours: 'Closed' },
        { day: 'Emergency Line', hours: 'Available 24/7' },
      ],
    },
    socialLinks: {
      facebook: String,
      instagram: String,
      linkedin: String,
      twitter: String,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model(
  'Settings',
  settingsSchema,
  process.env.COLLECTION_SETTINGS || 'settings'
)
