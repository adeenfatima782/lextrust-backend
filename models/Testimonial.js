const mongoose = require('mongoose')

const testimonialSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true },
    company: String,
    date: String,
    tag: String,
    area: String,
    lawyerSlug: String,
    storyTitle: String,
    quote: String,
    challenge: String,
    howWeHelped: String,
    outcome: String,
    feedback: String,
    photo: String,
    duration: String,
    rating: { type: Number, default: 5 },
    clientSince: String,
    steps: [String],
    highlights: [String],
    faqs: [String],
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model(
  'Testimonial',
  testimonialSchema,
  process.env.COLLECTION_TESTIMONIALS || 'testimonials'
)
