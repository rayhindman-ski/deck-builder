import { useStore } from '@/lib/store';
import { fmtEur, fmtEur2, fmtNum, OPERATING_WEEKS_PER_YEAR, SHIFTS } from '@/lib/financial';
import { NumberSlider, Panel } from './parts';

export function ModelTab() {
  const { state, model, patch } = useStore();
  const f = state.fin;
  const kpis = [
    ['Daily guests', fmtNum(model.guestsDay), `${fmtNum(model.guestsYear)} / year`],
    ['Daily revenue', fmtEur(model.revDay), `avg check ${fmtEur2(model.avgCheck)}`],
    ['Year 1 revenue', fmtEur(model.revYear), `${model.annualDays} operating days`],
    ['Daily profit estimate', fmtEur(model.profitDayLow), 'Gross, before operating costs'],
    ['Year 1 profit estimate', fmtEur(model.profitYearLow), 'Gross, before operating costs'],
    ['Year 3 revenue', fmtEur(model.years[2].revenue), `at ${f.growth}% compounding`],
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map(([k, v, n], i) => (
          <div key={k} data-testid={`kpi-${i}`} className={`rounded-xl border p-4 ${i === 1 ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
            <div className={`font-mono text-[10px] uppercase tracking-[0.14em] ${i === 1 ? 'opacity-80' : 'text-[hsl(var(--chart-2))]'}`}>{k}</div>
            <div key={v} className="tnum mt-1 font-display text-xl font-semibold leading-tight rise">{v}</div>
            <div className={`mt-1 text-[11px] ${i === 1 ? 'opacity-75' : 'text-muted-foreground'}`}>{n}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {SHIFTS.map((s, idx) => {
          const m = model.shifts[idx];
          return (
            <Panel key={s.key} kicker={s.hours} title={`${s.label} · ${s.sub}`}>
              <div className="space-y-5">
                <NumberSlider testId={`${s.key}-guests`} label="Guests per day" value={f[s.key].guests} min={0} max={200} onChange={(v) => patch('fin', { [s.key]: { ...f[s.key], guests: v } })} />
                <NumberSlider testId={`${s.key}-check`} label="Average check" prefix="€" value={f[s.key].check} min={0} max={80} step={0.5} onChange={(v) => patch('fin', { [s.key]: { ...f[s.key], check: v } })} />
              </div>
              <div className="mt-5 flex items-end justify-between border-t pt-3">
                <div>
                  <div className="font-mono text-[10px] uppercase text-muted-foreground">Daily turnover</div>
                  <div className="tnum font-display text-2xl font-semibold text-primary">{fmtEur(m.daily)}</div>
                </div>
                <div className="text-right font-mono text-[11px] text-muted-foreground">{(m.share * 100).toFixed(1)}% of day<br />{fmtEur(m.annual)} / yr</div>
              </div>
            </Panel>
          );
        })}
      </div>
      <Panel kicker="Additional sales · Separate from dine-in guests" title="Takeaway · Food & Coffee">
        <div className="grid gap-6 md:grid-cols-3">
          <NumberSlider testId="takeaway-orders" label="Orders per day" value={f.takeaway?.orders ?? 0} min={0} max={200} onChange={v => patch('fin', { takeaway: { orders: v, check: f.takeaway?.check ?? 18, margin: f.takeaway?.margin ?? 55 } })} />
          <NumberSlider testId="takeaway-check" label="Average ticket" prefix="€" value={f.takeaway?.check ?? 0} min={0} max={80} step={0.5} onChange={v => patch('fin', { takeaway: { orders: f.takeaway?.orders ?? 0, check: v, margin: f.takeaway?.margin ?? 55 } })} />
          <NumberSlider testId="takeaway-margin" label="Food & coffee gross margin" suffix="%" value={f.takeaway?.margin ?? 55} min={0} max={100} onChange={v => patch('fin', { takeaway: { orders: f.takeaway?.orders ?? 0, check: f.takeaway?.check ?? 18, margin: v } })} />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{fmtEur(model.takeaway.daily)} daily revenue · {fmtEur(model.takeaway.low)} estimated gross profit, before staffing, rent and other operating costs.</p>
      </Panel>
      <Panel kicker="Shared assumptions" title="Calendar, margins and growth">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <NumberSlider testId="days" label="Operating days per week" value={f.days} min={1} max={7} onChange={(v) => patch('fin', { days: v })} />
          <NumberSlider testId="margin-coffee" label="Coffee / Retail margin" suffix="%" value={f.marginCoffee} min={0} max={100} onChange={(v) => patch('fin', { marginCoffee: v })} />
          <NumberSlider testId="margin-food" label="Food / Kitchen margin" suffix="%" value={f.marginFood} min={0} max={100} onChange={(v) => patch('fin', { marginFood: v })} />
          <NumberSlider testId="growth" label="Annual growth rate" suffix="%" value={f.growth} min={0} max={50} onChange={(v) => patch('fin', { growth: v })} />
        </div>
        <div className="mt-5 rounded-lg bg-muted/60 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
          R_day = dine-in sales + takeaway orders × ticket = {fmtEur2(model.revDay)} · R_year = R_day × ({f.days} × {OPERATING_WEEKS_PER_YEAR}) = {fmtEur2(model.revYear)} · Gross profit estimate = dine-in sales × {f.marginFood}% + takeaway sales × {model.takeaway.margin}% = {fmtEur2(model.profitDayLow)}/day · Years 2–3 = R_year × (1 + {f.growth}%)^n
        </div>
      </Panel>
    </div>
  );
}
