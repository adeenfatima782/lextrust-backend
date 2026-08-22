const express = require('express')
const { body, validationResult } = require('express-validator')
const Lead = require('../models/Lead')
const Notification = require('../models/Notification')
const { notifyAdminOfNewLead, sendLeadConfirmationEmail } = require('../utils/email')

const router = express.Router()

// POST /api/contact  — used by Home page "Let's Talk" section AND the /contact page
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('phone').optional({ checkFalsy: true }).trim(),
    body('message').optional({ checkFalsy: true }).trim(),
    body('regarding').optional({ checkFalsy: true }).trim(),
    body('source').optional().isIn(['home', 'contact-page']),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    try {
      const { name, email, phone, message, regarding, source } = req.body
      const lead = await Lead.create({
        name,
        email,
        phone,
        message,
        regarding,
        source: source === 'home' ? 'home' : 'contact-page',
      })

      notifyAdminOfNewLead(lead) // fire and forget — email to admin

      // Auto-confirmation email to the CLIENT so they know their case reached us
      sendLeadConfirmationEmail(lead).catch((e) =>
        console.error('Client confirmation email failed:', e.message)
      )

      // Create an in-app notification for the admin dashboard (fire and forget)
      Notification.create({
        leadId: lead._id,
        name,
        email,
        regarding: regarding || '',
        message: message || '',
        source: source === 'home' ? 'home' : 'contact-page',
      }).catch((e) => console.error('Notification create failed:', e.message))

      return res.status(201).json({ success: true, message: 'Message sent successfully', data: lead })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ success: false, message: 'Server error, please try again later' })
    }
  }
)

module.exports = router
