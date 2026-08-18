const express = require('express')
const multer = require('multer')
const streamifier = require('streamifier')
const cloudinary = require('../config/cloudinary')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

// Vercel's filesystem is read-only, so we DON'T write to disk anymore.
// multer.memoryStorage() keeps the uploaded file in RAM only,
// then we stream it straight to Cloudinary.
const storage = multer.memoryStorage()

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
      const result = await uploadBufferToCloudinary(req.file.buffer)
      res.json({ success: true, url: result.secure_url, path: result.secure_url })
    } catch (uploadErr) {
      console.error('Cloudinary upload failed:', uploadErr)
      res.status(500).json({ success: false, message: 'Image upload failed' })
    }
  })
})

module.exports = router