import { get, put } from '@vercel/blob'
import { readJson, sendJson } from './_mail.js'

const PATH = 'fm-review.json'

function empty() {
  return { comments: {}, queries: {}, savedAt: 0 }
}

function normalize(raw) {
  const data = raw && typeof raw === 'object' ? raw : {}
  return {
    comments: data.comments && typeof data.comments === 'object' ? data.comments : {},
    queries: data.queries && typeof data.queries === 'object' ? data.queries : {},
    savedAt: Number(data.savedAt) || 0,
  }
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
      return sendJson(res, 200, await loadState())
    }
    if (req.method === 'POST') {
      const incoming = normalize(await readJson(req))
      incoming.savedAt = Date.now()
      await saveState(incoming)
      return sendJson(res, 200, incoming)
    }
    return sendJson(res, 405, { ok: false, message: 'Method not allowed' })
  } catch (error) {
    console.error(error)
    sendJson(res, 500, { ok: false, message: error.message || 'Could not save comments' })
  }
}
