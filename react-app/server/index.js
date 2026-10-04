import express from 'express'
import cors from 'cors'
import multer from 'multer'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const port = Number(process.env.PORT || 5000)
const contactEmail = process.env.CONTACT_EMAIL || 'parasinfotechsolutions@gmail.com'
const uploadDir = path.join(__dirname, 'uploads')
const logFile = path.join(__dirname, 'submissions.log')

fs.mkdirSync(uploadDir, { recursive: true })

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
})

app.use(cors())
app.use(express.json({ limit: '1mb' }))

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function createTransport() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.parasinfotechsolutions.com',
    port: Number(process.env.SMTP_PORT || 25),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

async function deliver({ subject, html, attachment }) {
  const transport = createTransport()
  if (!transport) {
    const record = {
      at: new Date().toISOString(),
      subject,
      html,
      attachment: attachment?.filename || null,
    }
    fs.appendFileSync(logFile, `${JSON.stringify(record)}\n`)
    if (attachment) {
      const safeName = `${Date.now()}-${attachment.filename.replace(/[^\w.-]+/g, '_')}`
      fs.writeFileSync(path.join(uploadDir, safeName), attachment.content)
    }
    return
  }

  await transport.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'Paras Infotech Solutions'}" <${process.env.SMTP_USER}>`,
    to: contactEmail,
    subject,
    html,
    attachments: attachment
      ? [{ filename: attachment.filename, content: attachment.content }]
      : undefined,
  })
}

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, enquiryType, message } = req.body || {}
  if (!name?.trim() || !email?.trim() || !enquiryType?.trim() || !message?.trim()) {
    return res.status(400).json({ ok: false, message: 'Please fill in all required fields.' })
  }

  const html = `
    <b>Name:</b> ${escapeHtml(name)}<br/>
    <b>PhoneNo:</b> ${escapeHtml(phone)}<br/>
    <b>EmailId:</b> ${escapeHtml(email)}<br/><br/>
    <b>Subject:</b> ${escapeHtml(enquiryType)}<br/><br/>
    <b>Message:</b> ${escapeHtml(message)}
  `

  try {
    await deliver({ subject: `Contact: ${enquiryType}`, html })
    res.json({ ok: true, message: 'Thank you for connecting with us We will respond to you shortly.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ ok: false, message: 'Internal server error!' })
  }
})

app.post('/api/careers', upload.single('cv'), async (req, res) => {
  const body = req.body || {}
  const required = ['name', 'email', 'education', 'skills', 'profession', 'about', 'message']
  if (required.some((key) => !String(body[key] || '').trim())) {
    return res.status(400).json({ ok: false, message: 'Please fill in all required fields.' })
  }

  const file = req.file
  if (file) {
    const extension = path.extname(file.originalname).toLowerCase()
    const allowedExtensions = ['.doc', '.docx', '.pdf']
    const allowedTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf',
    ]
    if (!allowedExtensions.includes(extension) || (file.mimetype && !allowedTypes.includes(file.mimetype))) {
      return res.status(400).json({ ok: false, message: 'Only .doc, .docx, and .pdf files are allowed.' })
    }
  }

  const html = `
    <b>Name:</b> ${escapeHtml(body.name)}<br/>
    <b>Phone Number:</b> ${escapeHtml(body.phone)}<br/>
    <b>Email:</b> ${escapeHtml(body.email)}<br/>
    <b>Educational Details:</b> ${escapeHtml(body.education)}<br/>
    <b>Experience:</b> ${escapeHtml(body.experience)}<br/>
    <b>Skills:</b> ${escapeHtml(body.skills)}<br/>
    <b>Profession:</b> ${escapeHtml(body.profession)}<br/>
    <b>Preferred Type of Engagement:</b> ${escapeHtml(body.engagement)}<br/>
    <b>About Yourself:</b> ${escapeHtml(body.about)}<br/>
    <b>Message:</b> ${escapeHtml(body.message)}
  `

  try {
    await deliver({
      subject: 'Careers Inquiry',
      html,
      attachment: file ? { filename: file.originalname, content: file.buffer } : null,
    })
    res.json({ ok: true, message: 'Thank you for connecting with us. We will respond to you shortly.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ ok: false, message: 'Internal server error!' })
  }
})

const distDir = path.join(__dirname, '..', 'dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next()
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})
