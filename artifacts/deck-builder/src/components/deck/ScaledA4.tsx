import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { SLIDE_H, SLIDE_W } from './constants';

/** Fits a native 1123×794 slide into whatever width the parent offers, preserving 297:210. */
export function ScaledA4({ children, className = '', maxHeight }: { children: ReactNode; className?: string; maxHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      let s = el.clientWidth / SLIDE_W;
      if (maxHeight) s = Math.min(s, maxHeight / SLIDE_H);
      setScale(s > 0 ? s : 0.3);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxHeight]);
  return (
    <div ref={ref} className={`w-full ${className}`}>
      <div className="relative mx-auto overflow-hidden" style={{ width: SLIDE_W * scale, height: SLIDE_H * scale }}>
        <div style={{ width: SLIDE_W, height: SLIDE_H, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', left: 0, top: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
