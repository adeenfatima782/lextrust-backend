const mongoose = require('mongoose')

const handleSchema = new mongoose.Schema({ title: String, text: String }, { _id: false })
const stepSchema = new mongoose.Schema({ title: String, text: String }, { _id: false })
const faqSchema = new mongoose.Schema({ q: String, a: String }, { _id: false })

const practiceAreaSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true },
    icon: String,
    summary: String,
    subItems: [String],
    intro: [String],
    handles: [handleSchema],
    approachText: String,
    approachSteps: [stepSchema],
    whyChoose: [stepSchema],
    faqs: [faqSchema],
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model(
  'PracticeArea',
  practiceAreaSchema,
  process.env.COLLECTION_PRACTICE_AREAS || 'practiceareas'
)
