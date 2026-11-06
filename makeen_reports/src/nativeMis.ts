import * as XLSX from 'xlsx'
import { yearMonths, type AppData } from './data'

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
  const u = name.toUpperCase()
  if (u.includes('IOCL') || u.includes('INDIAN OIL') || u.includes('INDIANOIL')) return 'IOCL'
  if (u.includes('BPCL') || u.includes('BHARAT PETROLEUM')) return 'BPCL'
  if (u.includes('HPCL') || u.includes('HINDUSTAN PETROLEUM')) return 'HPCL'
  return 'Other'
}

function bsLines(wb: XLSX.WorkBook) {
  const grid = aoa(wb, 'BS')
  const out = { ar: 0, inv: 0, ap: 0, provision: 0 }
  for (const r of grid) {
    const b = str(r, 1).toLowerCase()
    const amt = num(r[2])
    if (b === 'trade receivables') out.ar = crore(amt)
    else if (b === 'inventories') out.inv = crore(amt)
    else if (b === 'trade payables') out.ap = crore(amt)
    else if (b.includes('provision') && b.includes('bad')) out.provision = crore(amt)
  }
  return out
}

function closeDay(month: string, year: string) {
  const i = MONTHS.indexOf(month as (typeof MONTHS)[number])
  const y = Number(year)
  const last = new Date(Date.UTC(y, i + 1, 0))
  return last
}

function excelToDate(v: unknown): Date | null {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return excelDay(v)
  if (typeof v === 'number' && v > 20000) return new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 86400000)
  return null
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

  const monthlyRows = metrics.map((row) => ({
    m: row.m,
    rev: row.rev,
    gp: row.gp,
    ebitda: row.ebitda,
    ebitdaPct: row.ebitdaPct,
    np: row.np,
    rate: row.rate,
  }))
  const orderRows = Object.values(ordersBy)
  const bs = bsLines(wb)
  const end = closeDay(close.month, close.year)
  const want = monthKey(close.month, close.year)
  const invoiceBy: Record<string, { id: string; cust: string; plant: string; amt: number; date: Date | null }> = {}
  for (const r of dataRows) {
    if (String(pick(r, 'Screen Name') ?? '') !== 'A/R Invoice') continue
    const period = String(pick(r, 'Month / Year') ?? '').trim()
    if (period && period !== want) continue
    const acct = String(pick(r, 'Account') ?? '')
    if (!acct.startsWith('400')) continue
    const id = String(pick(r, 'BaseRef') ?? '').trim()
    if (!id) continue
    const raw = String(pick(r, 'Offset Account Name') ?? '').trim()
    const cur = invoiceBy[id] ?? { id, cust: omcOf(raw), plant: tidyPlant(raw), amt: 0, date: excelToDate(pick(r, 'RefDate')) }
    cur.amt += -num(pick(r, 'Amount'))
    invoiceBy[id] = cur
  }
  const invoices = Object.values(invoiceBy)
    .map((row) => ({
      id: row.id,
      cust: row.cust,
      plant: row.plant,
      amt: crore(row.amt),
      days: row.date ? Math.max(0, Math.round((end.getTime() - row.date.getTime()) / 86400000)) : 0,
      owner: 'Unassigned',
      next: '—',
    }))
    .filter((r) => r.amt)
    .sort((a, b) => Math.abs(b.amt) - Math.abs(a.amt))
    .slice(0, 12)
  if (invoices.length) found.push('Invoices')

  const bpRows = objects(wb, 'BP data')
  const custSum: Record<string, number> = { IOCL: 0, BPCL: 0, HPCL: 0, Other: 0 }
  for (const r of bpRows) {
    const name = String(pick(r, 'Name') ?? '')
    if (!name || /^name$|^customers/i.test(name)) continue
    custSum[omcOf(name)] += num(pick(r, 'Balance')) || num(pick(r, 'OB'))
  }
  const custTotal = Object.values(custSum).reduce((s, v) => s + Math.abs(v), 0) || 1
  const customers = Object.entries(custSum)
    .map(([name, v]) => ({
      name,
      overdue: v > 0 ? crore(v) : 0,
      share: Math.round((100 * Math.abs(v) / custTotal) * 10) / 10,
      dso: 0,
      notDue: 0,
      mid: 0,
      old: 0,
      gross: crore(Math.abs(v)),
    }))
    .filter((c) => c.gross)
    .sort((a, b) => b.gross - a.gross)
  if (customers.length) found.push('Customers')

  const idx = yearMonths.indexOf(close.month)
  const gpAmt = Math.round((last.rev * last.gp / 100) * 10000) / 10000
  if (bs.ar || bs.inv) found.push('Twc', 'Ageing')

  return {
    close,
    found,
    patch: {
      monthly: monthlyRows,
      mix: last.mix,
      costLines: last.costLines,
      orders: orderRows,
      plants,
      contracts,
      bridge: [
        { name: 'Turnover', v: last.rev },
        { name: 'Gross profit', v: gpAmt },
        { name: 'EBITDA', v: last.ebitda },
        { name: 'Net profit', v: last.np },
      ],
      intakeTrend: monthlyRows.map((r) => ({
        m: r.m,
        intake: Math.round(orderRows.reduce((s, o) => s + o.intake, 0) * 10000) / 10000,
        billed: r.rev,
        backlog: Math.round(orderRows.reduce((s, o) => s + o.backlog, 0) * 10000) / 10000,
      })),
      ageing: bs.ar ? [{ name: 'Trade receivables', v: bs.ar }] : [],
      customers,
      invoices,
      cycle: [
        { name: 'DSO', days: last.rev ? Math.round(bs.ar / (last.rev / 30)) : 0, target: 55, note: 'Trade receivables / monthly revenue' },
        { name: 'DIO', days: 0, target: 38, note: 'Stock days — COGS not split on this close' },
        { name: 'DPO', days: 0, target: 40, note: 'Payables days — COGS not split on this close' },
      ],
      twc: [{
        m: close.month,
        ar: bs.ar,
        inv: bs.inv,
        ap: bs.ap,
        twc: Math.round((bs.ar + bs.inv - bs.ap) * 10000) / 10000,
        pct: last.rev ? Math.round((100 * (bs.ar + bs.inv - bs.ap) / last.rev) * 10) / 10 : 0,
      }],
      warehouses: bs.inv ? [{ name: 'Inventories', region: 'All India', origin: 'Domestic', qty: 0, val: bs.inv, turns: null, dio: null, slow: 0, ret: 0, inScope: true }] : [],
      varianceGrid: plants.map((p) => ({
        plant: p.name,
        region: '',
        months: yearMonths.map((_, i) => (i === idx ? p.v : 0)),
      })),
    },
  }
}
