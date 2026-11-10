import type { Financials, Shift } from './types';
import { OPERATING_WEEKS_PER_YEAR } from './financial';

const SHIFT_HOURS = { morning: 4, lunch: 5, dinner: 5 } as const;

export function rentUtilitiesForShift(f: Financials, key: keyof typeof SHIFT_HOURS) {
  const monthly = f.rentUtilitiesMonthly;
  if (monthly == null || !Number.isFinite(monthly) || f.days <= 0) return null;
  return Math.max(0, monthly) * 12 / (f.days * OPERATING_WEEKS_PER_YEAR) * SHIFT_HOURS[key] / 14;
}

/** Break-even is a planning estimate, not the deck's gross-profit range. */
export function shiftEconomics(shift: Shift, foodMargin: number, drinksMargin: number, rentUtilities: number | null = null) {
  const hasSplit = shift.foodCheck != null && Number.isFinite(shift.foodCheck);
  const food = hasSplit ? Math.max(0, Math.min(shift.check, shift.foodCheck!)) : null;
  const drinks = food == null ? null : Math.max(0, shift.check - food);
  const contribution = food == null || drinks == null ? null
    : food * Math.max(0, Math.min(100, foodMargin)) / 100
      + drinks * Math.max(0, Math.min(100, drinksMargin)) / 100;
  const staffing = shift.staffingPerDay != null && Number.isFinite(shift.staffingPerDay)
    ? Math.max(0, shift.staffingPerDay) : null;
  const costs = staffing != null && rentUtilities != null
    ? staffing + Math.max(0, rentUtilities)
    : shift.costsPerDay != null && Number.isFinite(shift.costsPerDay) ? Math.max(0, shift.costsPerDay) : null;
  const ready = contribution != null && costs != null;
  const breakEven = !ready ? null : costs === 0 ? 0 : contribution > 0
    ? Math.ceil(Number((costs / contribution).toPrecision(12))) : null;
  const guestBuffer = breakEven == null ? null : shift.guests - breakEven;
  return { food, drinks, contribution, costs, ready, breakEven, guestBuffer };
}
