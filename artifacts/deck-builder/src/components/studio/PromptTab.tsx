import { useStore } from '@/lib/store';
import { AUDIENCES, PRESETS, SECTION_TITLES } from '@/lib/defaults';
import type { Audience } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Chip, FieldLabel, Panel } from './parts';

export function PromptTab() {
  const { state, patch, update } = useStore();
  const i = state.intake;
  const set = (v: Partial<typeof i>) => patch('intake', v);
  const activePreset = PRESETS.find((p) => p.intake.prompt === i.prompt)?.id;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <Panel kicker="Intake" title="Presentation brief">
        <div className="mb-5">
          <FieldLabel>Quick-apply presets</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => <Chip key={p.id} testId={`chip-preset-${p.id}`} active={activePreset === p.id} onClick={() => set(p.intake)}>{p.label}</Chip>)}
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <FieldLabel hint="TOC and cover when no emblem">Presentation title</FieldLabel>
            <Input data-testid="input-title" value={i.title} onChange={(e) => set({ title: e.target.value })} className="font-display text-base" />
          </div>
          <div>
            <FieldLabel hint="cover, one line">Subtitle</FieldLabel>
            <Input data-testid="input-subtitle" value={i.subtitle} onChange={(e) => set({ subtitle: e.target.value })} />
          </div>
          <div>
            <FieldLabel>Target audience</FieldLabel>
            <div className="grid gap-2 sm:grid-cols-3">
              {AUDIENCES.map((a) => (
                <button key={a} data-testid={`button-audience-${a.split(' ')[0].toLowerCase()}`} onClick={() => set({ audience: a as Audience })}
                  className={`rounded-lg border p-3 text-left text-sm transition-all ${i.audience === a ? 'border-primary bg-primary/5 font-semibold text-primary' : 'bg-background hover:border-primary/40'}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel hint={`${i.prompt.length} chars · slide 9 mandate`}>Strategic pitch prompt</FieldLabel>
            <Textarea data-testid="input-prompt" rows={7} value={i.prompt} onChange={(e) => set({ prompt: e.target.value })} className="leading-relaxed" />
          </div>
        </div>
      </Panel>
      <Panel kicker="Narrative" title="Chapter titles">
        <p className="mb-3 text-xs text-muted-foreground">These drive the table of contents and the header section labels.</p>
        <div className="space-y-2">
          {state.toc.map((t, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-7 font-mono text-xs text-[hsl(var(--chart-2))]">{String(idx + 1).padStart(2, '0')}.</span>
              <Input data-testid={`input-toc-${idx}`} value={t} placeholder={SECTION_TITLES[idx + 2]}
                onChange={(e) => update((s) => ({ ...s, toc: s.toc.map((x, j) => (j === idx ? e.target.value.replace(/\|/g, '') : x)) }))} className="h-8" />
              <span className="w-6 text-right font-mono text-xs text-muted-foreground">{idx + 3}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
