const express = require('express')
const Settings = require('../models/Settings')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

async function getOrCreateSettings() {
  let settings = await Settings.findOne({ singleton: 'main' })
  if (!settings) settings = await Settings.create({ singleton: 'main' })
  return settings
}

// PUBLIC — get site/office settings
router.get('/', async (req, res) => {
  const settings = await getOrCreateSettings()
  res.json({ success: true, data: settings })
})

// ADMIN — update settings
router.put('/', requireAdmin, async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { singleton: 'main' },
      { ...req.body, singleton: 'main' },
      { new: true, upsert: true, runValidators: true }
    )
    res.json({ success: true, data: settings })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

module.exports = router
