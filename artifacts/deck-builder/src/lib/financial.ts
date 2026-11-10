import type { Financials } from './types';

export const SHIFTS = [
  { key: 'morning', label: 'Morning', sub: 'Breakfast & Coffee', hours: '07:30 – 11:30' },
  { key: 'lunch', label: 'Lunch', sub: 'Midday Bistro & Bites', hours: '11:30 – 16:30' },
  { key: 'dinner', label: 'Dinner', sub: 'Indonesian Bistro Evening', hours: '17:00 – 22:00' },
] as const;
export type ShiftKey = (typeof SHIFTS)[number]['key'];

export const PROJECTION_YEAR = new Date().getFullYear() + 1;
export const OPERATING_WEEKS_PER_YEAR = 48;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function compute(f: Financials) {
  const shifts = SHIFTS.map((s) => {
    const v = f[s.key];
    const daily = v.guests * v.check;
    return { ...s, guests: v.guests, check: v.check, daily };
  });
  const guestsDay = shifts.reduce((a, s) => a + s.guests, 0);
  const dineInRevDay = shifts.reduce((a, s) => a + s.daily, 0);
  const ordersDay = f.takeaway?.orders ?? 0;
  const takeawayCheck = f.takeaway?.check ?? 0;
  const takeawayMargin = f.takeaway?.margin ?? 55;
  const takeawayDaily = ordersDay * takeawayCheck;
  const takeawayProfit = takeawayDaily * takeawayMargin / 100;
  const revDay = dineInRevDay + takeawayDaily;
  const annualDays = f.days * OPERATING_WEEKS_PER_YEAR;
  const revYear = revDay * annualDays;
  const low = f.marginFood / 100;
  const high = f.marginCoffee / 100;
  const transactionsDay = guestsDay + ordersDay;
  const avgCheck = transactionsDay ? revDay / transactionsDay : 0;
  const guestsYear = Math.round(guestsDay * annualDays);
  const ordersYear = Math.round(ordersDay * annualDays);
  const profitDayLow = dineInRevDay * low + takeawayProfit;
  const profitDayHigh = dineInRevDay * high + takeawayProfit;

  // Use calendar weekday availability to distribute the annual trading budget.
  // Closure dates are unknown; cumulative rounding preserves whole days and totals.
  const calendarMonths = MONTHS.map((name, m) => {
    const dim = new Date(PROJECTION_YEAR, m + 1, 0).getDate();
    let op = 0;
    for (let d = 1; d <= dim; d++) {
      const wd = (new Date(PROJECTION_YEAR, m, d).getDay() + 6) % 7; // Mon=0
      if (wd < f.days) op++;
    }
    return { name, short: name.slice(0, 3), calDays: dim, available: op };
  });
  const availableDays = calendarMonths.reduce((total, month) => total + month.available, 0);
  let cumulativeDays = 0;
  let allocatedDays = 0;
  const months = calendarMonths.map(({ available, ...month }) => {
    cumulativeDays += available;
    const nextAllocated = availableDays ? Math.round(cumulativeDays * annualDays / availableDays) : 0;
    const op = nextAllocated - allocatedDays;
    allocatedDays = nextAllocated;
    const revenue = revDay * op;
    return { ...month, op, guests: Math.round(guestsDay * op), orders: Math.round(ordersDay * op), revenue, low: profitDayLow * op, high: profitDayHigh * op };
  });
  const monthTotal = months.reduce(
    (a, m) => ({ op: a.op + m.op, guests: a.guests + m.guests, revenue: a.revenue + m.revenue, low: a.low + m.low, high: a.high + m.high }),
    { op: 0, guests: 0, revenue: 0, low: 0, high: 0 },
  );

  const g = f.growth / 100;
  const quarters: { year: number; q: number; revenue: number; low: number; high: number }[] = [];
  for (let y = 0; y < 3; y++) {
    for (let q = 0; q < 4; q++) {
      const period = months.slice(q * 3, q * 3 + 3);
      const factor = Math.pow(1 + g, y);
      const revenue = period.reduce((a, m) => a + m.revenue, 0) * factor;
      quarters.push({ year: y + 1, q: q + 1, revenue, low: period.reduce((a, m) => a + m.low, 0) * factor, high: period.reduce((a, m) => a + m.high, 0) * factor });
    }
  }
  const years = [0, 1, 2].map((y) => {
    const revenue = revYear * Math.pow(1 + g, y);
    return { year: y + 1, revenue, low: profitDayLow * annualDays * Math.pow(1 + g, y), high: profitDayHigh * annualDays * Math.pow(1 + g, y), guests: Math.round(guestsYear * Math.pow(1 + g, y)) };
  });

  const shiftRows = shifts.map((s) => ({ ...s, share: revDay ? s.daily / revDay : 0, annual: s.daily * annualDays, low: s.daily * low, high: s.daily * high }));
  const takeaway = {
    key: 'takeaway' as const, label: 'Takeaway', sub: `Food & Coffee · ${takeawayMargin}% margin`, hours: 'All day',
    guests: ordersDay, check: takeawayCheck, daily: takeawayDaily,
    share: revDay ? takeawayDaily / revDay : 0, annual: takeawayDaily * annualDays,
    low: takeawayProfit, high: takeawayProfit, margin: takeawayMargin,
  };
  return {
    shifts: shiftRows, takeaway, dailyRows: [...shiftRows, takeaway],
    guestsDay, ordersDay, transactionsDay, ordersYear, revDay, annualDays, revYear, avgCheck, guestsYear,
    profitDayLow, profitDayHigh,
    profitYearLow: profitDayLow * annualDays, profitYearHigh: profitDayHigh * annualDays,
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
export const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;
