const nodemailer = require('nodemailer')

function isEmailEnabled() {
  return process.env.EMAIL_ENABLED === 'true'
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

async function notifyAdminOfNewLead(lead) {
  if (!isEmailEnabled()) return
  try {
    const transporter = getTransporter()
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_NOTIFY_EMAIL,
      subject: `New contact form submission — ${lead.name}`,
      text: `New lead received:\n\nName: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone || '-'}\nSource: ${lead.source}\n\nMessage:\n${lead.message || '-'}`,
    })
  } catch (err) {
    console.error('⚠️  Failed to send admin notification email:', err.message)
  }
}

async function sendNewsletterWelcome(email) {
  if (!isEmailEnabled()) return
  try {
    const transporter = getTransporter()
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to the LexTrust Newsletter',
      text: `Thanks for subscribing to LexTrust updates! We'll keep you posted with our latest news and legal insights.`,
    })
  } catch (err) {
    console.error('⚠️  Failed to send welcome email:', err.message)
  }
}

module.exports = { notifyAdminOfNewLead, sendNewsletterWelcome, isEmailEnabled }
