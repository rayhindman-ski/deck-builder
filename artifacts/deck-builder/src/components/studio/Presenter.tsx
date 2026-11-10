import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Slide } from '@/components/deck/Slide';
import { SLIDE_H, SLIDE_W, SLIDE_COUNT } from '@/components/deck/constants';
import { useState } from 'react';

export function Presenter({ onClose }: { onClose: () => void }) {
  const { state, model, slide, setSlide } = useStore();
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const el = ref.current;
    el?.requestFullscreen?.().catch(() => undefined);
    const fit = () => setScale(Math.min(window.innerWidth / SLIDE_W, (window.innerHeight - 8) / SLIDE_H));
    fit();
    const onFs = () => { if (!document.fullscreenElement) closeRef.current(); };
    window.addEventListener('resize', fit);
    document.addEventListener('fullscreenchange', onFs);
    return () => {
      window.removeEventListener('resize', fit);
      document.removeEventListener('fullscreenchange', onFs);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); setSlide(slide + 1); }
      else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); setSlide(slide - 1); }
      else if (e.key === 'Home') setSlide(0);
      else if (e.key === 'End') setSlide(SLIDE_COUNT - 1);
      else if (e.key === 'Escape') closeRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slide, setSlide]);

  return (
    <div ref={ref} data-testid="presenter" className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1b110d]">
      <div key={slide} className="rise" style={{ width: SLIDE_W * scale, height: SLIDE_H * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <Slide index={slide} state={state} model={model} interactive onJump={setSlide} />
        </div>
      </div>
      <div className="group absolute inset-x-0 bottom-0 flex h-24 items-end justify-center pb-5">
        <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-[#F4EBDB] opacity-0 transition-opacity group-hover:opacity-100">
          <button data-testid="button-present-prev" onClick={() => setSlide(slide - 1)} className="rounded-full p-1.5 hover:bg-white/10" aria-label="Previous"><ChevronLeft className="h-4 w-4" /></button>
          <span className="tnum font-mono text-xs">{slide + 1} / {SLIDE_COUNT}</span>
          <button data-testid="button-present-next" onClick={() => setSlide(slide + 1)} className="rounded-full p-1.5 hover:bg-white/10" aria-label="Next"><ChevronRight className="h-4 w-4" /></button>
          <span className="mx-1 h-4 w-px bg-white/20" />
          <button data-testid="button-present-exit" onClick={onClose} className="flex items-center gap-1 rounded-full px-2 py-1 text-xs hover:bg-white/10"><X className="h-3.5 w-3.5" />Esc</button>
        </div>
      </div>
    </div>
  );
}
