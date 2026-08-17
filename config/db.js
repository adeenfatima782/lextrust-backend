const mongoose = require('mongoose')

async function connectDB() {
  const uri = process.env.MONGO_URI
  if (!uri || uri.includes('<username>')) {
    console.error('\n❌ MONGO_URI is not set correctly in your .env file.')
    console.error('   Open .env and paste your real MongoDB Atlas connection string.\n')
    process.exit(1)
  }

  try {
    await mongoose.connect(uri, {
      dbName: process.env.DB_NAME || 'lextrust',
    })
    console.log(`✅ MongoDB connected: ${mongoose.connection.host} / db: ${mongoose.connection.name}`)
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message)
    process.exit(1)
  }
}

module.exports = connectDB
