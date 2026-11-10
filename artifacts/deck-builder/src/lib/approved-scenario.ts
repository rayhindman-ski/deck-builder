import type { Financials } from './types';

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
    morning: { ...f.morning, guests: 50, check: 10, foodCheck: 4, staffingPerDay: 144, costsPerDay: null },
    lunch: { ...f.lunch, guests: 50, check: 15, foodCheck: 10, staffingPerDay: 240, costsPerDay: null },
    dinner: { ...f.dinner, guests: 50, check: 22, foodCheck: 16, staffingPerDay: 240, costsPerDay: null },
  };
  return next.takeawayScenarioApplied ? next : {
    ...next,
    takeawayScenarioApplied: true,
    takeaway: next.takeaway ?? { orders: 20, check: 18, margin: 55 },
  };
}
