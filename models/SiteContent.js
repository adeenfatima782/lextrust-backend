const mongoose = require('mongoose')

// Generic flexible content block store — e.g. key: "about-page", "hero", "footer"
// value: any JSON shape the admin dashboard edits and the frontend fetches by key.
const siteContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    label: { type: String, default: '' },
    value: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
)

module.exports = mongoose.model(
  'SiteContent',
  siteContentSchema,
  process.env.COLLECTION_SITE_CONTENT || 'sitecontents'
)
