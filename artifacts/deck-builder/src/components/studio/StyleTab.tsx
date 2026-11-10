import { useMemo, useState } from 'react';
import { Check, Wand2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { FONTS, LOGO_SIZES, THEMES, coverBgOf } from '@/lib/themes';
import { parseStylePrompt, SUGGESTIONS } from '@/lib/style-parser';
import type { FontId, LogoSize, Numbering, ThemeId } from '@/lib/types';
import { Slide } from '@/components/deck/Slide';
import { ScaledA4 } from '@/components/deck/ScaledA4';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Chip, FieldLabel, Panel } from './parts';

export function StyleTab() {
  const { state, model, patch, setSlide, setTab } = useStore();
  const s = state.style;
  const set = (v: Partial<typeof s>) => patch('style', v);
  const [prompt, setPrompt] = useState('');
  const parsed = useMemo(() => parseStylePrompt(prompt), [prompt]);
  const logoAssets = state.assets.filter((a) => a.tag === 'Logo' && !a.builtin && a.mime.startsWith('image/'));

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="space-y-5">
        <Panel kicker="Palette" title="Curated themes">
          <div className="grid grid-cols-2 gap-2.5">
            {(Object.keys(THEMES) as ThemeId[]).map((id) => {
              const t = THEMES[id];
              const on = s.theme === id;
              return (
                <button key={id} data-testid={`button-theme-${id}`} onClick={() => set({ theme: id })}
                  className={`group relative overflow-hidden rounded-lg border p-3 text-left transition-all hover:-translate-y-0.5 ${on ? 'border-primary ring-2 ring-primary/30' : ''}`}
                  style={{ background: t.bg }}>
                  <div className="flex gap-1">
                    {[t.coverBg, t.accent, t.second, t.ink].map((c, i) => <span key={i} className="h-5 w-5 rounded-full border border-black/10" style={{ background: c }} />)}
                  </div>
                  <div className="mt-2 text-sm font-semibold" style={{ color: t.ink }}>{t.label}</div>
                  <div className="font-mono text-[10px]" style={{ color: t.muted }}>{t.note}</div>
                  {on && <Check className="absolute right-2 top-2 h-4 w-4" style={{ color: t.accent }} />}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <FieldLabel>Cover background</FieldLabel>
            <input data-testid="input-cover-bg" type="color" value={coverBgOf(s)} onChange={(e) => set({ coverBg: e.target.value.toUpperCase() })} className="h-8 w-10 cursor-pointer rounded border bg-transparent" />
            <span className="font-mono text-xs text-muted-foreground">{coverBgOf(s)}</span>
            {s.coverBg && <Button size="sm" variant="ghost" data-testid="button-cover-bg-reset" onClick={() => set({ coverBg: null })}>Use theme default</Button>}
          </div>
        </Panel>

        <Panel kicker="Logo system" title="Cover emblem">
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'builtin:rayana-dark', label: 'Dark emblem', dark: false },
              { id: 'builtin:rayana-light', label: 'Light emblem', dark: true },
              { id: 'none', label: 'No emblem', dark: false },
            ].map((o) => (
              <button key={o.id} data-testid={`button-logo-${o.id.replace('builtin:', '')}`} onClick={() => set({ logo: o.id })}
                className={`flex h-24 flex-col items-center justify-center gap-1 rounded-lg border p-2 transition-all ${s.logo === o.id ? 'border-primary ring-2 ring-primary/30' : 'hover:border-primary/40'}`}
                style={{ background: o.dark ? '#3E1F1A' : '#F4EBDB' }}>
                {o.id !== 'none' ? (
                  <img src={state.assets[0].src} alt="" className="h-12 w-auto" style={{ filter: o.dark ? 'invert(1) sepia(0.35)' : 'none', mixBlendMode: o.dark ? 'screen' : 'multiply' }} />
                ) : (
                  <span className="font-display text-sm text-[#3E1F1A]">Title only</span>
                )}
                <span className={`text-[11px] font-medium ${o.dark ? 'text-[#F4EBDB]' : 'text-[#3E1F1A]'}`}>{o.label}</span>
              </button>
            ))}
          </div>
          {logoAssets.length > 0 && (
            <div className="mt-3">
              <FieldLabel>Or use an uploaded logo</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {logoAssets.map((a) => (
                  <Chip key={a.id} testId={`chip-logo-${a.id}`} active={s.logo === `asset:${a.id}`} onClick={() => set({ logo: `asset:${a.id}` })}>{a.name}</Chip>
                ))}
              </div>
            </div>
          )}
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Both treatments use the supplied raster emblem: dark multiplies onto light grounds, light is an inverted screen for dark covers. When an emblem is active the hero title is suppressed.
          </p>
          <div className="mt-4">
            <FieldLabel hint={`${LOGO_SIZES[s.logoSize].px}px`}>Emblem size</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(LOGO_SIZES) as LogoSize[]).map((k) => (
                <Chip key={k} testId={`chip-logo-size-${k}`} active={s.logoSize === k} onClick={() => set({ logoSize: k })}>
                  {LOGO_SIZES[k].label} · {LOGO_SIZES[k].px}
                </Chip>
              ))}
            </div>
          </div>
        </Panel>

        <Panel kicker="Typography & chrome" title="Type, header and footer">
          <FieldLabel>Slide typeface</FieldLabel>
          <Select value={s.font} onValueChange={(v) => set({ font: v as FontId })}>
            <SelectTrigger data-testid="select-font"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(FONTS) as FontId[]).map((f) => (
                <SelectItem key={f} value={f}><span style={{ fontFamily: FONTS[f].family }}>{FONTS[f].label}</span></SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Brand title</FieldLabel>
              <Input data-testid="input-brand-title" value={s.brandTitle} onChange={(e) => set({ brandTitle: e.target.value })} />
            </div>
            <div>
              <FieldLabel>Numbering</FieldLabel>
              <Select value={s.numbering} onValueChange={(v) => set({ numbering: v as Numbering })}>
                <SelectTrigger data-testid="select-numbering"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="slide-x-of-y">Slide X of Y</SelectItem>
                  <SelectItem value="x-slash-y">X / Y</SelectItem>
                  <SelectItem value="none">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Footer descriptor</FieldLabel>
              <Input data-testid="input-footer" value={s.footerText} onChange={(e) => set({ footerText: e.target.value })} />
            </div>
            <label className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm">
              Header mini logo <Switch data-testid="switch-mini-logo" checked={s.showMiniLogo} onCheckedChange={(v) => set({ showMiniLogo: v })} />
            </label>
            <label className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm">
              Section metadata <Switch data-testid="switch-section" checked={s.showSection} onCheckedChange={(v) => set({ showSection: v })} />
            </label>
          </div>
        </Panel>

        <Panel kicker="Natural language" title="Style prompt" aside={<Wand2 className="h-4 w-4 text-[hsl(var(--chart-2))]" />}>
          <Textarea data-testid="input-style-prompt" rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={'theme: gold\ncover logo size: xl'} className="font-mono text-sm" />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((sug) => (
              <Chip key={sug} testId={`chip-suggest-${sug}`} onClick={() => setPrompt((p) => (p.trim() ? `${p.trim()}\n${sug}` : sug))}>{sug}</Chip>
            ))}
          </div>
          {prompt.trim() && (
            <div className="mt-3 rounded-lg border bg-background p-3 text-xs">
              {parsed.applied.map((a) => <div key={a} className="text-primary">+ {a}</div>)}
              {parsed.unknown.map((u) => <div key={u} className="text-destructive">? Not understood: {u}</div>)}
            </div>
          )}
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="ghost" size="sm" data-testid="button-clear-style-prompt" onClick={() => setPrompt('')} disabled={!prompt}>Clear</Button>
            <Button size="sm" data-testid="button-apply-style-prompt" disabled={!parsed.applied.length} onClick={() => { set(parsed.patch); setPrompt(''); }}>
              Apply {parsed.applied.length || ''} change{parsed.applied.length === 1 ? '' : 's'}
            </Button>
          </div>
        </Panel>
      </div>

      <div className="space-y-4 xl:sticky xl:top-[132px] xl:self-start">
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-lg font-semibold">Live A4 previews</h3>
          <span className="font-mono text-[11px] text-muted-foreground">297 : 210 · {THEMES[s.theme].label}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          {[0, 1].map((i) => (
            <button key={i} data-testid={`preview-mini-${i + 1}`} onClick={() => { setSlide(i); setTab('deck'); }} className="group text-left">
              <div className="overflow-hidden rounded-md slide-shadow transition-transform group-hover:-translate-y-1">
                <ScaledA4><Slide index={i} state={state} model={model} /></ScaledA4>
              </div>
              <div className="mt-1.5 font-mono text-[10.5px] text-muted-foreground">{i === 0 ? 'Cover slide' : 'Inner TOC slide'} · open in deck</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
