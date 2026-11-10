import type { Financials, Shift } from '@/lib/types';
import type { Theme } from '@/lib/themes';
import { fmtEur2, fmtNum } from '@/lib/financial';
import { shiftEconomics } from '@/lib/shift-economics';

const MONO = "'JetBrains Mono', SFMono-Regular, monospace";

export function ShiftInsights({ shift, financials, theme: t }: {
  shift: Shift; financials: Financials; theme: Theme;
}) {
  const e = shiftEconomics(shift, financials.marginFood, financials.marginCoffee);
  const label = { fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: t.muted };
  return (
    <div style={{ marginTop: 18, marginBottom: 16 }}>
      <div style={{ borderTop: `1px solid ${t.line}`, paddingTop: 12 }}>
        <div style={label}>Food + Coffee &amp; Drinks</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 5 }}>
          <span style={{ fontSize: 19, fontWeight: 700, color: t.ink }}>{e.food == null ? '—' : fmtEur2(e.food)}</span>
          <span style={{ color: t.muted }}>+</span>
          <span style={{ fontSize: 19, fontWeight: 700, color: t.ink }}>{e.drinks == null ? '—' : fmtEur2(e.drinks)}</span>
          <span style={{ fontSize: 11, color: t.muted }}>= {fmtEur2(shift.check)}</span>
        </div>
        <div style={{ fontSize: 10.5, color: t.muted, marginTop: 4 }}>
          {e.food == null ? 'Spending split not yet set' : 'Per guest · adds up to the average spend'}
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${t.line}`, marginTop: 13, paddingTop: 12 }}>
        <div style={label}>Break-even / shift</div>
        <div style={{ fontSize: 19, fontWeight: 700, color: t.ink, marginTop: 5 }}>
          {e.breakEven == null ? '—' : `${fmtNum(e.breakEven)} guests`}
          <span style={{ fontSize: 11, fontWeight: 400, color: t.muted }}> vs {fmtNum(shift.guests)} expected</span>
        </div>
        <div style={{ fontSize: 10.5, lineHeight: 1.45, color: t.muted, marginTop: 4 }}>
          {!e.ready ? 'Awaiting spending split and shift costs'
            : e.breakEven == null ? 'No break-even with zero gross contribution'
            : e.guestBuffer! >= 0 ? `${fmtNum(e.guestBuffer!)} guests above break-even`
            : `${fmtNum(-e.guestBuffer!)} more guests needed to break even`}
        </div>
        {e.ready && <div style={{ fontSize: 9.5, color: t.muted, marginTop: 4 }}>
          Based on food/drink margins and staffing + allocated overhead.
        </div>}
      </div>
    </div>
  );
}
