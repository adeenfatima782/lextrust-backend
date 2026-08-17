require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const connectDB = require('../config/db')

const PracticeArea = require('../models/PracticeArea')
const Lawyer = require('../models/Lawyer')
const Testimonial = require('../models/Testimonial')
const Admin = require('../models/Admin')
const Settings = require('../models/Settings')
const SiteContent = require('../models/SiteContent')

const practiceAreasData = require('./data/practiceAreas')
const lawyersData = require('./data/lawyers')
const testimonialsData = require('./data/testimonials')

async function run() {
  await connectDB()

  console.log('\n🌱 Seeding LexTrust database...\n')

  // ---- Practice Areas ----
  for (const [i, pa] of practiceAreasData.entries()) {
    await PracticeArea.findOneAndUpdate({ slug: pa.slug }, { ...pa, order: i }, { upsert: true, new: true, setDefaultsOnInsert: true })
  }
  console.log(`✅ Practice Areas: ${practiceAreasData.length}`)

  // ---- Lawyers ----
  for (const [i, l] of lawyersData.entries()) {
    await Lawyer.findOneAndUpdate({ slug: l.slug }, { ...l, order: i }, { upsert: true, new: true, setDefaultsOnInsert: true })
  }
  console.log(`✅ Lawyers: ${lawyersData.length}`)

  // ---- Testimonials ----
  for (const [i, t] of testimonialsData.entries()) {
    await Testimonial.findOneAndUpdate({ slug: t.slug }, { ...t, order: i }, { upsert: true, new: true, setDefaultsOnInsert: true })
  }
  console.log(`✅ Testimonials: ${testimonialsData.length}`)

  // ---- Default Settings ----
  await Settings.findOneAndUpdate({ singleton: 'main' }, {}, { upsert: true, setDefaultsOnInsert: true })
  console.log('✅ Default settings created')

  // ---- About page content (editable block) ----
  await SiteContent.findOneAndUpdate(
    { key: 'about-page' },
    {
      key: 'about-page',
      label: 'About Us Page',
      value: {
        heading: 'About LexTrust',
        intro: 'LexTrust is a full-service law firm dedicated to protecting our clients\u2019 rights and interests.',
        mission: 'To provide accessible, high-quality legal representation with honesty and care.',
        stats: [
          { label: 'Years of Experience', value: '20+' },
          { label: 'Cases Won', value: '1500+' },
          { label: 'Client Satisfaction', value: '98%' },
        ],
      },
    },
    { upsert: true, new: true }
  )
  console.log('✅ About page content seeded')

  // ---- First Admin user ----
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@lextrust.com').toLowerCase()
  const existingAdmin = await Admin.findOne({ email: adminEmail })
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'ChangeMe123!', 10)
    await Admin.create({ name: 'Admin', email: adminEmail, password: hashed })
    console.log(`✅ Admin user created -> ${adminEmail} (password from .env)`)
  } else {
    console.log(`ℹ️  Admin user already exists -> ${adminEmail}`)
  }

  console.log('\n🎉 Seeding complete!\n')
  await mongoose.connection.close()
  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
