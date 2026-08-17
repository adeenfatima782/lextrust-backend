const mongoose = require('mongoose')

async function connectDB() {
  const uri = process.env.MONGO_URI

  if (!uri) {
    throw new Error('MONGO_URI is not configured')
  }

  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection
    }

    await mongoose.connect(uri, {
      dbName: process.env.DB_NAME || 'lextrust',
    })

    console.log(
      `✅ MongoDB connected: ${mongoose.connection.host} / db: ${mongoose.connection.name}`
    )

    return mongoose.connection
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message)
    throw err
  }
}

module.exports = connectDB