import { useStore } from '@/lib/store';
import { fmtEur2, OPERATING_WEEKS_PER_YEAR, SHIFTS } from '@/lib/financial';
import { rentUtilitiesForShift, shiftEconomics } from '@/lib/shift-economics';
import { Input } from '@/components/ui/input';

export function ShiftAssumptions() {
  const { state, patch } = useStore();
  const f = state.fin;
  return (
    <section className="rounded-xl border bg-card p-4" aria-label="Slide 5 spending and break-even assumptions">
      <h3 className="font-display text-lg">Slide 5 · Spending &amp; break-even assumptions</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Approved planning scenario: 50 guests per shift, with estimated food/drink spending and staffing. Drinks are the remainder of the average check. Staffing estimates use €24/hour: six staff-hours in the morning, ten at lunch and ten at dinner.
      </p>
      <label className="mt-3 flex flex-wrap items-center gap-3 text-xs">
        Rent + utilities per month (€)
        <Input className="h-8 w-32" type="number" min={0} max={100000} step="0.01"
          data-testid="input-rent-utilities-monthly" value={f.rentUtilitiesMonthly ?? ''}
          onChange={event => {
            const value = event.target.value === '' ? null : Number(event.target.value);
            if (value === null || Number.isFinite(value)) patch('fin', { rentUtilitiesMonthly: value === null ? null : Math.max(0, Math.min(100000, value)) });
          }} />
        <span className="text-muted-foreground">Allocated over {f.days * OPERATING_WEEKS_PER_YEAR} operating days/year and by shift length (4h / 5h / 5h).</span>
      </label>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {SHIFTS.map(({ key, label }) => {
          const s = f[key];
          const allocatedRent = rentUtilitiesForShift(f, key);
          const e = shiftEconomics(s, f.marginFood, f.marginCoffee, allocatedRent);
          const set = (field: 'foodCheck' | 'staffingPerDay', value: string) => {
            const number = value === '' ? null : Number(value);
            if (number !== null && !Number.isFinite(number)) return;
            const amount = number === null ? null : Math.max(0, Math.min(field === 'foodCheck' ? s.check : 100000, number));
            patch('fin', { [key]: { ...s, [field]: amount } });
          };
          return (
            <div key={key} className="rounded-lg border p-3">
              <h4 className="mb-3 text-sm font-semibold">{label}</h4>
              <label className="block text-xs">
                Food per guest (€)
                <Input type="number" min={0} max={s.check} step="0.01" value={s.foodCheck == null ? '' : Math.min(s.check, s.foodCheck)}
                  placeholder="Enter food amount" data-testid={`input-${key}-food-check`}
                  onChange={(event) => set('foodCheck', event.target.value)} className="mt-1 h-8" />
              </label>
              <p className="mt-2 text-xs text-muted-foreground">Coffee &amp; drinks: {e.drinks == null ? 'not set' : fmtEur2(e.drinks)} · Total: {fmtEur2(s.check)}</p>
              <label className="mt-3 block text-xs">
                Estimated staffing per shift (€)
                <Input type="number" min={0} max={100000} step="0.01" value={s.staffingPerDay ?? ''}
                  placeholder="Enter shift costs" data-testid={`input-${key}-shift-costs`}
                  onChange={(event) => set('staffingPerDay', event.target.value)} className="mt-1 h-8" />
              </label>
              <p className="mt-2 text-xs text-muted-foreground">Allocated rent + utilities: {allocatedRent == null ? 'not set' : fmtEur2(allocatedRent)}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Break-even: {e.breakEven == null ? (e.ready ? 'not achievable at zero margin' : 'enter assumptions') : `${e.breakEven} guests`}
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Uses the Financial model’s food ({f.marginFood}%) and coffee/drinks ({f.marginCoffee}%) gross margins, after ingredients and before staffing/rent. Break-even excludes insurance, administration, maintenance, financing and tax; VAT-exclusive. Rent and staffing inputs only affect slide 5’s break-even estimates. Guest counts and average checks are shared with the deck’s revenue forecasts.
      </p>
    </section>
  );
}
