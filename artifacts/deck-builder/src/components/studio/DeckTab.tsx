import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useStore } from '@/lib/store';
import { SECTION_TITLES } from '@/lib/defaults';
import { Slide } from '@/components/deck/Slide';
import { ScaledA4 } from '@/components/deck/ScaledA4';
import { SLIDE_COUNT, slideLabel } from '@/components/deck/constants';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ShiftAssumptions } from './ShiftAssumptions';

export function DeckTab() {
  const { state, model, slide, setSlide, patch } = useStore();
  const [scenario, setScenario] = useState(false);
  const strip = useRef<HTMLDivElement>(null);
  const scenarioCapable = slide >= 5 && slide <= 8;

  useEffect(() => {
    strip.current?.querySelector<HTMLElement>(`[data-idx="${slide}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [slide]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.key === 'ArrowRight') setSlide(slide + 1);
      if (e.key === 'ArrowLeft') setSlide(slide - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slide, setSlide]);

  return (
    <div className="space-y-4">
      <div ref={strip} className="flex gap-3 overflow-x-auto pb-2">
        {Array.from({ length: SLIDE_COUNT }, (_, i) => (
          <button key={i} data-idx={i} data-testid={`thumb-slide-${i + 1}`} onClick={() => setSlide(i)} className="w-40 shrink-0 text-left">
            <div className={`overflow-hidden rounded transition-all ${slide === i ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'opacity-70 hover:opacity-100'}`}>
              <ScaledA4><Slide index={i} state={state} model={model} /></ScaledA4>
            </div>
            <div className="mt-1 truncate font-mono text-[10.5px] text-muted-foreground"><b className="text-foreground">{i + 1}</b> · {slideLabel(i, state.toc, SECTION_TITLES)}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button data-testid="button-prev-slide" size="icon" variant="outline" onClick={() => setSlide(slide - 1)} disabled={slide === 0} aria-label="Previous slide"><ChevronLeft className="h-4 w-4" /></Button>
          <span className="tnum min-w-[72px] text-center font-mono text-sm" data-testid="text-slide-pos">{slide + 1} / {SLIDE_COUNT}</span>
          <Button data-testid="button-next-slide" size="icon" variant="outline" onClick={() => setSlide(slide + 1)} disabled={slide === SLIDE_COUNT - 1} aria-label="Next slide"><ChevronRight className="h-4 w-4" /></Button>
          <span className="ml-2 font-display text-lg">{slideLabel(slide, state.toc, SECTION_TITLES)}</span>
        </div>
        <label className={`flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs ${scenarioCapable ? '' : 'opacity-50'}`}>
          <SlidersHorizontal className="h-3.5 w-3.5" /> In-slide what-if sliders
          <Switch data-testid="switch-scenario" checked={scenario} onCheckedChange={setScenario} disabled={!scenarioCapable} />
        </label>
      </div>

      {slide === 5 && <ShiftAssumptions />}
      <div className="rounded-xl bg-[hsl(var(--muted))] p-3 sm:p-6">
        <div key={slide} className="overflow-hidden rounded-md slide-shadow rise">
          <ScaledA4>
            <Slide index={slide} state={state} model={model} interactive scenario={scenario} onJump={setSlide} onFin={(f) => patch('fin', f)} />
          </ScaledA4>
        </div>
      </div>
      <p className="text-center font-mono text-[11px] text-muted-foreground">Arrow keys move between slides · TOC rows on slide 2 jump directly · what-if sliders never appear in exports</p>
    </div>
  );
}
