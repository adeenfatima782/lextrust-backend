require('dotenv').config()
const path = require('path')
const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const connectDB = require('./config/db')

const app = express()

// ---- DB ----
// ---- DB ----
connectDB().catch((err) => {
  console.error('❌ Database connection failed:', err.message)
})
// ---- Core middleware ----
app.use(express.json())

// ---- Uploaded images ----
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, mobile apps, server-to-server)
      if (!origin) return callback(null, true)
      
      // Allow localhost/127.0.0.1 ports for local development
      if (/^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return callback(null, true)
      
      // Production origins check
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      
      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  })
)

// Basic rate limiting for public form endpoints
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many requests, please try again later.' },
})

app.use('/api/contact', formLimiter)
app.use('/api/newsletter', formLimiter)

// ---- Root / Health Check Routes ----
// Prevents Vercel 404 on base URL hit
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LexTrust API is running live on Vercel!'
  })
})

app.get('/api/health', (req, res) => res.json({ success: true, message: 'LexTrust API is running' }))

// ---- Routes ----
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

// ---- 404 Handler ----
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }))

// ---- Error Handler ----
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' })
})

// ---- Server Listener for Local Dev ----
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => console.log(`🚀 LexTrust API running on http://localhost:${PORT}`))
}

// ---- Export for Vercel Serverless ----
module.exports = app