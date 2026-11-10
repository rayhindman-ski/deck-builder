import { useEffect, useMemo } from 'react';
import { ScaledA4 } from '@/components/deck/ScaledA4';
import { Slide } from '@/components/deck/Slide';
import { SLIDE_COUNT } from '@/components/deck/constants';
import { compute } from '@/lib/financial';
import { useLiveDeck } from '@/lib/live-preview';

export function LivePreview() {
  const { state, connected, supported } = useLiveDeck();
  const model = useMemo(() => compute(state.fin), [state.fin]);

  useEffect(() => {
    const previous = document.title;
    document.title = 'Live preview · Deck Builder';
    return () => { document.title = previous; };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-card px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl">Live preview</h1>
            <p className="mt-1 text-xs text-muted-foreground">Rayana’s Bistro · Edit prompts and settings in your studio tab. Changes appear here automatically.</p>
          </div>
          <p role="status" data-testid="preview-status" className="text-xs text-muted-foreground">
            {connected ? 'Live · connected to editor' : supported ? 'Editor not connected · showing last available deck' : 'Live connection unavailable · showing browser-saved changes'}
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-8">
        {Array.from({ length: SLIDE_COUNT }, (_, index) => (
          <section key={index} aria-label={`Slide ${index + 1}`} data-testid={`live-slide-${index + 1}`}>
            <p className="mb-2 font-mono text-xs text-muted-foreground">{index + 1} / {SLIDE_COUNT}</p>
            <div className="overflow-hidden rounded-lg slide-shadow">
              <ScaledA4><Slide index={index} state={state} model={model} /></ScaledA4>
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
