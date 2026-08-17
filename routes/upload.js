const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

// Store uploaded images on disk under /uploads (served statically by server.js)
const uploadDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    cb(null, unique)
  },
})

const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, WEBP or GIF images are allowed'))
    }
    cb(null, true)
  },
})

// ADMIN — upload a single image, used by the admin dashboard's photo pickers
// (Lawyers, Testimonials). Returns a full URL the frontend/admin can use
// directly as the "photo" value — no manual URL typing needed.
router.post('/image', requireAdmin, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message })
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' })
    }
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
    res.json({ success: true, url, path: `/uploads/${req.file.filename}` })
  })
})

module.exports = router
