const express = require('express')
const PracticeArea = require('../models/PracticeArea')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

// PUBLIC — list all published
router.get('/', async (req, res) => {
  const items = await PracticeArea.find({ published: true }).sort({ order: 1, createdAt: 1 })
  res.json({ success: true, data: items })
})

// PUBLIC — single by slug
router.get('/:slug', async (req, res) => {
  const item = await PracticeArea.findOne({ slug: req.params.slug })
  if (!item) return res.status(404).json({ success: false, message: 'Not found' })
  res.json({ success: true, data: item })
})

// ADMIN — list all (including unpublished)
router.get('/admin/all', requireAdmin, async (req, res) => {
  const items = await PracticeArea.find().sort({ order: 1, createdAt: 1 })
  res.json({ success: true, data: items })
})

// ADMIN — create
router.post('/', requireAdmin, async (req, res) => {
  try {
    const item = await PracticeArea.create(req.body)
    res.status(201).json({ success: true, data: item })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ADMIN — update
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const item = await PracticeArea.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!item) return res.status(404).json({ success: false, message: 'Not found' })
    res.json({ success: true, data: item })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ADMIN — delete
router.delete('/:id', requireAdmin, async (req, res) => {
  const item = await PracticeArea.findByIdAndDelete(req.params.id)
  if (!item) return res.status(404).json({ success: false, message: 'Not found' })
  res.json({ success: true, message: 'Deleted' })
})

module.exports = router
