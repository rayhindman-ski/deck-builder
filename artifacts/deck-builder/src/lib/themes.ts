import type { FontId, LogoSize, StyleSettings, ThemeId } from './types';

export interface Theme {
  id: ThemeId;
  label: string;
  note: string;
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  line: string;
  accent: string;
  accentSoft: string;
  second: string;
  coverBg: string;
}

export const THEMES: Record<ThemeId, Theme> = {
  cream: { id: 'cream', label: 'Warm Cream', note: 'Default · paper & roast', bg: '#F7F0E3', surface: '#FFFAF1', ink: '#2E1D17', muted: '#7C6655', line: '#E6D8C1', accent: '#9C6A2E', accentSoft: '#F1E2C8', second: '#2E7D4D', coverBg: '#F4EBDB' },
  gold: { id: 'gold', label: 'Rayana Bistro Gold', note: 'Gilded · coffee brown', bg: '#F3E6CB', surface: '#FCF4E2', ink: '#3E1F1A', muted: '#80604A', line: '#E2CDA2', accent: '#B5832A', accentSoft: '#EED9AE', second: '#3E1F1A', coverBg: '#3E1F1A' },
  green: { id: 'green', label: 'Botanical Green', note: 'Pandan · official green', bg: '#EDF1E8', surface: '#F9FBF5', ink: '#1C2E23', muted: '#5D6E61', line: '#D3DDCF', accent: '#2E7D4D', accentSoft: '#D8E8DB', second: '#A97A33', coverBg: '#E4EDDF' },
  slate: { id: 'slate', label: 'Clean Slate', note: 'Quiet · boardroom', bg: '#F1F1EE', surface: '#FBFBF8', ink: '#22272B', muted: '#646C72', line: '#DCDDD8', accent: '#3C4B57', accentSoft: '#E1E5E7', second: '#9C6A2E', coverBg: '#F1F1EE' },
};

export const FONTS: Record<FontId, { label: string; family: string }> = {
  sans: { label: 'Modern Sans · Plus Jakarta Sans', family: "'Plus Jakarta Sans', sans-serif" },
  serif: { label: 'Luxury Editorial · Playfair Display', family: "'Playfair Display', Georgia, serif" },
  inter: { label: 'Clean Interface · Inter', family: "'Inter', sans-serif" },
  geometric: { label: 'Geometric · Montserrat', family: "'Montserrat', sans-serif" },
  mono: { label: 'Monospace · JetBrains Mono', family: "SFMono-Regular, 'JetBrains Mono', monospace" },
};

export const LOGO_SIZES: Record<LogoSize, { label: string; px: number }> = {
  sm: { label: 'Small', px: 112 },
  md: { label: 'Medium', px: 176 },
  lg: { label: 'Large Hero', px: 256 },
  xl: { label: 'XL', px: 320 },
};

export function isDark(hex: string) {
  const h = hex.replace('#', '');
  if (h.length !== 6) return false;
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

export const coverBgOf = (s: StyleSettings) => s.coverBg || THEMES[s.theme].coverBg;
