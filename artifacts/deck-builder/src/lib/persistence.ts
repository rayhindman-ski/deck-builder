import { createDefaultState, defaultAssets, SECTION_TITLES } from './defaults';
import type { DeckState, FontId, PersistTier } from './types';

export const STORAGE_KEY = 'deckBuilder.state.v4';
const LEGACY_KEYS = ['deckBuilder.state.v3', 'deckBuilder.state.v2', 'deckBuilder.state.v1'];
const WN_PREFIX = 'DECK_STATE:';
const FONT_IDS: FontId[] = ['sans', 'serif', 'inter', 'geometric', 'mono'];

const isObj = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);
const num = (v: unknown, d: number, min = -Infinity, max = Infinity) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d;
};

/** Sanitise any v1–v4 shaped payload into a clean v4 state. */
export function migrate(raw: unknown, legacy = false): DeckState {
  const d = createDefaultState();
  if (!isObj(raw)) return d;
  const s = isObj(raw.style) ? raw.style : isObj(raw.styling) ? raw.styling : {};
  const legacyFont: Record<string, FontId> = { modern: 'sans', jakarta: 'sans', playfair: 'serif', editorial: 'serif', montserrat: 'geometric', system: 'sans' };
  let font = String(s.font ?? s.typography ?? d.style.font);
  font = FONT_IDS.includes(font as FontId) ? font : legacyFont[font] ?? 'sans';
  const style = {
    ...d.style,
    ...Object.fromEntries(Object.entries(s).filter(([k]) => k in d.style)),
    font: font as FontId,
  };
  if (!['cream', 'gold', 'green', 'slate'].includes(style.theme)) style.theme = 'cream';
  if (!['sm', 'md', 'lg', 'xl'].includes(style.logoSize)) style.logoSize = 'lg';
  if (legacy) {
    style.logoSize = 'lg';
    if (typeof s.logo === 'string' && /svg|emblem|rayana/i.test(s.logo) && !s.logo.startsWith('builtin:')) style.logo = 'builtin:rayana-dark';
  }
  if (typeof style.logo !== 'string') style.logo = d.style.logo;
  if (style.coverBg && !/^#[0-9a-f]{6}$/i.test(style.coverBg)) style.coverBg = null;

  const f = isObj(raw.fin) ? raw.fin : isObj(raw.financials) ? raw.financials : {};
  const shift = (k: 'morning' | 'lunch' | 'dinner') => ({
    guests: num(f[k]?.guests, d.fin[k].guests, 0, 2000),
    check: num(f[k]?.check, d.fin[k].check, 0, 500),
  });
  const fin = {
    morning: shift('morning'), lunch: shift('lunch'), dinner: shift('dinner'),
    days: Math.round(num(f.days, d.fin.days, 1, 7)),
    marginCoffee: num(f.marginCoffee, d.fin.marginCoffee, 0, 100),
    marginFood: num(f.marginFood, d.fin.marginFood, 0, 100),
    growth: num(f.growth, d.fin.growth, 0, 50),
  };

  const urls = Array.isArray(raw.urls)
    ? raw.urls.filter((u: any) => isObj(u) && typeof u.url === 'string').map((u: any, i: number) => ({
        id: String(u.id ?? `m${i}`), url: u.url, role: u.role ?? 'Primary Brand', status: typeof u.status === 'number' ? u.status : null,
        title: String(u.title ?? ''), summary: String(u.summary ?? ''), notes: String(u.notes ?? ''), checkedAt: u.checkedAt ?? null, error: u.error ?? null,
      }))
    : d.urls;

  let assets = Array.isArray(raw.assets) ? raw.assets.filter((a: any) => isObj(a) && typeof a.src === 'string') : d.assets;
  const builtins = defaultAssets();
  assets = [...builtins, ...assets.filter((a: any) => !a.builtin && !builtins.some((b) => b.id === a.id))];

  const i = isObj(raw.intake) ? raw.intake : {};
  const intake = { ...d.intake, ...Object.fromEntries(Object.entries(i).filter(([k, v]) => k in d.intake && typeof v === 'string')) } as DeckState['intake'];

  const toc = (Array.isArray(raw.toc) ? raw.toc : d.toc)
    .map((t: unknown) => String(t).replace(/\|/g, '').replace(/\s{2,}/g, ' ').trim())
    .filter(Boolean);

  return { version: 4, style, urls, assets, intake, fin, toc: toc.length === 7 ? toc : SECTION_TITLES.slice(2) };
}

export function loadState(): { state: DeckState; tier: PersistTier; migrated: boolean } {
  const tries: [PersistTier, () => string | null][] = [
    ['localStorage', () => localStorage.getItem(STORAGE_KEY)],
    ['sessionStorage', () => sessionStorage.getItem(STORAGE_KEY)],
    ['window.name', () => (window.name.startsWith(WN_PREFIX) ? window.name.slice(WN_PREFIX.length) : null)],
  ];
  for (const [tier, get] of tries) {
    try {
      const v = get();
      if (v) return { state: migrate(JSON.parse(v)), tier, migrated: false };
    } catch { /* try next tier */ }
  }
  for (const k of LEGACY_KEYS) {
    try {
      const v = localStorage.getItem(k);
      if (v) {
        const state = migrate(JSON.parse(v), true);
        localStorage.removeItem(k);
        return { state, tier: 'localStorage', migrated: true };
      }
    } catch { /* ignore */ }
  }
  return { state: createDefaultState(), tier: 'localStorage', migrated: false };
}

export function saveState(state: DeckState): PersistTier {
  const json = JSON.stringify(state);
  try { localStorage.setItem(STORAGE_KEY, json); return 'localStorage'; } catch { /* quota */ }
  try { sessionStorage.setItem(STORAGE_KEY, json); return 'sessionStorage'; } catch { /* quota */ }
  try { window.name = WN_PREFIX + json; return 'window.name'; } catch { /* ignore */ }
  return 'memory';
}

export function clearState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* */ }
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* */ }
  if (window.name.startsWith(WN_PREFIX)) window.name = '';
}
