import type { CSSProperties, ReactNode } from 'react';
import type { DeckState, Financials } from '@/lib/types';
import type { Model } from '@/lib/financial';
import { fmtEur, fmtEur2, fmtK, fmtNum, PROJECTION_YEAR } from '@/lib/financial';
import { coverBgOf, FONTS, isDark, LOGO_SIZES, THEMES, type Theme } from '@/lib/themes';
import { BISTRO_TAGLINE, bistroSource, defaultAssets, isBistroSource, SECTION_TITLES } from '@/lib/defaults';
import { Emblem, resolveLogo } from './Emblem';
import { ShiftInsights } from './ShiftInsights';
import { SLIDE_COUNT, SLIDE_H, SLIDE_W } from './constants';

export interface SlideProps {
  index: number;
  state: DeckState;
  model: Model;
  interactive?: boolean;
  scenario?: boolean;
  onJump?: (i: number) => void;
  onFin?: (f: Partial<Financials>) => void;
}

const MONO = "'JetBrains Mono', SFMono-Regular, monospace";

function Eyebrow({ t, children }: { t: Theme; children: ReactNode }) {
  return <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.accent, fontWeight: 600 }}>{children}</div>;
}
function Title({ t, children, sub }: { t: Theme; children: ReactNode; sub?: ReactNode }) {
  return (
    <div style={{ marginTop: 6 }}>
      <h2 style={{ fontSize: 34, lineHeight: 1.08, fontWeight: 700, color: t.ink, margin: 0, letterSpacing: '-0.015em' }}>{children}</h2>
      {sub && <p style={{ fontSize: 13.5, lineHeight: 1.5, color: t.muted, margin: '8px 0 0', maxWidth: 720 }}>{sub}</p>}
    </div>
  );
}
const card = (t: Theme, extra: CSSProperties = {}): CSSProperties => ({ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 10, ...extra });
const tag = (t: Theme, strong = false): CSSProperties => ({
  fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 7px', borderRadius: 4,
  background: strong ? t.accent : t.accentSoft, color: strong ? t.surface : t.accent, fontWeight: 600, whiteSpace: 'nowrap',
});

export function Slide(p: SlideProps) {
  const { index, state } = p;
  const s = state.style;
  const t = THEMES[s.theme];
  const isCover = index === 0;
  const cbg = coverBgOf(s);
  const coverDark = isCover && isDark(cbg);
  const ink = coverDark ? '#F7EBD6' : t.ink;
  const muted = coverDark ? '#CDB89A' : t.muted;
  const logo = resolveLogo(s.logo, state.assets);
  const num =
    s.numbering === 'none' ? '' : s.numbering === 'x-slash-y' ? `${index + 1} / ${SLIDE_COUNT}` : `Slide ${index + 1} of ${SLIDE_COUNT}`;

  const sectionLabel = index < 2 ? SECTION_TITLES[index] : `${String(index - 1).padStart(2, '0')}. ${state.toc[index - 2] ?? SECTION_TITLES[index]}`;

  return (
    <div
      style={{
        width: SLIDE_W, height: SLIDE_H, position: 'relative', overflow: 'hidden', background: isCover ? cbg : t.bg, color: ink,
        fontFamily: FONTS[s.font].family, display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
      }}
    >
      {/* fine inner rule */}
      <div style={{ position: 'absolute', inset: 14, border: `1px solid ${coverDark ? 'rgba(247,235,214,0.18)' : t.line}`, borderRadius: 4, pointerEvents: 'none' }} />
      {!isCover && (
        <header style={{ height: 58, padding: '0 44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${t.line}`, margin: '14px 14px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {s.showMiniLogo && logo && <Emblem src={logo.src} invert={false} width={77} />}
          </div>
          {s.showSection && <span style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.muted }}>{sectionLabel}</span>}
        </header>
      )}
      <main style={{ flex: 1, padding: isCover ? '40px 72px 0' : '26px 58px 0', position: 'relative', minHeight: 0 }}>
        <Body {...p} t={t} ink={ink} muted={muted} coverDark={coverDark} logo={logo} />
      </main>
      <footer style={{ height: 44, margin: '0 14px 14px', padding: '0 44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: MONO, fontSize: 10.5, color: muted, borderTop: `1px solid ${coverDark ? 'rgba(247,235,214,0.18)' : t.line}` }}>
        <span>{isCover ? s.brandTitle : ''}</span>
        <span style={{ fontStyle: 'italic' }}>{s.footerText}</span>
        <span>{num}</span>
      </footer>
    </div>
  );
}

type BodyProps = SlideProps & { t: Theme; ink: string; muted: string; coverDark: boolean; logo: { src: string; invert: boolean } | null };

function Body(p: BodyProps) {
  switch (p.index) {
    case 0: return <Cover {...p} />;
    case 1: return <Toc {...p} />;
    case 2: return <Brand {...p} />;
    case 3: return <Pillars {...p} />;
    case 4: return <Shifts {...p} />;
    case 5: return <Unit {...p} />;
    case 6: return <Monthly {...p} />;
    case 7: return <Quarterly {...p} />;
    default: return <Case {...p} />;
  }
}

function Cover({ state, model, t, ink, muted, coverDark, logo }: BodyProps) {
  const size = LOGO_SIZES[state.style.logoSize].px;
  const kpis = [
    ['Daily Guests', fmtNum(model.guestsDay), `${state.fin.days} days / week`],
    ['Daily Revenue', fmtEur(model.revDay), `avg check ${fmtEur2(model.avgCheck)}`],
    ['Year 1 Revenue', fmtEur(model.revYear), `${model.annualDays} operating days`],
    ['Year 1 Profit Estimate', fmtEur(model.profitYearLow), `Conservative ${state.fin.marginFood}% margin`],
  ];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: coverDark ? '#D9B36A' : t.accent }}>
        {state.intake.audience} · {PROJECTION_YEAR}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, minHeight: 0 }}>
        {logo ? (
          <Emblem src={logo.src} invert={coverDark || logo.invert} width={size * 1.95} />
        ) : (
          <h1 style={{ fontSize: 58, lineHeight: 1.02, margin: 0, fontWeight: 700, color: ink, letterSpacing: '-0.02em', maxWidth: 860 }}>{state.intake.title}</h1>
        )}
        <p style={{ fontSize: 17, color: muted, margin: 0, maxWidth: 680, lineHeight: 1.45 }}>{state.intake.subtitle.replace(/\s+and\s+three[-‑– ]shift.*$/i, '').trim()}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, width: '100%', paddingBottom: 26 }}>
        {kpis.map(([k, v, n]) => (
          <div key={k} style={{ textAlign: 'center', padding: '14px 16px', borderRadius: 10, background: coverDark ? 'rgba(247,235,214,0.07)' : t.surface, border: `1px solid ${coverDark ? 'rgba(247,235,214,0.18)' : t.line}` }}>
            <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: coverDark ? '#D9B36A' : t.accent }}>{k}</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6, color: ink, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
            <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{n}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Toc({ state, t, onJump, interactive }: BodyProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 56, height: '100%' }}>
      <div style={{ paddingTop: 20 }}>
        <Eyebrow t={t}>Contents</Eyebrow>
        <Title t={t} sub={BISTRO_TAGLINE}>{state.style.brandTitle}</Title>
        <div style={{ marginTop: 26, height: 3, width: 64, background: t.accent, borderRadius: 2 }} />
      </div>
      <ol style={{ listStyle: 'none', margin: 0, padding: '14px 0 0' }}>
        {state.toc.map((title, i) => {
          const target = i + 2;
          return (
            <li key={i}>
              <div
                role={interactive ? 'button' : undefined}
                data-testid={`toc-jump-${target + 1}`}
                onClick={interactive && onJump ? () => onJump(target) : undefined}
                style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '15px 0', borderBottom: `1px solid ${t.line}`, cursor: interactive ? 'pointer' : 'default' }}
              >
                <span style={{ fontFamily: MONO, fontSize: 14, color: t.accent, fontWeight: 600, width: 34 }}>{String(i + 1).padStart(2, '0')}.</span>
                <span style={{ fontSize: 20, fontWeight: 600, color: t.ink }}>{title}</span>
                <span style={{ flex: 1, borderBottom: `2px dotted ${t.line}`, transform: 'translateY(-5px)' }} />
                <span style={{ fontFamily: MONO, fontSize: 15, color: t.ink, fontVariantNumeric: 'tabular-nums' }}>{target + 1}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Brand({ state, t }: BodyProps) {
  const builtins = defaultAssets();
  const slots = [
    ['builtin-founders', 'Ray & Yana'],
    ['builtin-snacks', 'Indonesian Snacks'],
    ['builtin-pourover', 'Pour-Over Coffee'],
    ['builtin-meals', 'Bistro Meals'],
  ];
  const visuals = slots.map(([id, label]) => ({
    ...(state.assets.find((a) => a.id === id) ?? builtins.find((a) => a.id === id)!),
    label,
  }));
  const bistro = state.urls.find((u) => isBistroSource(u.url)) ?? bistroSource();
  const brands = [...state.urls.filter((u) => !isBistroSource(u.url)).slice(0, 2), bistro];
  const domain = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const brandTitle = (url: string, fallback: string) => {
    const host = domain(url).replace(/^www\./i, '').split(/[/?#]/)[0]?.toLowerCase();
    if (host === 'rayanacoffees.com') return 'Rayana Indonesian Coffees';
    if (host === 'rayanaroast.com') return 'Rayana Roast';
    return fallback || domain(url);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Eyebrow t={t}>Origin · Heritage · Ecosystem</Eyebrow>
      <Title t={t} sub="Two decades of direct relationships with Indonesian smallholders, translated into a European bistro that serves from first coffee to last plate.">
        Great Indonesian Food, Coffee & Culture
      </Title>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 18, marginTop: 20, flex: 1, minHeight: 0, paddingBottom: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {brands.map((u) => (
            <div key={u.id} style={card(t, { padding: '13px 16px' })}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: t.ink }}>{brandTitle(u.url, u.title)}</span>
                <span style={tag(t)}>{isBistroSource(u.url) ? 'Coming soon' : u.role}</span>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: t.accent, marginTop: 3 }}>{domain(u.url)}</div>
              <div style={{ fontSize: 11.5, color: t.muted, marginTop: 6, lineHeight: 1.45 }}>{(u.notes || u.summary).slice(0, 150)}</div>
            </div>
          ))}
          <div style={card(t, { padding: '13px 16px', background: t.accentSoft, borderColor: t.accentSoft, marginTop: 'auto' })}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: t.ink }}>Philosophy</div>
            <div style={{ fontSize: 11.5, color: t.ink, lineHeight: 1.5, marginTop: 4, opacity: 0.85 }}>
              Great food and great coffee become a great love. Every cup traces to a named highland farm; every snack carries a family recipe from Java and Sumatra.
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 10, minHeight: 0 }}>
          {visuals.map((v) => (
            <div key={v.id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', minHeight: 0, background: t.line }}>
              <img src={v.src} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', left: 8, bottom: 8, ...tag(t, true), fontSize: 9 }}>{v.label}</div>
            </div>
          ))}
          {visuals.length === 0 && (
            <div style={{ gridColumn: 'span 2', gridRow: 'span 2', ...card(t), display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.muted, fontSize: 13 }}>
              Tag images as Visual Asset to fill this showcase.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Pillars({ state, t }: BodyProps) {
  const { marginCoffee: mc, marginFood: mf } = state.fin;
  const pillars = [
    ['Specialty Coffee Bar', mc, 'Single-origin pour-overs, espresso from Gayo and Java Malabar, iced pandan lattes and oat-milk craft drinks.', 'Morning & all-day'],
    ['Roasted Beans Retail', mc, '250g and 1kg bags roasted in-house from Sumatra, Java and Bali Kintamani lots, plus brewing gear.', 'Retail shelf & web'],
    ['Coffee Wisdom', null, 'Cupping sessions, barista workshops and latte art workshops for curious coffee lovers.', 'Sessions & workshops'],
    ['Snacks & Desserts', mf, 'Spekkoek, risoles, lemper and pastel goreng, baked and folded daily for the counter.', 'Lunch & afternoon'],
    ['Bistro Meals', mf, 'Slow-simmered rendang, mie ayam jamur, gado-gado and a seasonal rijsttafel for the evening room.', 'Midday & evening'],
    ['Events and Catering', null, 'Bring people together over unforgettable Indonesian flavours.', 'Office · Private party · Special events'],
  ] as const;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Eyebrow t={t}>Product Matrix · Revenue Engines</Eyebrow>
      <Title t={t} sub="Coffee, retail and hands-on learning, alongside Indonesian snacks, bistro meals and catering for every occasion.">Taste, Discover &amp; Enjoy</Title>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gridTemplateRows: 'repeat(2, minmax(0, 1fr))', gap: 14, marginTop: 20, flex: 1, minHeight: 0 }}>
        {pillars.map(([name, m, d, when], i) => (
          <div key={name} style={card(t, { padding: '18px 20px', display: 'flex', flexDirection: 'column' })}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: MONO, fontSize: 12, color: t.accent }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: t.ink }}>{name}</span>
              </div>
              <span style={tag(t, i < 2)}>{m === null ? (name === 'Coffee Wisdom' ? 'Workshops' : 'Catering') : `${m}% gross margin`}</span>
            </div>
            <p style={{ fontSize: 12.5, color: t.muted, lineHeight: 1.55, margin: '10px 0 0' }}>{d}</p>
            <div style={{ marginTop: 'auto', fontFamily: MONO, fontSize: 10.5, lineHeight: 1.5, color: t.muted, borderTop: `1px dashed ${t.line}`, paddingTop: 8 }}>{when}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScenarioBar({ state, t, onFin }: BodyProps) {
  if (!onFin) return null;
  const f = state.fin;
  const sliders: [string, number, number, number, number, (v: number) => Partial<Financials>][] = [
    ['Morning guests', f.morning.guests, 0, 200, 1, (v) => ({ morning: { ...f.morning, guests: v } })],
    ['Lunch guests', f.lunch.guests, 0, 200, 1, (v) => ({ lunch: { ...f.lunch, guests: v } })],
    ['Dinner guests', f.dinner.guests, 0, 200, 1, (v) => ({ dinner: { ...f.dinner, guests: v } })],
    ['Days / week', f.days, 1, 7, 1, (v) => ({ days: v })],
    ['Growth %', f.growth, 0, 50, 1, (v) => ({ growth: v })],
  ];
  return (
    <div data-scenario style={{ position: 'absolute', right: 58, top: 0, display: 'flex', gap: 14, padding: '8px 14px', borderRadius: 999, background: t.ink, color: t.surface, fontFamily: MONO, fontSize: 10, alignItems: 'center', zIndex: 5 }}>
      <span style={{ color: t.accentSoft, letterSpacing: '0.12em' }}>WHAT-IF</span>
      {sliders.map(([label, v, min, max, step, fn]) => (
        <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {label}
          <input data-testid={`scenario-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`} type="range" min={min} max={max} step={step} value={v} onChange={(e) => onFin(fn(Number(e.target.value)))} style={{ width: 64, accentColor: t.accent }} />
          <b style={{ width: 22, textAlign: 'right' }}>{v}</b>
        </label>
      ))}
    </div>
  );
}

function Shifts(p: BodyProps) {
  const { model, t, state } = p;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {p.interactive && p.scenario && <ScenarioBar {...p} />}
      <Eyebrow t={t}>Three Dayparts · One Room</Eyebrow>
      <Title t={t} sub="Each shift carries its own guest profile and ticket. Revenue does not depend on a single rush.">Shift Revenue Overview</Title>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16, flex: 1, minHeight: 0, paddingBottom: 10 }}>
        {model.shifts.map((s, i) => (
          <div key={s.key} style={card(t, { padding: '16px 22px', display: 'flex', flexDirection: 'column', borderTop: `4px solid ${i === 2 ? t.second : t.accent}` })}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, color: t.muted }}>{s.hours}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: t.ink, marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: 13, color: t.muted }}>{s.sub}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
              <Stat t={t} k="Guests / day" v={fmtNum(s.guests)} />
              <Stat t={t} k="Average check" v={fmtEur2(s.check)} />
            </div>
            <ShiftInsights shift={state.fin[s.key]} shiftKey={s.key} financials={state.fin} theme={t} />
            <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: `1px solid ${t.line}` }}>
              <Stat t={t} k="Daily turnover" v={fmtEur(s.daily)} big />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: t.muted }}>
                <span>Annual revenue</span>
                <b style={{ color: t.ink, fontVariantNumeric: 'tabular-nums' }}>{fmtEur(s.annual)}</b>
              </div>
              <div style={{ height: 6, background: t.accentSoft, borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ width: `${s.share * 100}%`, height: '100%', background: i === 2 ? t.second : t.accent }} />
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: t.muted, marginTop: 4 }}>{(s.share * 100).toFixed(1)}% of daily revenue</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ flexShrink: 0, marginTop: 8, fontSize: 9.5, lineHeight: 1.4, color: t.muted, paddingBottom: 10 }}>
        Planning estimates · Rent + utilities {state.fin.rentUtilitiesMonthly == null ? 'not set' : `${fmtEur(state.fin.rentUtilitiesMonthly)}/month`} · Staffing {model.shifts.map(s => state.fin[s.key].staffingPerDay == null ? '—' : fmtEur(state.fin[s.key].staffingPerDay!)).join(' / ')} per shift · Margins {state.fin.marginFood}% / {state.fin.marginCoffee}% · VAT-exclusive.
        <br />Break-even excludes insurance, administration, maintenance, financing and tax; not a net-profit forecast.
      </div>
    </div>
  );
}
function Stat({ t, k, v, big }: { t: Theme; k: string; v: string; big?: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.muted }}>{k}</div>
      <div style={{ fontSize: big ? 30 : 19, fontWeight: 700, color: big ? t.accent : t.ink, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
    </div>
  );
}

const th = (t: Theme, right = false): CSSProperties => ({ fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.muted, textAlign: right ? 'right' : 'left', padding: '9px 12px', borderBottom: `1px solid ${t.line}`, fontWeight: 600 });
const td = (t: Theme, right = false, strong = false): CSSProperties => ({ fontSize: 12.5, color: t.ink, textAlign: right ? 'right' : 'left', padding: '9px 12px', borderBottom: `1px solid ${t.line}`, fontVariantNumeric: 'tabular-nums', fontWeight: strong ? 700 : 400, fontFamily: right ? MONO : undefined });

function Unit(p: BodyProps) {
  const { model, t, state } = p;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {p.interactive && p.scenario && <ScenarioBar {...p} />}
      <Eyebrow t={t}>P&L Granularity · Per-Day Turnover</Eyebrow>
      <Title t={t} sub={`Profit shown as a range: ${state.fin.marginFood}% food/kitchen margin as the conservative floor, ${state.fin.marginCoffee}% coffee/retail margin as the ceiling.`}>Daily Unit Economics</Title>
      <div style={card(t, { marginTop: 20, overflow: 'hidden' })}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={th(t)}>Shift</th><th style={th(t)}>Hours</th><th style={th(t, true)}>Guests</th><th style={th(t, true)}>Avg ticket</th>
            <th style={th(t, true)}>Daily turnover</th><th style={th(t, true)}>Profit low</th><th style={th(t, true)}>Profit high</th><th style={th(t, true)}>Share</th>
          </tr></thead>
          <tbody>
            {model.shifts.map((s) => (
              <tr key={s.key}>
                <td style={td(t, false, true)}>{s.label} <span style={{ color: t.muted, fontWeight: 400 }}>· {s.sub}</span></td>
                <td style={{ ...td(t), fontFamily: MONO, fontSize: 11, color: t.muted }}>{s.hours}</td>
                <td style={td(t, true)}>{fmtNum(s.guests)}</td>
                <td style={td(t, true)}>{fmtEur2(s.check)}</td>
                <td style={{ ...td(t, true), color: t.accent }}>{fmtEur(s.daily)}</td>
                <td style={td(t, true)}>{fmtEur(s.low)}</td>
                <td style={td(t, true)}>{fmtEur(s.high)}</td>
                <td style={td(t, true)}>{(s.share * 100).toFixed(1)}%</td>
              </tr>
            ))}
            <tr style={{ background: t.accentSoft }}>
              <td style={{ ...td(t, false, true), fontSize: 14 }}>Daily totals</td><td style={td(t)} />
              <td style={td(t, true, true)}>{fmtNum(model.guestsDay)}</td>
              <td style={td(t, true, true)}>{fmtEur2(model.avgCheck)}</td>
              <td style={{ ...td(t, true, true), color: t.accent, fontSize: 15 }}>{fmtEur(model.revDay)}</td>
              <td style={td(t, true, true)}>{fmtEur(model.profitDayLow)}</td>
              <td style={td(t, true, true)}>{fmtEur(model.profitDayHigh)}</td>
              <td style={td(t, true, true)}>100%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
        {[
          ['Annualisation basis', `${state.fin.days} days × 52 weeks = ${model.annualDays} operating days`],
          ['Year 1 gross revenue', `${fmtEur(model.revYear)} from ${fmtNum(model.guestsYear)} guests`],
          ['Year 1 profit range', `${fmtEur(model.profitYearLow)} – ${fmtEur(model.profitYearHigh)}`],
        ].map(([k, v]) => (
          <div key={k} style={card(t, { padding: '12px 14px' })}>
            <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.accent }}>{k}</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: t.ink, marginTop: 4 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Monthly(p: BodyProps) {
  const { model, t, state } = p;
  const tt = model.monthTotal;
  const cell: CSSProperties = { padding: '5px 12px' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {p.interactive && p.scenario && <ScenarioBar {...p} />}
      <Eyebrow t={t}>Calendar P&L · Year 1 ({PROJECTION_YEAR})</Eyebrow>
      <Title t={t} sub={`Operating days counted from the real ${PROJECTION_YEAR} calendar at ${state.fin.days} days per week; guest volumes rounded per month.`}>Twelve-Month Operating Forecast</Title>
      <div style={card(t, { marginTop: 14, overflow: 'hidden' })}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={{ ...th(t), ...cell }}>Month</th><th style={{ ...th(t, true), ...cell }}>Cal. days</th><th style={{ ...th(t, true), ...cell }}>Op. days</th>
            <th style={{ ...th(t, true), ...cell }}>Guests</th><th style={{ ...th(t, true), ...cell }}>Gross revenue</th><th style={{ ...th(t, true), ...cell }}>Profit low</th><th style={{ ...th(t, true), ...cell }}>Profit high</th>
          </tr></thead>
          <tbody>
            {model.months.map((m) => (
              <tr key={m.name}>
                <td style={{ ...td(t, false, true), ...cell, fontSize: 11.5 }}>{m.name}</td>
                <td style={{ ...td(t, true), ...cell, fontSize: 11, color: t.muted }}>{m.calDays}</td>
                <td style={{ ...td(t, true), ...cell, fontSize: 11, color: t.accent }}>{m.op}</td>
                <td style={{ ...td(t, true), ...cell, fontSize: 11 }}>{fmtNum(m.guests)}</td>
                <td style={{ ...td(t, true), ...cell, fontSize: 11 }}>{fmtEur(m.revenue)}</td>
                <td style={{ ...td(t, true), ...cell, fontSize: 11 }}>{fmtEur(m.low)}</td>
                <td style={{ ...td(t, true), ...cell, fontSize: 11 }}>{fmtEur(m.high)}</td>
              </tr>
            ))}
            <tr style={{ background: t.accentSoft }}>
              <td style={{ ...td(t, false, true), ...cell }}>Year 1</td><td style={{ ...td(t, true), ...cell }} />
              <td style={{ ...td(t, true, true), ...cell }}>{tt.op}</td>
              <td style={{ ...td(t, true, true), ...cell }}>{fmtNum(tt.guests)}</td>
              <td style={{ ...td(t, true, true), ...cell, color: t.accent }}>{fmtEur(tt.revenue)}</td>
              <td style={{ ...td(t, true, true), ...cell }}>{fmtEur(tt.low)}</td>
              <td style={{ ...td(t, true, true), ...cell }}>{fmtEur(tt.high)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Quarterly(p: BodyProps) {
  const { model, t, state } = p;
  const max = Math.max(...model.quarters.map((q) => q.revenue), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {p.interactive && p.scenario && <ScenarioBar {...p} />}
      <Eyebrow t={t}>Medium-Term Trajectory · 12 Quarters</Eyebrow>
      <Title t={t} sub={`Year 1 seasonality compounded at ${state.fin.growth}% per year as regulars mature, bean retail grows and catering comes online.`}>Three-Year Quarterly Roadmap</Title>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
        {model.years.map((y) => (
          <div key={y.year} style={card(t, { padding: '12px 16px' })}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', color: t.accent }}>YEAR {y.year}</span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: t.muted }}>{y.year === 1 ? 'Base model' : `+${state.fin.growth}% compounded`}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: t.ink, fontVariantNumeric: 'tabular-nums' }}>{fmtEur(y.revenue)}</div>
            <div style={{ fontSize: 11, color: t.muted }}>{fmtNum(y.guests)} guests · profit {fmtK(y.low)} – {fmtK(y.high)}</div>
          </div>
        ))}
      </div>
      <div style={card(t, { marginTop: 14, padding: '14px 18px 10px', flex: 1, marginBottom: 18, display: 'flex', flexDirection: 'column' })}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: t.muted, marginBottom: 6 }}>Quarterly gross revenue (EUR) · darker band = high-margin profit ceiling</div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          {model.quarters.map((q, i) => (
            <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: t.ink, marginBottom: 3 }}>{fmtK(q.revenue)}</div>
              <div style={{ width: '100%', height: `${(q.revenue / max) * 78}%`, background: q.year === 1 ? t.accentSoft : q.year === 2 ? t.line : t.accentSoft, borderRadius: '4px 4px 0 0', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${(q.high / q.revenue) * 100}%`, background: q.year === 3 ? t.second : t.accent, opacity: 0.35 + q.year * 0.2 }} />
              </div>
              <div style={{ fontFamily: MONO, fontSize: 9.5, color: t.muted, marginTop: 4 }}>Y{q.year} Q{q.q}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Case({ state, model, t }: BodyProps) {
  const a = state.intake.audience;
  const head = a === 'Franchise Partners' ? 'Why This Format Travels' : a === 'Municipal Authorities' ? 'Why This Belongs On Our Street' : 'Why Rayana Is a Bankable Tenant';
  const items = [
    ['Den Haag commercial viability', `${fmtEur(model.revYear)} Year 1 gross on ${model.annualDays} trading days supports a high-street rent with headroom.`],
    ['Foot-traffic resilience', `${fmtNum(model.guestsDay)} guests a day spread across three shifts; no single daypart exceeds ${(Math.max(...model.shifts.map((s) => s.share)) * 100).toFixed(0)}% of revenue.`],
    ['Multi-daypart capture', 'Commuter coffee, office lunch and evening rijsttafel turn one lease into three businesses.'],
    ['Healthy margin floor', `Even at the ${state.fin.marginFood}% kitchen margin the unit earns ${fmtEur(model.profitYearLow)} in Year 1.`],
    ['Farm-direct supply moat', 'Sumatra and Java smallholder relationships secure lots competitors cannot simply order.'],
    ['Compounding upside', `At ${state.fin.growth}% annual growth, Year 3 reaches ${fmtEur(model.years[2].revenue)} gross revenue.`],
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Eyebrow t={t}>The Case · {a}</Eyebrow>
      <Title t={t}>{head}</Title>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 18 }}>
        {items.map(([k, v], i) => (
          <div key={k} style={card(t, { padding: '14px 16px', minHeight: 112 })}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: t.accent, fontWeight: 700 }}>{String(i + 1).padStart(2, '0')}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.ink, marginTop: 4 }}>{k}</div>
            <div style={{ fontSize: 12, color: t.muted, marginTop: 5, lineHeight: 1.5 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
