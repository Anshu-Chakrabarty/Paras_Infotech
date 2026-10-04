import { deliver, escapeHtml, readJson, sendJson } from './_mail.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { ok: false, message: 'Method not allowed' })
  try {
    const { name, email, phone, enquiryType, message } = await readJson(req)
    if (!name?.trim() || !email?.trim() || !enquiryType?.trim() || !message?.trim()) {
      return sendJson(res, 400, { ok: false, message: 'Please fill in all required fields.' })
    }
    const html = `
      <b>Name:</b> ${escapeHtml(name)}<br/>
      <b>PhoneNo:</b> ${escapeHtml(phone)}<br/>
      <b>EmailId:</b> ${escapeHtml(email)}<br/><br/>
      <b>Subject:</b> ${escapeHtml(enquiryType)}<br/><br/>
      <b>Message:</b> ${escapeHtml(message)}
    `
    await deliver({ subject: `Contact: ${enquiryType}`, html })
    sendJson(res, 200, { ok: true, message: 'Thank you for connecting with us We will respond to you shortly.' })
  } catch (error) {
    console.error(error)
    sendJson(res, 500, { ok: false, message: error.message || 'Internal server error!' })
  }
}
