require('dotenv').config()
const path = require('path')
const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const connectDB = require('./config/db')

const app = express()

// ---- DB ----
connectDB()

// ---- Core middleware ----
app.use(express.json())

// ---- Uploaded images (admin-picked photos for lawyers/testimonials) ----
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: function (origin, callback) {
      // No origin (Postman/curl/server-to-server) — allow
      if (!origin) return callback(null, true)
      // Any localhost/127.0.0.1 port — always allow in dev, so Vite can
      // pick any free port (5173, 5174, 5175, ...) without editing .env
      if (/^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return callback(null, true)
      // Otherwise must be explicitly listed in CLIENT_ORIGIN (used in production)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  })
)

// Basic rate limiting for public form endpoints (anti-spam)
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many requests, please try again later.' },
})
app.use('/api/contact', formLimiter)
app.use('/api/newsletter', formLimiter)

// ---- Routes ----
app.get('/api/health', (req, res) => res.json({ success: true, message: 'LexTrust API is running' }))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/contact', require('./routes/contact'))
app.use('/api/newsletter', require('./routes/newsletter'))
app.use('/api/practice-areas', require('./routes/practiceAreas'))
app.use('/api/lawyers', require('./routes/lawyers'))
app.use('/api/testimonials', require('./routes/testimonials'))
app.use('/api/site-content', require('./routes/siteContent'))
app.use('/api/settings', require('./routes/settings'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/upload', require('./routes/upload'))

// ---- 404 ----
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }))

// ---- Error handler ----
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 LexTrust API running on http://localhost:${PORT}`))