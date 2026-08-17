const express = require('express')
const SiteContent = require('../models/SiteContent')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

// PUBLIC — get all content blocks (frontend can pick by key)
router.get('/', async (req, res) => {
  const items = await SiteContent.find()
  res.json({ success: true, data: items })
})

// PUBLIC — get one block by key, e.g. /api/site-content/about-page
router.get('/:key', async (req, res) => {
  const item = await SiteContent.findOne({ key: req.params.key })
  if (!item) return res.status(404).json({ success: false, message: 'Not found' })
  res.json({ success: true, data: item })
})

// ADMIN — create or update a block (upsert)
router.put('/:key', requireAdmin, async (req, res) => {
  try {
    const item = await SiteContent.findOneAndUpdate(
      { key: req.params.key },
      { key: req.params.key, label: req.body.label, value: req.body.value },
      { new: true, upsert: true, runValidators: true }
    )
    res.json({ success: true, data: item })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ADMIN — delete a block
router.delete('/:key', requireAdmin, async (req, res) => {
  const item = await SiteContent.findOneAndDelete({ key: req.params.key })
  if (!item) return res.status(404).json({ success: false, message: 'Not found' })
  res.json({ success: true, message: 'Deleted' })
})

module.exports = router
