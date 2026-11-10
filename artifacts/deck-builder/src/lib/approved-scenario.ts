import type { Financials, Shift } from './types';

export const APPROVED_TICKETS = { morning: 8, lunch: 14, dinner: 18 } as const;
export const APPROVED_TICKET_SCENARIO = Object.values(APPROVED_TICKETS).join('/');

/** Apply the user-approved baseline once; preserve subsequent edits and imports. */
export function withApprovedScenario(f: Financials): Financials {
  let next = f;
  if (f.planningScenarioApplied) {
    next = f.approvedMarginsApplied ? f : {
      ...f, marginFood: 45, marginCoffee: 55, approvedMarginsApplied: true,
    };
  } else next = {
    ...f,
    planningScenarioApplied: true,
    approvedMarginsApplied: true,
    rentUtilitiesMonthly: 3000,
    days: 5,
    marginFood: 45,
    marginCoffee: 55,
    morning: { ...f.morning, guests: 50, check: APPROVED_TICKETS.morning, foodCheck: 4, staffingPerDay: 144, costsPerDay: null },
    lunch: { ...f.lunch, guests: 50, check: APPROVED_TICKETS.lunch, foodCheck: 10, staffingPerDay: 240, costsPerDay: null },
    dinner: { ...f.dinner, guests: 50, check: APPROVED_TICKETS.dinner, foodCheck: 16, staffingPerDay: 240, costsPerDay: null },
  };
  next = next.takeawayScenarioApplied ? next : {
    ...next,
    takeawayScenarioApplied: true,
    takeaway: next.takeaway ?? { orders: 20, check: 18, margin: 55 },
  };
  if (next.approvedTicketScenario === APPROVED_TICKET_SCENARIO) return next;
  const ticket = (shift: Shift, check: number): Shift => ({
    ...shift, check,
    foodCheck: shift.foodCheck == null ? shift.foodCheck : Math.min(shift.foodCheck, check),
  });
  return {
    ...next,
    approvedTicketScenario: APPROVED_TICKET_SCENARIO,
    morning: ticket(next.morning, APPROVED_TICKETS.morning),
    lunch: ticket(next.lunch, APPROVED_TICKETS.lunch),
    dinner: ticket(next.dinner, APPROVED_TICKETS.dinner),
  };
}
