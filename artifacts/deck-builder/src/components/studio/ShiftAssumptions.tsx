import { useStore } from '@/lib/store';
import { fmtEur2, SHIFTS } from '@/lib/financial';
import { shiftEconomics } from '@/lib/shift-economics';
import { Input } from '@/components/ui/input';

export function ShiftAssumptions() {
  const { state, patch } = useStore();
  const f = state.fin;
  return (
    <section className="rounded-xl border bg-card p-4" aria-label="Slide 5 spending and break-even assumptions">
      <h3 className="font-display text-lg">Slide 5 · Spending &amp; break-even assumptions</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Enter your own figures. Drinks are the remainder of the average check. Shift costs include staffing and allocated rent, utilities and other overhead—not ingredients, which are already covered by the food/drink margins.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {SHIFTS.map(({ key, label }) => {
          const s = f[key];
          const e = shiftEconomics(s, f.marginFood, f.marginCoffee);
          const set = (field: 'foodCheck' | 'costsPerDay', value: string) => {
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
                Staffing + overhead per shift (€)
                <Input type="number" min={0} max={100000} step="0.01" value={s.costsPerDay ?? ''}
                  placeholder="Enter shift costs" data-testid={`input-${key}-shift-costs`}
                  onChange={(event) => set('costsPerDay', event.target.value)} className="mt-1 h-8" />
              </label>
              <p className="mt-2 text-xs text-muted-foreground">
                Break-even: {e.breakEven == null ? (e.ready ? 'not achievable at zero margin' : 'enter assumptions') : `${e.breakEven} guests`}
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Uses the Financial model’s food ({f.marginFood}%) and coffee/drinks ({f.marginCoffee}%) gross margins. These assumptions only add detail to slide 5; they do not change the existing revenue forecasts or slide 6.
      </p>
    </section>
  );
}
