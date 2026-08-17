const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Admin' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // bcrypt hash
  },
  { timestamps: true }
)

module.exports = mongoose.model(
  'Admin',
  adminSchema,
  process.env.COLLECTION_ADMINS || 'admins'
)
