import { get, put } from '@vercel/blob'
import { deliver, escapeHtml, readJson, sendJson } from './_mail.js'

const PATH = 'fm-person-access.json'

function empty() {
  return { savedAt: 0, draft: {}, submissions: [] }
}

function normalize(raw) {
  const data = raw && typeof raw === 'object' ? raw : {}
  const latest = Array.isArray(data.submissions) && data.submissions.length
    ? data.submissions[data.submissions.length - 1]
    : null
  return {
    savedAt: Number(data.savedAt) || 0,
    draft: data.draft && typeof data.draft === 'object' ? data.draft : {},
    submissions: Array.isArray(data.submissions) ? data.submissions : [],
    latest,
  }
}

function csvFrom(payload) {
  const answers = Array.isArray(payload?.answers) ? payload.answers : []
  const moduleTitles = []
  for (const a of answers) {
    const mods = a.modules && typeof a.modules === 'object' ? a.modules : {}
    for (const row of Object.values(mods)) {
      if (row && row.title && !moduleTitles.includes(row.title)) moduleTitles.push(row.title)
    }
  }
  const rows = [[
    'Name',
    'KEKA designation',
    'Plant',
    'KEKA code',
    'System',
    'Portal role',
    'Changed',
    ...moduleTitles,
  ]]
  for (const a of answers) {
    const mods = a.modules && typeof a.modules === 'object' ? a.modules : {}
    const byTitle = {}
    for (const row of Object.values(mods)) {
      if (row && row.title) byTitle[row.title] = row.text || ''
    }
    rows.push([
      a.name || '',
      a.designation || '',
      a.location || '',
      a.id || '',
      a.system || '',
      a.role || '',
      a.changed ? 'Changed' : 'Same',
      ...moduleTitles.map((title) => byTitle[title] || ''),
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
    return normalize(JSON.parse(text))
  } catch {
    return empty()
  }
}

async function saveState(state) {
  await put(
    PATH,
    JSON.stringify({ savedAt: state.savedAt, draft: state.draft, submissions: state.submissions }),
    {
      access: 'private',
      allowOverwrite: true,
      addRandomSuffix: false,
      contentType: 'application/json',
      cacheControlMaxAge: 60,
    },
  )
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
      return sendJson(res, 200, {
        ok: true,
        savedAt: state.savedAt,
        draft: state.draft,
        count: state.submissions.length,
        latest: state.latest,
      })
    }
    if (req.method === 'POST') {
      const incoming = await readJson(req)
      const state = await loadState()
      if (incoming.draft && typeof incoming.draft === 'object') {
        state.draft = incoming.draft
      }
      state.savedAt = Date.now()
      if (incoming.mode === 'submit') {
        const submission = {
          submittedAt: incoming.submittedAt || new Date().toISOString(),
          answers: Array.isArray(incoming.answers) ? incoming.answers : [],
        }
        state.submissions.push(submission)
        try {
          await deliver({
            subject: 'MAKEEN FM person Search / Submit / Download submitted',
            html: `
              <p>Person Search / Submit / Download ticks submitted.</p>
              <p><b>When:</b> ${escapeHtml(submission.submittedAt)}</p>
            `,
            attachment: {
              filename: 'person-search-submit-download.csv',
              content: csvFrom(submission),
            },
          })
        } catch (mailError) {
          console.error(mailError)
        }
      }
      await saveState(state)
      return sendJson(res, 200, { ok: true, savedAt: state.savedAt, draft: state.draft })
    }
    return sendJson(res, 405, { ok: false, message: 'Method not allowed' })
  } catch (error) {
    console.error(error)
    sendJson(res, 500, { ok: false, message: error.message || 'Could not save answers' })
  }
}
