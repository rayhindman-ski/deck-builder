import type { ReactNode } from 'react';
import { Slider } from '@/components/ui/slider';

export function Panel({ title, kicker, children, aside, className = '' }: { title: string; kicker?: string; children: ReactNode; aside?: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border bg-card p-5 rise ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          {kicker && <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--chart-2))]">{kicker}</div>}
          <h3 className="font-display text-lg font-semibold leading-tight">{title}</h3>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function FieldLabel({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <span className="text-xs font-semibold text-foreground/80">{children}</span>
      {hint && <span className="font-mono text-[10.5px] text-muted-foreground">{hint}</span>}
    </div>
  );
}

export function NumberSlider({
  label, value, min, max, step = 1, onChange, prefix = '', suffix = '', testId,
}: { label: string; value: number; min: number; max: number; step?: number; onChange: (n: number) => void; prefix?: string; suffix?: string; testId: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-foreground/80">{label}</span>
        <div className="flex items-center rounded-md border bg-background px-2 focus-within:ring-2 focus-within:ring-ring/40">
          {prefix && <span className="font-mono text-xs text-muted-foreground">{prefix}</span>}
          <input
            data-testid={`input-${testId}`}
            type="number"
            className="tnum w-16 bg-transparent py-1 text-right font-mono text-sm outline-none"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, n)));
            }}
          />
          {suffix && <span className="font-mono text-xs text-muted-foreground">{suffix}</span>}
        </div>
      </div>
      <Slider data-testid={`slider-${testId}`} value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} />
    </div>
  );
}

export function Chip({ active, onClick, children, testId }: { active?: boolean; onClick: () => void; children: ReactNode; testId?: string }) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-all active:scale-95 ${
        active ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:border-primary/50 hover:text-primary'
      }`}
    >
      {children}
    </button>
  );
}
