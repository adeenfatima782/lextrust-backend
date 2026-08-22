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

function wrapHtml(title, bodyHtml) {
  return `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f6f3ea;padding:24px;">
    <div style="background:#20201d;border-radius:14px 14px 0 0;padding:22px 28px;">
      <span style="color:#a8703c;font-size:13px;font-weight:700;letter-spacing:2px;">LEXTRUST</span>
      <h1 style="color:#fffdf8;font-size:20px;margin:8px 0 0;">${title}</h1>
    </div>
    <div style="background:#fffdf8;border-radius:0 0 14px 14px;padding:26px 28px;border:1px solid #e5e0d0;border-top:none;color:#2c2b26;font-size:15px;line-height:1.7;">
      ${bodyHtml}
      <p style="margin-top:26px;padding-top:16px;border-top:1px solid #e5e0d0;color:#6f6b60;font-size:12.5px;">
        This is an automated message from the LexTrust website. You can always check your case status
        on our Contact page using the same email address.
      </p>
    </div>
  </div>`
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

// Auto-confirmation sent to the CLIENT as soon as they submit the form,
// so they immediately know their case reached us.
async function sendLeadConfirmationEmail(lead) {
  if (!isEmailEnabled()) return
  try {
    const transporter = getTransporter()
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: lead.email,
      subject: 'We received your inquiry — LexTrust',
      html: wrapHtml(
        'We received your message',
        `
        <p>Dear ${lead.name || 'Client'},</p>
        <p>Thank you for reaching out to <b>LexTrust</b>. Your inquiry has been received
        successfully and one of our attorneys will review it shortly.</p>
        ${lead.regarding ? `<p><b>Regarding:</b> ${lead.regarding}</p>` : ''}
        ${lead.message ? `<div style="background:#f6f3ea;border-left:3px solid #a8703c;border-radius:0 10px 10px 0;padding:12px 16px;margin:14px 0;"><i>"${String(lead.message).replace(/</g, '<').replace(/\n/g, '<br/>')}"</i></div>` : ''}
        <p>You can track the status of your case anytime on our Contact page under
        <b>"Check your case status"</b> using this email address — any reply from our team
        will appear there.</p>
        <p style="margin-bottom:0;">Warm regards,<br/><b>The LexTrust Team</b></p>
        `,
      ),
    })
  } catch (err) {
    console.error('⚠️  Failed to send client confirmation email:', err.message)
  }
}

// Sent when the admin replies to a case notification in the dashboard.
async function sendCaseReplyEmail(notification, reply) {
  if (!isEmailEnabled()) return
  try {
    const transporter = getTransporter()
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: notification.email,
      replyTo: process.env.ADMIN_NOTIFY_EMAIL || undefined,
      subject: 'Re: Your inquiry — LexTrust Team',
      html: wrapHtml(
        'A reply from the LexTrust team',
        `
        <p>Dear ${notification.name || 'Client'},</p>
        <p>Thank you for contacting <b>LexTrust</b>. Our team has reviewed your inquiry
        and here is our response:</p>
        <div style="background:#f6f3ea;border-left:3px solid #a8703c;border-radius:0 10px 10px 0;padding:14px 18px;margin:14px 0;">
          ${String(reply).replace(/</g, '<').replace(/\n/g, '<br/>')}
        </div>
        ${notification.regarding ? `<p><b>Your inquiry was regarding:</b> ${notification.regarding}</p>` : ''}
        <p>If you would like to discuss further, simply reply to this email or reach us
        through the Contact page — we are happy to help.</p>
        <p style="margin-bottom:0;">Warm regards,<br/><b>The LexTrust Team</b></p>
        `,
      ),
    })
  } catch (err) {
    console.error('⚠️  Failed to send case reply email:', err.message)
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

module.exports = {
  notifyAdminOfNewLead,
  sendLeadConfirmationEmail,
  sendCaseReplyEmail,
  sendNewsletterWelcome,
  isEmailEnabled,
}