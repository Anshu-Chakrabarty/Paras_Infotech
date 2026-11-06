import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useFilters } from '../filters'
import { useLive } from '../live'
import { Banner, Card, H, Kpi, PageHead, ScopeLine, Table, axis, chart, hPad, nW, shortTick, useNarrow, vPad, vW } from '../ui'

const shortStep: Record<string, string> = {
  Turnover: 'Rev',
  'Gross profit': 'GP',
  EBITDA: 'EBITDA',
  'Net profit': 'NP',
}

export function Budget() {
  const narrow = useNarrow()
  const nav = useNavigate()
  const { bridge, costLines, monthly } = useLive().data
  const { filters, money, moneyLakh, monthSlice, registerExport, exportCsv } = useFilters()
  const last = monthSlice.at(-1) ?? monthly.at(-1)
  const staff = costLines.find((c) => c.name === 'Staff costs')
  const oh = costLines.find((c) => c.name === 'Overheads')
  const bars = bridge.map((b, i) => ({
    ...b,
    fill: i === 0 || i === bridge.length - 1 ? '#334155' : b.v < 0 ? chart.rose : chart.green,
  }))
  const vs = costLines.map((c) => ({ name: c.name, gap: c.plan ? ((c.actual - c.plan) / c.plan) * 100 : 0 }))

  useEffect(() => {
    registerExport(() =>
      exportCsv(
        'actual-vs-budget',
        ['Step', 'Lakh', '% of budget EBITDA', 'Driver', 'Owner'],
        bridge.map((s) => [s.name, s.v, '', 'From MIS P&L', '']),
      ),
    )
  }, [bridge, registerExport, exportCsv])

  return (
    <div>
      <PageHead
        kicker="Performance"
        title="Actual vs Budget"
        note="Why the result moved, not only that it moved. Currency and region follow the header slice."
      />
      <Banner
        title="Monthly Jan–Dec budget sheet not in the current extract."
        body="Plan figures are spread evenly from the annual budget. Open the plant-month grid for the same plan."
        action="Open plant variance"
        onAction={() => nav('/variance')}
      />
      <ScopeLine text={`${filters.region === 'All' ? 'All India' : filters.region}. ${filters.year}. ${filters.segment === 'All' ? 'All lines' : filters.segment}. ${filters.currency}.`} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="EBITDA" value={last ? money(last.ebitda, last.m) : money(0)} note={last ? `${last.m} close · ${last.ebitdaPct.toFixed(1)}% of turnover` : 'No close loaded'} />
        <Kpi label="Revenue" value={last ? money(last.rev, last.m) : money(0)} note={last ? `GP ${last.gp.toFixed(1)}%` : ''} />
        <Kpi label="Salaries" value={staff ? moneyLakh(staff.actual) : money(0)} note="From P&L overheads" />
        <Kpi label="Overheads" value={oh ? moneyLakh(oh.actual) : money(0)} note="From P&L overheads" />
      </div>

      <Card className="mt-4">
        <H title="Budget EBITDA to actual" hint="Waterfall in ₹ Lakh. Click a step to open the plant grid." />
        <div className="h-56 w-full min-w-0 overflow-hidden sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={bars}
              margin={hPad(narrow)}
              onClick={() => nav('/variance')}
            >
              <CartesianGrid stroke={chart.grid} vertical={false} />
              <XAxis
                dataKey="name"
                interval={0}
                angle={narrow ? -40 : -18}
                height={narrow ? 76 : 70}
                tick={axis(narrow)}
                tickFormatter={narrow ? (v) => shortStep[String(v)] ?? String(v) : undefined}
              />
              <YAxis width={nW(narrow)} tick={axis(narrow)} />
              <Tooltip />
              <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                {bars.map((b) => (
                  <Cell key={b.name} fill={b.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <Card>
          <H title="Cost lines" hint="Sorted by absolute variance." />
          <div className="h-48 w-full min-w-0 overflow-hidden sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costLines} layout="vertical" margin={vPad(narrow, 110)}>
                <CartesianGrid stroke={chart.grid} horizontal={false} />
                <XAxis type="number" tick={axis(narrow)} />
                <YAxis type="category" dataKey="name" width={vW(narrow, 110)} tick={axis(narrow)} tickFormatter={narrow ? shortTick(12) : undefined} />
                <Tooltip />
                <Bar dataKey="actual" fill={chart.teal} barSize={10} name="Actual" />
                <Bar dataKey="plan" fill={chart.green} barSize={10} name="Plan" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <H title="Against plan" />
          <div className="space-y-3">
            {vs.map((c) => (
              <div key={c.name}>
                <div className="mb-1 flex justify-between text-[12px]">
                  <span>{c.name}</span>
                  <span className={`num ${c.gap > 0 ? 'text-rose' : 'text-green'}`}>
                    {c.gap > 0 ? '+' : ''}
                    {c.gap.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-black/5 dark:bg-white/10">
                  <div
                    className={`h-1.5 rounded-full ${c.gap > 0 ? 'bg-rose' : 'bg-green'}`}
                    style={{ width: `${Math.min(100, Math.abs(c.gap) * 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <H title="Bridge steps" hint="Driver and owner turn a step into assignable work." />
        <Table
          cols={['Step', 'Amount', '% of budget EBITDA', 'Driver', 'Owner']}
          rows={bridge.map((s) => [
            s.name,
            <span className={s.v < 0 ? 'text-rose num' : 'num'}>{money(s.v)}</span>,
            '—',
            'From MIS P&L',
            '—',
          ])}
        />
      </Card>
    </div>
  )
}
