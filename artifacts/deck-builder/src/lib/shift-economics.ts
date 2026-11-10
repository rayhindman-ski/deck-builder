import type { Shift } from './types';

/** Slide-five planning assumptions only; existing revenue forecasts are unchanged. */
export function shiftEconomics(shift: Shift, foodMargin: number, drinksMargin: number) {
  const hasSplit = shift.foodCheck != null && Number.isFinite(shift.foodCheck);
  const food = hasSplit ? Math.max(0, Math.min(shift.check, shift.foodCheck!)) : null;
  const drinks = food == null ? null : Math.max(0, shift.check - food);
  const contribution = food == null || drinks == null ? null
    : food * Math.max(0, Math.min(100, foodMargin)) / 100
      + drinks * Math.max(0, Math.min(100, drinksMargin)) / 100;
  const costs = shift.costsPerDay != null && Number.isFinite(shift.costsPerDay)
    ? Math.max(0, shift.costsPerDay) : null;
  const ready = contribution != null && costs != null;
  const breakEven = !ready ? null : costs === 0 ? 0 : contribution > 0
    ? Math.ceil(Number((costs / contribution).toPrecision(12))) : null;
  const guestBuffer = breakEven == null ? null : shift.guests - breakEven;
  return { food, drinks, contribution, costs, ready, breakEven, guestBuffer };
}
