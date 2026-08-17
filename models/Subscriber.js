const mongoose = require('mongoose')

const subscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    status: { type: String, enum: ['active', 'unsubscribed'], default: 'active' },
    subscribedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

module.exports = mongoose.model(
  'Subscriber',
  subscriberSchema,
  process.env.COLLECTION_SUBSCRIBERS || 'subscribers'
)
