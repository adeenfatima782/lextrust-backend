const express = require('express')
const { body, validationResult } = require('express-validator')
const Notification = require('../models/Notification')
const { requireAdmin } = require('../middleware/auth')
const { sendCaseReplyEmail } = require('../utils/email')

const router = express.Router()

// ---- ADMIN (JWT required) ----

// GET /api/notifications — list all, newest first
router.get('/', requireAdmin, async (req, res) => {
  try {
    const items = await Notification.find().sort({ createdAt: -1 }).limit(100)
    const unread = await Notification.countDocuments({ read: false })
    res.json({ success: true, data: items, unread })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// GET /api/notifications/unread-count — lightweight polling endpoint
router.get('/unread-count', requireAdmin, async (req, res) => {
  try {
    const unread = await Notification.countDocuments({ read: false })
    res.json({ success: true, unread })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// PATCH /api/notifications/read-all — mark everything read
router.patch('/read-all', requireAdmin, async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { $set: { read: true } })
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// PATCH /api/notifications/:id/read — mark one as read
router.patch('/:id/read', requireAdmin, async (req, res) => {
  try {
    const item = await Notification.findByIdAndUpdate(
      req.params.id,
      { $set: { read: true } },
      { new: true }
    )
    if (!item) return res.status(404).json({ success: false, message: 'Notification not found' })
    res.json({ success: true, data: item })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// POST /api/notifications/:id/reply — admin replies to the client
router.post(
  '/:id/reply',
  requireAdmin,
  [body('reply').trim().notEmpty().withMessage('Reply text is required')],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }
    try {
      const item = await Notification.findByIdAndUpdate(
        req.params.id,
        { $set: { reply: req.body.reply.trim(), repliedAt: new Date(), read: true } },
        { new: true }
      )
      if (!item) return res.status(404).json({ success: false, message: 'Notification not found' })

      // Email the client so they know their case was received and answered
      sendCaseReplyEmail(item, req.body.reply.trim()).catch((e) =>
        console.error('Case reply email failed:', e.message)
      )

      res.json({ success: true, data: item })
    } catch (err) {
      console.error(err)
      res.status(500).json({ success: false, message: 'Server error' })
    }
  }
)

// DELETE /api/notifications/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// ---- PUBLIC ----

// GET /api/notifications/public/:email — client checks the status of their case
// Returns only safe fields (no admin internals), newest first.
router.get('/public/:email', async (req, res) => {
  try {
    const email = String(req.params.email || '').trim().toLowerCase()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' })
    }

    const items = await Notification.find({ email }).sort({ createdAt: -1 }).limit(20)

    res.json({
      success: true,
      data: items.map((n) => ({
        _id: n._id,
        name: n.name,
        regarding: n.regarding,
        createdAt: n.createdAt,
        status: n.reply ? 'replied' : 'received',
        reply: n.reply || '',
        repliedAt: n.repliedAt,
      })),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

module.exports = router