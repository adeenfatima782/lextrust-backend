const express = require('express')
const { requireAdmin } = require('../middleware/auth')
const Lead = require('../models/Lead')
const Subscriber = require('../models/Subscriber')

const router = express.Router()
router.use(requireAdmin) // everything in this file requires admin login

function toCSV(rows, columns) {
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const header = columns.join(',')
  const lines = rows.map((row) => columns.map((c) => escape(row[c])).join(','))
  return [header, ...lines].join('\n')
}

// ---------- Dashboard summary ----------
// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  const [totalLeads, unreadLeads, totalSubscribers, activeSubscribers] = await Promise.all([
    Lead.countDocuments(),
    Lead.countDocuments({ read: false }),
    Subscriber.countDocuments(),
    Subscriber.countDocuments({ status: 'active' }),
  ])
  res.json({ success: true, data: { totalLeads, unreadLeads, totalSubscribers, activeSubscribers } })
})

// ---------- Leads / Contact submissions (Home + Let's Talk combined inbox) ----------

// GET /api/admin/leads?source=home&read=false&search=john&page=1&limit=20
router.get('/leads', async (req, res) => {
  const { source, read, search, page = 1, limit = 20 } = req.query
  const filter = {}
  if (source) filter.source = source
  if (read !== undefined) filter.read = read === 'true'
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } },
    ]
  }

  const skip = (Number(page) - 1) * Number(limit)
  const [items, total] = await Promise.all([
    Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Lead.countDocuments(filter),
  ])

  res.json({ success: true, data: items, total, page: Number(page), pages: Math.ceil(total / limit) })
})

// GET /api/admin/leads/export.csv
router.get('/leads/export.csv', async (req, res) => {
  const leads = await Lead.find().sort({ createdAt: -1 }).lean()
  const csv = toCSV(
    leads.map((l) => ({ ...l, createdAt: new Date(l.createdAt).toISOString() })),
    ['name', 'email', 'phone', 'message', 'regarding', 'source', 'read', 'createdAt']
  )
  res.header('Content-Type', 'text/csv')
  res.attachment('leads.csv')
  res.send(csv)
})

// PUT /api/admin/leads/:id/read — mark read/unread
router.put('/leads/:id/read', async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, { read: req.body.read !== false }, { new: true })
  if (!lead) return res.status(404).json({ success: false, message: 'Not found' })
  res.json({ success: true, data: lead })
})

// DELETE /api/admin/leads/:id
router.delete('/leads/:id', async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id)
  if (!lead) return res.status(404).json({ success: false, message: 'Not found' })
  res.json({ success: true, message: 'Deleted' })
})

// ---------- Newsletter subscribers ----------

// GET /api/admin/subscribers?status=active&search=&page=1&limit=20
router.get('/subscribers', async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query
  const filter = {}
  if (status) filter.status = status
  if (search) filter.email = { $regex: search, $options: 'i' }

  const skip = (Number(page) - 1) * Number(limit)
  const [items, total] = await Promise.all([
    Subscriber.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Subscriber.countDocuments(filter),
  ])

  res.json({ success: true, data: items, total, page: Number(page), pages: Math.ceil(total / limit) })
})

// GET /api/admin/subscribers/export.csv
router.get('/subscribers/export.csv', async (req, res) => {
  const subs = await Subscriber.find().sort({ createdAt: -1 }).lean()
  const csv = toCSV(
    subs.map((s) => ({ ...s, subscribedDate: new Date(s.subscribedDate).toISOString() })),
    ['email', 'status', 'subscribedDate']
  )
  res.header('Content-Type', 'text/csv')
  res.attachment('subscribers.csv')
  res.send(csv)
})

// PUT /api/admin/subscribers/:id/status — unsubscribe/reactivate
router.put('/subscribers/:id/status', async (req, res) => {
  const status = req.body.status === 'unsubscribed' ? 'unsubscribed' : 'active'
  const sub = await Subscriber.findByIdAndUpdate(req.params.id, { status }, { new: true })
  if (!sub) return res.status(404).json({ success: false, message: 'Not found' })
  res.json({ success: true, data: sub })
})

// DELETE /api/admin/subscribers/:id
router.delete('/subscribers/:id', async (req, res) => {
  const sub = await Subscriber.findByIdAndDelete(req.params.id)
  if (!sub) return res.status(404).json({ success: false, message: 'Not found' })
  res.json({ success: true, message: 'Deleted' })
})

module.exports = router
