const express = require('express')
const { body, validationResult } = require('express-validator')
const Lead = require('../models/Lead')
const { notifyAdminOfNewLead } = require('../utils/email')

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

      notifyAdminOfNewLead(lead) // fire and forget

      return res.status(201).json({ success: true, message: 'Message sent successfully', data: lead })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ success: false, message: 'Server error, please try again later' })
    }
  }
)

module.exports = router
