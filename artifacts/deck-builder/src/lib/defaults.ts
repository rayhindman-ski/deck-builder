import type { DeckState, Asset, UrlEntry, Intake, Audience } from './types';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const pub = (p: string) => `${base}${p}`;

export const EMBLEM_SRC = pub('/brand/rayana-bistro-hapjes.png');
export const COFFEE_LOGO_SRC = pub('/brand/rayana-coffees.png');

export const SECTION_TITLES = [
  'Cover',
  'Contents',
  'Brand & Sources',
  'Offerings & Pillars',
  'Shift Revenue Architecture',
  'Daily Unit Economics',
  'Year 1 Monthly Projection',
  'Three-Year Quarterly Projection',
  'Commercial & Investor Case',
];

export const defaultAssets = (): Asset[] => [
  { id: 'builtin-dark', name: 'Rayana Bistro Emblem — Dark', mime: 'image/png', bytes: 0, src: EMBLEM_SRC, tag: 'Logo', builtin: true },
  { id: 'builtin-light', name: 'Rayana Bistro Emblem — Light', mime: 'image/png', bytes: 0, src: EMBLEM_SRC, tag: 'Logo', builtin: true, invert: true },
  { id: 'builtin-pourover', name: 'Specialty Pour-Over Coffee', mime: 'image/jpeg', bytes: 0, src: pub('/samples/pour-over.jpg'), tag: 'Visual Asset', builtin: true },
  { id: 'builtin-snacks', name: 'Indonesian Snack Sampler', mime: 'image/jpeg', bytes: 0, src: pub('/samples/snack-sampler.jpg'), tag: 'Visual Asset', builtin: true },
  { id: 'builtin-founders', name: 'Ray & Legiyana, Founders', mime: 'image/jpeg', bytes: 0, src: pub('/samples/founders.jpg'), tag: 'Visual Asset', builtin: true },
];

export const defaultUrls = (): UrlEntry[] => [
  { id: 'u1', url: 'https://www.rayanacoffees.com', role: 'Primary Brand', status: null, title: '', summary: '', notes: 'Farm-direct Indonesian specialty coffee; Sumatra & Java smallholders.', checkedAt: null, error: null },
  { id: 'u2', url: 'https://www.rayanaroast.com', role: 'Specialty Roastery', status: null, title: '', summary: '', notes: 'Small-batch roasting, wholesale supply and barista training.', checkedAt: null, error: null },
];

export const PRESETS: { id: string; label: string; intake: Intake }[] = [
  {
    id: 'den-haag',
    label: 'Den Haag Flagship',
    intake: {
      title: "Rayana's Bistro — Den Haag Flagship",
      subtitle: 'Indonesian hospitality, specialty coffee',
      audience: 'Investors & Commercial Landlords',
      prompt:
        'Position Rayana\'s Bistro as a resilient all-day anchor tenant for a Den Haag high-street unit. Lead with farm-direct Indonesian coffee and heritage snacks, prove that breakfast, lunch and dinner each carry their own footfall, and show conservative-to-strong profit ranges a landlord can underwrite.',
    },
  },
  {
    id: 'multi-unit',
    label: 'Multi-Unit Expansion',
    intake: {
      title: "Rayana's Bistro — Multi-Unit Expansion",
      subtitle: 'A repeatable three-daypart format for Dutch city centres',
      audience: 'Franchise Partners',
      prompt:
        'Frame the flagship as the template for a second and third site in Rotterdam and Amsterdam-Zuid. Emphasise the repeatable menu spec, centralised roasting supply, and how the three-shift model compounds over twelve quarters.',
    },
  },
  {
    id: 'hybrid',
    label: 'Roastery-Bistro Hybrid',
    intake: {
      title: "Rayana's Roastery-Bistro",
      subtitle: 'Roasting on site, serving from first light to late evening',
      audience: 'Municipal Authorities',
      prompt:
        'Present a roastery-bistro hybrid that activates a quiet street across three dayparts, creates local jobs and training, and brings Indonesian-Dutch culinary heritage into public view. Keep the numbers sober and the community value explicit.',
    },
  },
];

export const AUDIENCES: Audience[] = ['Investors & Commercial Landlords', 'Franchise Partners', 'Municipal Authorities'];

export const createDefaultState = (): DeckState => ({
  version: 4,
  style: {
    theme: 'cream',
    font: 'sans',
    logo: 'builtin:rayana-dark',
    logoSize: 'lg',
    coverBg: null,
    brandTitle: "Rayana's Bistro",
    showMiniLogo: true,
    showSection: true,
    numbering: 'slide-x-of-y',
    footerText: 'Den Haag Flagship · Specialty Roastery Hybrid',
  },
  urls: defaultUrls(),
  assets: defaultAssets(),
  intake: { ...PRESETS[0].intake },
  fin: {
    morning: { guests: 40, check: 10 },
    lunch: { guests: 40, check: 15 },
    dinner: { guests: 40, check: 22 },
    days: 5,
    marginCoffee: 65,
    marginFood: 30,
    growth: 15,
  },
  toc: SECTION_TITLES.slice(2),
});

export const uid = () => Math.random().toString(36).slice(2, 10);
