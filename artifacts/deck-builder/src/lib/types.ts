export type ThemeId = 'cream' | 'gold' | 'green' | 'slate';
export type FontId = 'sans' | 'serif' | 'inter' | 'geometric' | 'mono';
export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';
export type Numbering = 'slide-x-of-y' | 'x-slash-y' | 'none';

export interface StyleSettings {
  theme: ThemeId;
  font: FontId;
  /** 'builtin:rayana-dark' | 'builtin:rayana-light' | 'asset:<id>' | 'none' */
  logo: string;
  logoSize: LogoSize;
  coverBg: string | null;
  brandTitle: string;
  showMiniLogo: boolean;
  showSection: boolean;
  numbering: Numbering;
  footerText: string;
}

export type UrlRole = 'Primary Brand' | 'Specialty Roastery' | 'Wholesale' | 'Menu & Catering';

export interface UrlEntry {
  id: string;
  url: string;
  role: UrlRole;
  status: number | null;
  title: string;
  summary: string;
  notes: string;
  checkedAt: string | null;
  error: string | null;
}

export type AssetTag = 'Logo' | 'Visual Asset' | 'Context Doc' | 'Menu Spec';

export interface Asset {
  id: string;
  name: string;
  mime: string;
  bytes: number;
  /** base64 data URL for uploads, public path for builtin samples */
  src: string;
  tag: AssetTag;
  builtin?: boolean;
  invert?: boolean;
}

export type Audience =
  | 'Investors & Commercial Landlords'
  | 'Franchise Partners'
  | 'Municipal Authorities';

export interface Intake {
  title: string;
  subtitle: string;
  audience: Audience;
  prompt: string;
}

export interface Shift {
  guests: number;
  check: number;
  /** Food portion of the average check; unset until entered by the user. */
  foodCheck?: number | null;
  /** Staffing and allocated overhead per operating day, excluding ingredients. */
  costsPerDay?: number | null;
  staffingPerDay?: number | null;
}

export interface Financials {
  takeawayScenarioApplied?: boolean;
  takeaway?: { orders: number; check: number; margin: number };
  planningScenarioApplied?: boolean;
  approvedMarginsApplied?: boolean;
  rentUtilitiesMonthly?: number | null;
  morning: Shift;
  lunch: Shift;
  dinner: Shift;
  days: number;
  marginCoffee: number;
  marginFood: number;
  growth: number;
}

export interface DeckState {
  version: 4;
  style: StyleSettings;
  urls: UrlEntry[];
  assets: Asset[];
  intake: Intake;
  fin: Financials;
  toc: string[];
}

export type PersistTier = 'localStorage' | 'sessionStorage' | 'window.name' | 'memory';
