const express = require('express')
const Testimonial = require('../models/Testimonial')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

router.get('/', async (req, res) => {
  const items = await Testimonial.find({ published: true }).sort({ order: 1, createdAt: 1 })
  res.json({ success: true, data: items })
})

router.get('/:slug', async (req, res) => {
  const item = await Testimonial.findOne({ slug: req.params.slug })
  if (!item) return res.status(404).json({ success: false, message: 'Not found' })
  res.json({ success: true, data: item })
})

router.get('/admin/all', requireAdmin, async (req, res) => {
  const items = await Testimonial.find().sort({ order: 1, createdAt: 1 })
  res.json({ success: true, data: items })
})

router.post('/', requireAdmin, async (req, res) => {
  try {
    const item = await Testimonial.create(req.body)
    res.status(201).json({ success: true, data: item })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const item = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!item) return res.status(404).json({ success: false, message: 'Not found' })
    res.json({ success: true, data: item })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.delete('/:id', requireAdmin, async (req, res) => {
  const item = await Testimonial.findByIdAndDelete(req.params.id)
  if (!item) return res.status(404).json({ success: false, message: 'Not found' })
  res.json({ success: true, message: 'Deleted' })
})

module.exports = router
