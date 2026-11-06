import * as XLSX from 'xlsx'
import type { AppData } from './data'

type Row = Record<string, unknown>
const CRORE = 10_000_000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const
const LONG: Record<string, string> = {
  january: 'Jan', february: 'Feb', march: 'Mar', april: 'Apr', may: 'May', june: 'Jun',
  july: 'Jul', august: 'Aug', september: 'Sep', october: 'Oct', november: 'Nov', december: 'Dec',
}
const FILLS: Record<string, string> = {
  Service: '#16a34a',
  Projects: '#0f766e',
  'Parts & Components': '#65a30d',
  FM: '#a16207',
  'Gas equipment': '#64748b',
}
const SEG: Record<string, string> = {
  systems: 'Projects',
  service: 'Service',
  fs: 'Service',
  spares: 'Parts & Components',
  prosupply: 'Gas equipment',
  fm: 'FM',
  mgei: 'Gas equipment',
  sales: 'Projects',
  services: 'Service',
}
const COST: Record<string, string> = {
  salaries: 'Staff costs',
  it: 'G&A',
  'professional fees': 'G&A',
  travel: 'Sales expense',
  'sales promotion': 'Sales expense',
  'other costs and rev': 'Overheads',
  'other expenses': 'Overheads',
  'rent, rates & taxes': 'Overheads',
  insurance: 'Overheads',
}

function norm(v: unknown) {
  return String(v ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function findSheet(wb: XLSX.WorkBook, ...names: string[]) {
  const want = names.map(norm)
  return wb.SheetNames.find((s) => want.includes(norm(s)))
}

function aoa(wb: XLSX.WorkBook, ...names: string[]) {
  const name = findSheet(wb, ...names)
  if (!name) return [] as unknown[][]
  return XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[name], { header: 1, defval: '', raw: true })
}

function objects(wb: XLSX.WorkBook, ...names: string[]) {
  const name = findSheet(wb, ...names)
  if (!name) return [] as Row[]
  return XLSX.utils.sheet_to_json<Row>(wb.Sheets[name], { defval: '' })
}

function num(v: unknown, fallback = 0) {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  const n = Number(String(v ?? '').replace(/[, ]/g, ''))
  return Number.isFinite(n) ? n : fallback
}

function crore(v: unknown) {
  return Math.round((num(v) / CRORE) * 10000) / 10000
}

function pct(v: unknown) {
  const x = num(v)
  return Math.round((Math.abs(x) > 0 && Math.abs(x) < 2 ? x * 100 : x) * 10) / 10
}

function str(row: unknown[], i: number) {
  return String(row[i] ?? '').trim()
}

function excelDay(v: Date) {
  const serial = Math.round(v.getTime() / 86400000 + 25569)
  return new Date(Date.UTC(1899, 11, 30) + serial * 86400000)
}

function monthFromValue(v: unknown): string | null {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return MONTHS[excelDay(v).getUTCMonth()]
  if (typeof v === 'number' && v > 20000) {
    const d = new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 86400000)
    if (!Number.isNaN(d.getTime())) return MONTHS[d.getUTCMonth()]
  }
  const s = String(v ?? '').trim()
  if (!s || /grand/i.test(s)) return null
  const long = s.match(/^(january|february|march|april|may|june|july|august|september|october|november|december)\s*-?\s*(\d{2,4})/i)
  if (long) return LONG[long[1].toLowerCase()]
  const iso = s.match(/(\d{4})-(\d{2})/)
  if (iso) return MONTHS[Number(iso[2]) - 1]
  return null
}

function yearFromValue(v: unknown): string | null {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return String(excelDay(v).getUTCFullYear())
  const s = String(v ?? '')
  const y = s.match(/(20\d{2})/)
  if (y) return y[1]
  const short = s.match(/\b(\d{2})\b/)
  if (short && Number(short[1]) >= 20) return `20${short[1]}`
  return null
}

function monthKey(month: string, year: string) {
  const long = Object.entries(LONG).find(([, short]) => short === month)?.[0]
  const label = long ? long[0].toUpperCase() + long.slice(1) : month
  return `${label}-${year}`
}

type Metrics = {
  m: string
  rev: number
  gp: number
  ebitda: number
  ebitdaPct: number
  np: number
  rate: number
  mix: AppData['mix']
  costLines: AppData['costLines']
}

function pnlMetrics(grid: unknown[][], amtCol: number, month: string): Metrics {
  const out = { rev: 0, gp: 0, ebitda: 0, ebitdaPct: 0, np: 0 }
  const mix: Record<string, number> = {}
  const buckets: Record<string, number> = {}
  let inTo = false
  let inOh = false
  for (const r of grid) {
    const a = str(r, 0).toLowerCase()
    const b = str(r, 1)
    const bl = b.toLowerCase()
    const amt = num(r[amtCol])
    const p = r[amtCol + 1]
    if (a === 'turn over') {
      inTo = true
      continue
    }
    if (inTo && b && amt && SEG[bl]) {
      mix[SEG[bl]] = (mix[SEG[bl]] ?? 0) + amt
      continue
    }
    if (inTo && !b && amt) {
      out.rev = amt
      inTo = false
      continue
    }
    if (bl === 'gross profit') out.gp = pct(p)
    if (a === 'overheads') {
      inOh = true
      continue
    }
    if (inOh && a === 'ebitda') inOh = false
    if (inOh && b) {
      const key = COST[bl.trim()] ?? 'Overheads'
      buckets[key] = (buckets[key] ?? 0) + amt
    }
    if (a === 'ebitda') {
      out.ebitda = amt
      out.ebitdaPct = pct(p)
    }
    if (a === 'net profit' || bl === 'net profit') out.np = amt
  }
  return {
    m: month,
    rev: crore(out.rev),
    gp: out.gp,
    ebitda: crore(out.ebitda),
    ebitdaPct: out.ebitdaPct,
    np: crore(out.np),
    rate: 97.2,
    mix: Object.entries(mix).map(([name, value]) => ({ name, value: crore(value), fill: FILLS[name] ?? '#64748b' })),
    costLines: Object.entries(buckets).map(([name, value]) => ({
      name,
      actual: Math.round((value / 1e5) * 10) / 10,
      plan: Math.round((value / 1e5) * 10) / 10,
    })),
  }
}

function monthColumns(grid: unknown[][]) {
  const header = grid[0] ?? []
  const cols: { month: string; year: string; amt: number }[] = []
  header.forEach((v, i) => {
    const month = monthFromValue(v)
    if (!month) return
    const year = yearFromValue(v) ?? '2026'
    cols.push({ month, year, amt: i })
  })
  return cols
}

function pick(row: Row, ...aliases: string[]) {
  const keys = Object.keys(row)
  for (const alias of aliases) {
    const hit = keys.find((k) => norm(k) === norm(alias))
    if (hit != null && row[hit] !== undefined && row[hit] !== '') return row[hit]
  }
  return undefined
}

function tidyPlant(name: string) {
  return name.replace(/\s*-?\s*FM\s*$/i, '').replace(/\s+/g, ' ').trim()
}

function omcOf(name: string) {
  if (/^IOCL/i.test(name)) return 'IOCL'
  if (/^BPCL/i.test(name)) return 'BPCL'
  if (/^HPCL/i.test(name)) return 'HPCL'
  return 'Other'
}

export function isNativeMis(wb: XLSX.WorkBook) {
  return Boolean(findSheet(wb, 'P&L Consolidated', 'Monthly P&L')) && Boolean(findSheet(wb, 'Order intake & Backlog', 'Data', 'Control Sheet'))
}

export function parseNativeMis(wb: XLSX.WorkBook): { patch: Partial<AppData>; found: string[]; close: { year: string; month: string } } {
  const found: string[] = []
  const monthlyGrid = aoa(wb, 'Monthly P&L')
  const consGrid = aoa(wb, 'P&L Consolidated')
  let cols = monthColumns(monthlyGrid)
  let grid = monthlyGrid
  if (!cols.length) {
    grid = consGrid
    const dataRows = objects(wb, 'Data')
    const sample = dataRows.find((r) => monthFromValue(pick(r, 'Month / Year')))
    const month = monthFromValue(pick(sample ?? {}, 'Month / Year')) ?? 'Jan'
    const year = yearFromValue(pick(sample ?? {}, 'Month / Year')) ?? '2026'
    cols = [{ month, year, amt: 2 }]
  }
  const metrics = cols.map((c) => pnlMetrics(grid, c.amt, c.month))
  const last = metrics.at(-1)!
  const close = { year: cols.at(-1)?.year ?? '2026', month: last.m }
  found.push('Monthly', 'Mix', 'CostLines')

  const orderGrid = aoa(wb, 'Order intake & Backlog')
  const mixBilled = Object.fromEntries(last.mix.map((m) => [m.name, m.value]))
  const ordersBy: Record<string, AppData['orders'][number]> = {}
  if (orderGrid.length) {
    found.push('Orders')
    for (const r of orderGrid.slice(2)) {
      const dept = str(r, 1)
      if (!dept) continue
      const name = SEG[dept.toLowerCase()] ?? dept
      const intake = crore(r[3])
      const billed = mixBilled[name] ?? crore(r[6])
      const backlog = crore(r[4])
      const cur = ordersBy[name]
      if (!cur) {
        ordersBy[name] = {
          name,
          intake,
          budget: intake,
          billed,
          backlog,
          b2b: billed ? Math.round((intake / billed) * 100) / 100 : 0,
          cover: 0,
          reserved: false,
        }
        continue
      }
      cur.intake = Math.round((cur.intake + intake) * 10000) / 10000
      cur.budget = cur.intake
      cur.backlog = Math.round((cur.backlog + backlog) * 10000) / 10000
      cur.billed = mixBilled[name] ?? Math.round((cur.billed + billed) * 10000) / 10000
      cur.b2b = cur.billed ? Math.round((cur.intake / cur.billed) * 100) / 100 : 0
    }
  }

  const dataRows = objects(wb, 'Data')
  const plants: AppData['plants'] = []
  if (dataRows.length) {
    found.push('Plants')
    const want = monthKey(close.month, close.year)
    const by: Record<string, number> = {}
    for (const r of dataRows) {
      if (String(pick(r, 'Account') ?? '') !== '4007') continue
      const period = String(pick(r, 'Month / Year') ?? '').trim()
      if (period && period !== want) continue
      const raw = String(pick(r, 'Offset Account Name', 'Project') ?? '').trim()
      if (!raw || /unbilled/i.test(raw)) continue
      const name = tidyPlant(raw)
      by[name] = (by[name] ?? 0) + num(pick(r, 'Amount'))
    }
    plants.push(
      ...Object.entries(by)
        .map(([name, v]) => ({ name, v: crore(-v) }))
        .filter((p) => p.v)
        .sort((a, b) => b.v - a.v)
        .slice(0, 12),
    )
  }

  const contracts: AppData['contracts'] = plants.map((p) => ({
    plant: p.name,
    omc: omcOf(p.name),
    region: '',
    reported: 'FM',
    amc: '',
    end: '',
    days: 0,
    rev: p.v,
    eng: 0,
    cm: 0,
    status: 'Active',
  }))
  if (contracts.length) found.push('Contracts')

  return {
    close,
    found,
    patch: {
      monthly: metrics.map((row) => ({
        m: row.m,
        rev: row.rev,
        gp: row.gp,
        ebitda: row.ebitda,
        ebitdaPct: row.ebitdaPct,
        np: row.np,
        rate: row.rate,
      })),
      mix: last.mix,
      costLines: last.costLines,
      orders: Object.values(ordersBy),
      plants,
      contracts,
    },
  }
}
