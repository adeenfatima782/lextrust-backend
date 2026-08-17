const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')
const { body, validationResult } = require('express-validator')
const Admin = require('../models/Admin')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
})

// POST /api/auth/login
router.post(
  '/login',
  loginLimiter,
  [body('email').trim().isEmail(), body('password').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Email and password are required' })

    const { email, password } = req.body
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() })
    if (!admin) return res.status(401).json({ success: false, message: 'Invalid credentials' })

    const match = await bcrypt.compare(password, admin.password)
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' })

    const token = jwt.sign(
      { id: admin._id, email: admin.email, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.json({ success: true, token, admin: { id: admin._id, email: admin.email, name: admin.name } })
  }
)

// GET /api/auth/me — verify token / get current admin
router.get('/me', requireAdmin, async (req, res) => {
  res.json({ success: true, admin: req.admin })
})

// PUT /api/auth/change-password
router.put(
  '/change-password',
  requireAdmin,
  [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 6 })],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' })

    const admin = await Admin.findById(req.admin.id)
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' })

    const match = await bcrypt.compare(req.body.currentPassword, admin.password)
    if (!match) return res.status(401).json({ success: false, message: 'Current password is incorrect' })

    admin.password = await bcrypt.hash(req.body.newPassword, 10)
    await admin.save()
    res.json({ success: true, message: 'Password updated successfully' })
  }
)

module.exports = router
