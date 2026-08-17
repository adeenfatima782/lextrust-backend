const mongoose = require('mongoose')

const lawyerSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true },
    role: String,
    area: String,
    experience: String,
    initials: String,
    photo: String, // image URL
    bio: String,
    about: [String],
    philosophy: String,
    education: [String],
    practiceAreas: [String],
    achievements: [String],
    memberships: [String],
    approach: String,
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model(
  'Lawyer',
  lawyerSchema,
  process.env.COLLECTION_LAWYERS || 'lawyers'
)
