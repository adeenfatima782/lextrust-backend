const express = require('express')
const { body, validationResult } = require('express-validator')
const Subscriber = require('../models/Subscriber')
const { sendNewsletterWelcome } = require('../utils/email')

const router = express.Router()

// POST /api/newsletter — subscribe
router.post(
  '/',
  [body('email').trim().isEmail().withMessage('Valid email is required')],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const email = req.body.email.toLowerCase().trim()

    try {
      const existing = await Subscriber.findOne({ email })

      if (existing) {
        if (existing.status === 'unsubscribed') {
          existing.status = 'active'
          existing.subscribedDate = new Date()
          await existing.save()
          return res.json({ success: true, message: 'Welcome back! You are re-subscribed.', data: existing })
        }
        return res.status(409).json({ success: false, message: 'This email is already subscribed.' })
      }

      const subscriber = await Subscriber.create({ email })
      sendNewsletterWelcome(email) // fire and forget

      return res.status(201).json({ success: true, message: 'Subscribed successfully', data: subscriber })
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ success: false, message: 'This email is already subscribed.' })
      }
      console.error(err)
      return res.status(500).json({ success: false, message: 'Server error, please try again later' })
    }
  }
)

// POST /api/newsletter/unsubscribe — public unsubscribe link (optional use)
router.post('/unsubscribe', [body('email').trim().isEmail()], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })

  const email = req.body.email.toLowerCase().trim()
  const sub = await Subscriber.findOneAndUpdate({ email }, { status: 'unsubscribed' }, { new: true })
  if (!sub) return res.status(404).json({ success: false, message: 'Email not found' })
  return res.json({ success: true, message: 'You have been unsubscribed.', data: sub })
})

module.exports = router
