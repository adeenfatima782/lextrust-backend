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
