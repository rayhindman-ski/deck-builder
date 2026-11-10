import type { Financials } from './types';

export const SHIFTS = [
  { key: 'morning', label: 'Morning', sub: 'Breakfast & Coffee', hours: '07:30 – 11:30' },
  { key: 'lunch', label: 'Lunch', sub: 'Midday Bistro & Bites', hours: '11:30 – 16:30' },
  { key: 'dinner', label: 'Dinner', sub: 'Indonesian Bistro Evening', hours: '17:00 – 22:00' },
] as const;
export type ShiftKey = (typeof SHIFTS)[number]['key'];

export const PROJECTION_YEAR = new Date().getFullYear() + 1;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function compute(f: Financials) {
  const shifts = SHIFTS.map((s) => {
    const v = f[s.key];
    const daily = v.guests * v.check;
    return { ...s, guests: v.guests, check: v.check, daily };
  });
  const guestsDay = shifts.reduce((a, s) => a + s.guests, 0);
  const revDay = shifts.reduce((a, s) => a + s.daily, 0);
  const annualDays = f.days * 52;
  const revYear = revDay * annualDays;
  const low = f.marginFood / 100;
  const high = f.marginCoffee / 100;
  const avgCheck = guestsDay ? revDay / guestsDay : 0;
  const guestsYear = Math.round(guestsDay * annualDays);

  // Calendar months: operating days are the first `days` weekdays Mon..Sun.
  const months = MONTHS.map((name, m) => {
    const dim = new Date(PROJECTION_YEAR, m + 1, 0).getDate();
    let op = 0;
    for (let d = 1; d <= dim; d++) {
      const wd = (new Date(PROJECTION_YEAR, m, d).getDay() + 6) % 7; // Mon=0
      if (wd < f.days) op++;
    }
    const revenue = revDay * op;
    return { name, short: name.slice(0, 3), calDays: dim, op, guests: Math.round(guestsDay * op), revenue, low: revenue * low, high: revenue * high };
  });
  const monthTotal = months.reduce(
    (a, m) => ({ op: a.op + m.op, guests: a.guests + m.guests, revenue: a.revenue + m.revenue, low: a.low + m.low, high: a.high + m.high }),
    { op: 0, guests: 0, revenue: 0, low: 0, high: 0 },
  );

  const g = f.growth / 100;
  const quarters: { year: number; q: number; revenue: number; low: number; high: number }[] = [];
  for (let y = 0; y < 3; y++) {
    for (let q = 0; q < 4; q++) {
      const base = months.slice(q * 3, q * 3 + 3).reduce((a, m) => a + m.revenue, 0);
      const revenue = base * Math.pow(1 + g, y);
      quarters.push({ year: y + 1, q: q + 1, revenue, low: revenue * low, high: revenue * high });
    }
  }
  const years = [0, 1, 2].map((y) => {
    const revenue = revYear * Math.pow(1 + g, y);
    return { year: y + 1, revenue, low: revenue * low, high: revenue * high, guests: Math.round(guestsYear * Math.pow(1 + g, y)) };
  });

  return {
    shifts: shifts.map((s) => ({ ...s, share: revDay ? s.daily / revDay : 0, annual: s.daily * annualDays, low: s.daily * low, high: s.daily * high })),
    guestsDay, revDay, annualDays, revYear, avgCheck, guestsYear,
    profitDayLow: revDay * low, profitDayHigh: revDay * high,
    profitYearLow: revYear * low, profitYearHigh: revYear * high,
    months, monthTotal, quarters, years,
  };
}
export type Model = ReturnType<typeof compute>;

const eur0 = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const eur2 = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = new Intl.NumberFormat('en-IE');
export const fmtEur = (n: number) => eur0.format(Math.round(n));
export const fmtEur2 = (n: number) => eur2.format(n);
export const fmtNum = (n: number) => num.format(Math.round(n));
export const fmtK = (n: number) => (Math.abs(n) >= 1e6 ? `€${(n / 1e6).toFixed(2)}M` : `€${(n / 1000).toFixed(1)}k`);
export const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;
