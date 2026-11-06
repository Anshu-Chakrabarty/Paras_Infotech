import { get, put } from '@vercel/blob'
import { deliver, escapeHtml, readJson, sendJson } from './_mail.js'

const PATH = 'fm-access.json'

function empty() {
  return { submissions: [] }
}

function csvFrom(payload) {
  const answers = payload?.answers && typeof payload.answers === 'object' ? payload.answers : {}
  const rows = [['Question', 'Designations', 'People', 'People covered']]
  for (const a of Object.values(answers)) {
    rows.push([
      a.question || '',
      Array.isArray(a.designations) ? a.designations.join('; ') : '',
      Array.isArray(a.people)
        ? a.people.map((x) => `${x.name || ''} (${x.designation || ''})`).join('; ')
        : '',
      String(a.coveredCount ?? ''),
    ])
  }
  return rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
}

async function loadState() {
  try {
    const result = await get(PATH, { access: 'private', useCache: false })
    if (!result || result.statusCode !== 200 || !result.stream) return empty()
    const text = await new Response(result.stream).text()
    if (!text.trim()) return empty()
    const data = JSON.parse(text)
    return { submissions: Array.isArray(data.submissions) ? data.submissions : [] }
  } catch {
    return empty()
  }
}

async function saveState(state) {
  await put(PATH, JSON.stringify(state), {
    access: 'private',
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
  })
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return sendJson(res, 204, { ok: true })
  try {
    if (req.method === 'GET') {
      const state = await loadState()
      const latest = state.submissions[state.submissions.length - 1] || null
      return sendJson(res, 200, {
        ok: true,
        count: state.submissions.length,
        latest,
      })
    }
    if (req.method === 'POST') {
      const incoming = await readJson(req)
      const submission = {
        submittedAt: incoming.submittedAt || new Date().toISOString(),
        filledBy: incoming.filledBy && typeof incoming.filledBy === 'object' ? incoming.filledBy : {},
        answers: incoming.answers && typeof incoming.answers === 'object' ? incoming.answers : {},
      }
      const state = await loadState()
      state.submissions.push(submission)
      await saveState(state)
      try {
        const who = submission.filledBy || {}
        await deliver({
          subject: 'MAKEEN FM Access Management submitted',
          html: `
            <p>Access Management submitted.</p>
            <p><b>Name:</b> ${escapeHtml(who.name || '')}<br/>
            <b>Email:</b> ${escapeHtml(who.email || '')}<br/>
            <b>When:</b> ${escapeHtml(submission.submittedAt)}</p>
          `,
          attachment: {
            filename: 'access-management-answers.csv',
            content: csvFrom(submission),
          },
        })
      } catch (mailError) {
        console.error(mailError)
      }
      return sendJson(res, 200, { ok: true, submittedAt: submission.submittedAt })
    }
    return sendJson(res, 405, { ok: false, message: 'Method not allowed' })
  } catch (error) {
    console.error(error)
    sendJson(res, 500, { ok: false, message: error.message || 'Could not save answers' })
  }
}
