import type { Financials } from './types';

/** Apply the user-approved baseline once; preserve subsequent edits and imports. */
export function withApprovedScenario(f: Financials): Financials {
  if (f.planningScenarioApplied) return f;
  return {
    ...f,
    planningScenarioApplied: true,
    rentUtilitiesMonthly: 3000,
    days: 5,
    marginFood: 30,
    marginCoffee: 65,
    morning: { ...f.morning, guests: 50, check: 10, foodCheck: 4, staffingPerDay: 144, costsPerDay: null },
    lunch: { ...f.lunch, guests: 50, check: 15, foodCheck: 10, staffingPerDay: 240, costsPerDay: null },
    dinner: { ...f.dinner, guests: 50, check: 22, foodCheck: 16, staffingPerDay: 240, costsPerDay: null },
  };
}
