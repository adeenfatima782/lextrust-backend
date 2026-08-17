const express = require('express')
const Lawyer = require('../models/Lawyer')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

router.get('/', async (req, res) => {
  const items = await Lawyer.find({ published: true }).sort({ order: 1, createdAt: 1 })
  res.json({ success: true, data: items })
})

router.get('/:slug', async (req, res) => {
  const item = await Lawyer.findOne({ slug: req.params.slug })
  if (!item) return res.status(404).json({ success: false, message: 'Not found' })
  res.json({ success: true, data: item })
})

router.get('/admin/all', requireAdmin, async (req, res) => {
  const items = await Lawyer.find().sort({ order: 1, createdAt: 1 })
  res.json({ success: true, data: items })
})

router.post('/', requireAdmin, async (req, res) => {
  try {
    const item = await Lawyer.create(req.body)
    res.status(201).json({ success: true, data: item })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const item = await Lawyer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!item) return res.status(404).json({ success: false, message: 'Not found' })
    res.json({ success: true, data: item })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.delete('/:id', requireAdmin, async (req, res) => {
  const item = await Lawyer.findByIdAndDelete(req.params.id)
  if (!item) return res.status(404).json({ success: false, message: 'Not found' })
  res.json({ success: true, message: 'Deleted' })
})

module.exports = router
