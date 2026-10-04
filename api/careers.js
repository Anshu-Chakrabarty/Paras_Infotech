import { deliver, escapeHtml, sendJson } from './_mail.js'

export const config = { api: { bodyParser: false } }

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      const raw = Buffer.concat(chunks)
      const contentType = String(req.headers['content-type'] || '')
      const match = contentType.match(/boundary=(.*)$/)
      if (!match) return resolve({ fields: {}, file: null })
      const boundary = `--${match[1]}`
      const fields = {}
      let file = null
      for (const part of raw.toString('latin1').split(boundary)) {
        if (!part.includes('Content-Disposition')) continue
        const name = part.match(/name="([^"]+)"/)?.[1]
        if (!name) continue
        const filename = part.match(/filename="([^"]+)"/)?.[1]
        const split = part.indexOf('\r\n\r\n')
        if (split < 0) continue
        const body = part.slice(split + 4).replace(/\r\n--$/, '').replace(/\r\n$/, '')
        if (filename) {
          file = { filename, content: Buffer.from(body, 'latin1') }
        } else {
          fields[name] = Buffer.from(body, 'latin1').toString('utf8')
        }
      }
      resolve({ fields, file })
    })
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { ok: false, message: 'Method not allowed' })
  try {
    const { fields, file } = await parseMultipart(req)
    const required = ['name', 'email', 'education', 'skills', 'profession', 'about', 'message']
    if (required.some((key) => !String(fields[key] || '').trim())) {
      return sendJson(res, 400, { ok: false, message: 'Please fill in all required fields.' })
    }
    if (file?.filename) {
      const extension = file.filename.toLowerCase().slice(file.filename.lastIndexOf('.'))
      if (!['.doc', '.docx', '.pdf'].includes(extension)) {
        return sendJson(res, 400, { ok: false, message: 'Only .doc, .docx, and .pdf files are allowed.' })
      }
    }
    const html = `
      <b>Name:</b> ${escapeHtml(fields.name)}<br/>
      <b>Phone Number:</b> ${escapeHtml(fields.phone)}<br/>
      <b>Email:</b> ${escapeHtml(fields.email)}<br/>
      <b>Educational Details:</b> ${escapeHtml(fields.education)}<br/>
      <b>Experience:</b> ${escapeHtml(fields.experience)}<br/>
      <b>Skills:</b> ${escapeHtml(fields.skills)}<br/>
      <b>Profession:</b> ${escapeHtml(fields.profession)}<br/>
      <b>Preferred Type of Engagement:</b> ${escapeHtml(fields.engagement)}<br/>
      <b>About Yourself:</b> ${escapeHtml(fields.about)}<br/>
      <b>Message:</b> ${escapeHtml(fields.message)}
    `
    await deliver({
      subject: 'Careers Inquiry',
      html,
      attachment: file?.filename ? file : null,
    })
    sendJson(res, 200, { ok: true, message: 'Thank you for connecting with us. We will respond to you shortly.' })
  } catch (error) {
    console.error(error)
    sendJson(res, 500, { ok: false, message: error.message || 'Internal server error!' })
  }
}
