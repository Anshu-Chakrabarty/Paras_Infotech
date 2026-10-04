import nodemailer from 'nodemailer'

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function deliver({ subject, html, attachment }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Mail is not configured on this host yet.')
  }
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.parasinfotechsolutions.com',
    port: Number(process.env.SMTP_PORT || 25),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  await transport.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'Paras Infotech Solutions'}" <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_EMAIL || 'parasinfotechsolutions@gmail.com',
    subject,
    html,
    attachments: attachment
      ? [{ filename: attachment.filename, content: attachment.content }]
      : undefined,
  })
}

export function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

export function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'))
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}
