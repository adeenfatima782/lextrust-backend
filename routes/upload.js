const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const streamifier = require('streamifier')
const cloudinary = require('../config/cloudinary')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

// Cloudinary is only used if its env vars are present. If not, we fall back
// to saving the file to the local /uploads folder (works for local dev and
// any host with a writable filesystem).
const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
)

const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

// Use memory storage so we can decide at runtime where to send the file.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, WEBP or GIF images are allowed'))
    }
    cb(null, true)
  },
})

// Helper: streams a buffer to Cloudinary and resolves with the result
function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'lextrust' }, // Cloudinary folder — change name if you like
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )
    streamifier.createReadStream(buffer).pipe(uploadStream)
  })
}

// Helper: saves a buffer to the local /uploads folder and returns an
// absolute URL so it works from any origin (admin + frontend).
function saveBufferToDisk(buffer, originalName, req) {
  const ext = (path.extname(originalName) || '.png').toLowerCase()
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
  const uploadsDir = path.join(__dirname, '..', 'uploads')
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
  const filePath = path.join(uploadsDir, filename)
  fs.writeFileSync(filePath, buffer)
  const base = `${req.protocol}://${req.get('host')}`
  return `${base}/uploads/${filename}`
}

// ADMIN — upload a single image, used by the admin dashboard's photo pickers
// (Lawyers, Testimonials). Returns a full URL the frontend/admin can use
// directly as the "photo" value — no manual URL typing needed.
router.post('/image', requireAdmin, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message })
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' })
    }

    try {
      if (cloudinaryConfigured) {
        const result = await uploadBufferToCloudinary(req.file.buffer)
        return res.json({ success: true, url: result.secure_url, path: result.secure_url })
      }

      // Local fallback — save to /uploads and return an absolute URL
      const url = saveBufferToDisk(req.file.buffer, req.file.originalname, req)
      return res.json({ success: true, url, path: url })
    } catch (uploadErr) {
      console.error('Image upload failed:', uploadErr)
      res.status(500).json({ success: false, message: 'Image upload failed' })
    }
  })
})

module.exports = router