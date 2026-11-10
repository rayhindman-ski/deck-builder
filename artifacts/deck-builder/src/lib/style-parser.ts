import type { FontId, LogoSize, Numbering, StyleSettings, ThemeId } from './types';

export const SUGGESTIONS = [
  'theme: warm cream',
  'theme: gold',
  'theme: botanical green',
  'cover bg #3E1F1A',
  'cover logo size: lg',
  'cover logo size: xl',
  'font: sans',
  'font: serif',
  'logo: light',
  'numbering: x/y',
  'mini logo: off',
  'footer: "Den Haag Flagship · 2026"',
];

const THEME_WORDS: [RegExp, ThemeId][] = [
  [/cream|warm/, 'cream'],
  [/gold|bistro/, 'gold'],
  [/green|botanic|pandan/, 'green'],
  [/slate|clean|grey|gray/, 'slate'],
];
const FONT_WORDS: [RegExp, FontId][] = [
  [/serif|playfair|editorial|luxury/, 'serif'],
  [/mono|jetbrains|code/, 'mono'],
  [/inter|interface/, 'inter'],
  [/geometric|montserrat/, 'geometric'],
  [/sans|jakarta|modern/, 'sans'],
];

export interface ParseResult {
  patch: Partial<StyleSettings>;
  applied: string[];
  unknown: string[];
}

const onOff = (v: string) => (/^(on|yes|true|show|enable)/.test(v) ? true : /^(off|no|false|hide|disable)/.test(v) ? false : null);

/** Deterministic, line/semicolon/comma separated "key: value" parser. */
export function parseStylePrompt(text: string): ParseResult {
  const patch: Partial<StyleSettings> = {};
  const applied: string[] = [];
  const unknown: string[] = [];
  const parts = text.split(/\n|;/).map((p) => p.trim()).filter(Boolean);
  for (const raw of parts) {
    const line = raw.toLowerCase();
    const hex = raw.match(/#([0-9a-f]{6}|[0-9a-f]{3})\b/i);
    const quoted = raw.match(/["“](.+?)["”]/);
    const value = line.includes(':') ? line.slice(line.indexOf(':') + 1).trim() : line;
    if (/cover\s*(bg|background)/.test(line)) {
      if (/default|reset|auto/.test(value)) { patch.coverBg = null; applied.push('Cover background → theme default'); continue; }
      if (hex) {
        let h = hex[1];
        if (h.length === 3) h = h.split('').map((c) => c + c).join('');
        patch.coverBg = `#${h.toUpperCase()}`;
        applied.push(`Cover background → #${h.toUpperCase()}`);
        continue;
      }
    } else if (/logo\s*size|emblem\s*size/.test(line)) {
      const m: [RegExp, LogoSize][] = [[/\bxl\b|extra/, 'xl'], [/\blg\b|large|hero/, 'lg'], [/\bmd\b|medium/, 'md'], [/\bsm\b|small/, 'sm']];
      const hit = m.find(([r]) => r.test(value));
      if (hit) { patch.logoSize = hit[1]; applied.push(`Cover logo size → ${hit[1].toUpperCase()}`); continue; }
    } else if (/mini\s*logo/.test(line)) {
      const b = onOff(value);
      if (b !== null) { patch.showMiniLogo = b; applied.push(`Header mini logo → ${b ? 'on' : 'off'}`); continue; }
    } else if (/section|metadata/.test(line)) {
      const b = onOff(value);
      if (b !== null) { patch.showSection = b; applied.push(`Section metadata → ${b ? 'on' : 'off'}`); continue; }
    } else if (/^logo|emblem/.test(line)) {
      if (/none|off|hide/.test(value)) { patch.logo = 'none'; applied.push('Cover emblem → none (title shown)'); continue; }
      if (/light/.test(value)) { patch.logo = 'builtin:rayana-light'; applied.push('Cover emblem → light'); continue; }
      if (/dark/.test(value)) { patch.logo = 'builtin:rayana-dark'; applied.push('Cover emblem → dark'); continue; }
    } else if (/^theme|palette/.test(line)) {
      const hit = THEME_WORDS.find(([r]) => r.test(value));
      if (hit) { patch.theme = hit[1]; applied.push(`Theme → ${hit[1]}`); continue; }
    } else if (/^font|typeface|type:/.test(line)) {
      const hit = FONT_WORDS.find(([r]) => r.test(value));
      if (hit) { patch.font = hit[1]; applied.push(`Font → ${hit[1]}`); continue; }
    } else if (/^number|pagination/.test(line)) {
      let n: Numbering | null = null;
      if (/none|off|hide/.test(value)) n = 'none';
      else if (/\//.test(value)) n = 'x-slash-y';
      else if (/of/.test(value)) n = 'slide-x-of-y';
      if (n) { patch.numbering = n; applied.push(`Numbering → ${n}`); continue; }
    } else if (/^footer/.test(line)) {
      const v = quoted ? quoted[1] : raw.slice(raw.indexOf(':') + 1).trim();
      if (v) { patch.footerText = v; applied.push(`Footer → "${v}"`); continue; }
    } else if (/^(brand\s*)?title/.test(line)) {
      const v = quoted ? quoted[1] : raw.slice(raw.indexOf(':') + 1).trim();
      if (v) { patch.brandTitle = v; applied.push(`Brand title → "${v}"`); continue; }
    }
    unknown.push(raw);
  }
  return { patch, applied, unknown };
}
