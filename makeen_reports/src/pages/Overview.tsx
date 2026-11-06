import { useEffect } from 'react'
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { matchRegion, useFilters } from '../filters'
import { useLive } from '../live'
import { Alert, Card, H, Kpi, PageHead, ScopeLine, Table, axis, chart, hPad, nW, useNarrow, vPad, vW } from '../ui'

export function Overview() {
  const narrow = useNarrow()
  const { mix, plants } = useLive().data
  const { filters, money, moneyYtd, monthSlice, registerExport, exportCsv, rates } = useFilters()
  const shownMix = filters.segment === 'All' ? mix : mix.filter((s) => s.name === filters.segment)
  const shownPlants = plants.filter((p) => matchRegion(p.name, filters.region) && (filters.plant === 'All' || p.name === filters.plant))
  const rev = monthSlice.reduce((s, r) => s + r.rev, 0)
  const ebitda = monthSlice.reduce((s, r) => s + r.ebitda, 0)
  const np = monthSlice.reduce((s, r) => s + r.np, 0)
  const gpAmt = monthSlice.reduce((s, r) => s + (r.rev * r.gp) / 100, 0)
  const gpPct = rev ? (gpAmt / rev) * 100 : 0
  const wavg = monthSlice.reduce((s, r) => s + r.rate * r.rev, 0) / (rev || 1)

  useEffect(() => {
    registerExport(() =>
      exportCsv(
        'overview',
        ['Month', 'Revenue Cr', 'GP %', 'EBITDA Cr', 'Net profit Cr', 'INR per EUR'],
        monthSlice.map((r) => [r.m, r.rev, r.gp, r.ebitda, r.np, rates[r.m]]),
      ),
    )
  }, [monthSlice, rates, registerExport, exportCsv])

  return (
    <div>
      <PageHead
        kicker="Performance"
        title="Overview"
        note="Exceptions first, then the result. Currency converts each month at that month’s INR/EUR rate, then adds for YTD."
      />
      <ScopeLine
        text={`Showing ${filters.region === 'All' ? 'all India' : filters.region}, ${filters.year}. ${filters.segment === 'All' ? 'All lines' : filters.segment}. ${filters.currency}.`}
      />

      <div className="grid gap-3 md:grid-cols-3">
        {(() => {
          const last = monthSlice.at(-1)
          const loss = plants.filter((p) => p.v < 0)
          const top = [...plants].sort((a, b) => b.v - a.v)[0]
          const old = monthSlice.filter((r) => r.np < 0)
          return (
            <>
              <Alert
                tone={last && last.np < 0 ? 'rose' : 'ink'}
                to="/budget"
                title={last ? `${last.m} net profit ${last.np < 0 ? 'loss' : 'close'}` : 'No month loaded'}
                body={last ? `${money(last.np, last.m)} · EBITDA ${money(last.ebitda, last.m)} (${last.ebitdaPct.toFixed(1)}%).` : 'Upload a close.'}
              />
              <Alert
                tone="amber"
                to="/receivables"
                title="Trade receivables"
                body={plants.length ? `Open receivables for this close. Largest billed plant ${top?.name ?? '—'} ${top ? money(top.v) : ''}.` : 'No plant billed figures in this pack.'}
              />
              <Alert
                tone={loss.length ? 'rose' : 'ink'}
                to="/variance"
                title={loss.length ? `${loss.length} plant${loss.length === 1 ? '' : 's'} negative` : `${plants.length} plants billed`}
                body={loss.length ? `${loss.slice(0, 3).map((p) => p.name).join(', ')}. Open plant variance.` : old.length ? `${old.map((r) => r.m).join(', ')} closed at a loss. Open monthly detail.` : 'All listed plants billed positive this close.'}
              />
            </>
          )
        })()}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Revenue" value={moneyYtd(monthSlice.map((r) => ({ v: r.rev, m: r.m })))} note="Each month converted, then added when EUR is on." />
        <Kpi label="Gross profit" value={`${gpPct.toFixed(1)}%`} note={moneyYtd(monthSlice.map((r) => ({ v: (r.rev * r.gp) / 100, m: r.m })))} />
        <Kpi label="EBITDA" value={moneyYtd(monthSlice.map((r) => ({ v: r.ebitda, m: r.m })))} note={`${((ebitda / (rev || 1)) * 100).toFixed(1)}% of turnover`} />
        <Kpi label="Net profit" value={moneyYtd(monthSlice.map((r) => ({ v: r.np, m: r.m })))} />
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <H title="Revenue and EBITDA margin" hint="Bars follow the period slice. Line is EBITDA %." />
          <div className="h-48 w-full min-w-0 overflow-hidden sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthSlice} margin={hPad(narrow)}>
                <CartesianGrid stroke={chart.grid} vertical={false} />
                <XAxis dataKey="m" tick={axis(narrow)} />
                <YAxis yAxisId="r" width={nW(narrow)} tick={axis(narrow)} />
                <YAxis yAxisId="p" orientation="right" width={nW(narrow)} tick={axis(narrow)} unit="%" />
                <Tooltip />
                <Bar yAxisId="r" dataKey="rev" fill={chart.green} barSize={28} name="Revenue" radius={[4, 4, 0, 0]} />
                <Line yAxisId="p" dataKey="ebitdaPct" stroke="#eab308" strokeWidth={2} name="EBITDA %" dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <H title="Revenue mix" hint="Billed by line of business." />
          <div className="h-40 w-full min-w-0 overflow-hidden sm:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={shownMix} dataKey="value" innerRadius={48} outerRadius={72} paddingAngle={2}>
                  {shownMix.map((s) => (
                    <Cell key={s.name} fill={s.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="num text-center text-lg font-semibold">{money(shownMix.reduce((s, r) => s + r.value, 0))}</div>
          <div className="mt-3 space-y-1 text-[12px] text-mute">
            {shownMix.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <i className="h-2 w-2 rounded-full" style={{ background: s.fill }} />
                  {s.name}
                </span>
                <span className="num">{money(s.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <H title="Plant contribution" hint="Filtered by region / plant." />
        <div className="h-52 w-full min-w-0 overflow-hidden sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={shownPlants} layout="vertical" margin={vPad(narrow, 90)}>
              <CartesianGrid stroke={chart.grid} horizontal={false} />
              <XAxis type="number" tick={axis(narrow)} />
              <YAxis type="category" dataKey="name" width={vW(narrow, 90)} tick={axis(narrow)} />
              <Tooltip />
              <Bar dataKey="v" barSize={12} radius={[0, 4, 4, 0]}>
                {shownPlants.map((p) => (
                  <Cell key={p.name} fill={p.v >= 0 ? chart.green : chart.rose} />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="mt-4">
        <H title="Monthly detail" hint="₹ / € is the sample monthly rate. Click the Vena pill in the header to edit it." />
        <Table
          cols={['Month', 'Revenue', 'GP %', 'EBITDA', 'Net profit', '₹ / €']}
          rows={monthSlice.map((r) => [
            r.m,
            money(r.rev / (filters.period === 'ytd' ? 1 : 1), r.m),
            `${r.gp.toFixed(1)}%`,
            <span className={r.ebitda < 0 ? 'text-rose' : ''}>{money(r.ebitda, r.m)}</span>,
            <span className={r.np < 0 ? 'text-rose' : ''}>{money(r.np, r.m)}</span>,
            rates[r.m].toFixed(1),
          ])}
          foot={[
            'YTD / period',
            moneyYtd(monthSlice.map((r) => ({ v: r.rev, m: r.m }))),
            `${gpPct.toFixed(1)}%`,
            moneyYtd(monthSlice.map((r) => ({ v: r.ebitda, m: r.m }))),
            moneyYtd(monthSlice.map((r) => ({ v: r.np, m: r.m }))),
            wavg.toFixed(1),
          ]}
        />
        <p className="mt-3 text-[12px] text-mute">Europe pack: convert each month, then add. Official monthly rate is still with the client — sample rates sit in the Vena pill.</p>
      </Card>
    </div>
  )
}
