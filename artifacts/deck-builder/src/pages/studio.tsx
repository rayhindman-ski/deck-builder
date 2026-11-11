import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, ExternalLink } from 'lucide-react';
import { useStore } from '@/lib/store';
import { usePublishDeck } from '@/lib/live-preview';
import { useDeckSaver } from '@/lib/use-deck-saver';
import { Button } from '@/components/ui/button';
import { StyleTab } from '@/components/studio/StyleTab';
import { UrlsTab } from '@/components/studio/UrlsTab';
import { FilesTab } from '@/components/studio/FilesTab';
import { PromptTab } from '@/components/studio/PromptTab';
import { ModelTab } from '@/components/studio/ModelTab';
import { DeckTab } from '@/components/studio/DeckTab';
import { ExportDialog } from '@/components/studio/ExportDialog';
import { Slide } from '@/components/deck/Slide';
import { SLIDE_COUNT } from '@/components/deck/constants';

const tabs = [
  { id: 'style', label: 'Style', component: StyleTab },
  { id: 'urls', label: 'Website context', component: UrlsTab },
  { id: 'files', label: 'Files', component: FilesTab },
  { id: 'prompt', label: 'Pitch intake', component: PromptTab },
  { id: 'model', label: 'Financial model', component: ModelTab },
  { id: 'deck', label: 'Deck preview', component: DeckTab },
];

export function Studio() {
  const { state, model, tab, setTab, tier, savedAt } = useStore();
  const [exportOpen, setExportOpen] = useState(false);
  const openLivePreview = usePublishDeck(state);
  const [previewBlocked, setPreviewBlocked] = useState(false);
  const saver = useDeckSaver();
  const active = tabs.find((item) => item.id === tab) ?? tabs[0];
  const Content = active.component;

  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b bg-card">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Rayana’s Bistro · Presentation studio</p>
              <h1 className="mt-1 font-display text-3xl font-semibold">Deck Builder</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" data-testid="button-live-preview" onClick={() => setPreviewBlocked(!openLivePreview())}>
                <ExternalLink className="h-4 w-4" />Live preview
              </Button>
              <Button data-testid="button-save-export" onClick={() => setExportOpen(true)}><Download className="h-4 w-4" />Save & export</Button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-8">
          {previewBlocked && <p role="alert" className="mb-4 text-sm text-destructive">Your browser blocked the preview tab. Allow pop-ups for this site, then click Live preview again.</p>}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Shape the brand, plan the numbers, and build your ten-slide investor deck.</p>
            <span role="status" className="font-mono text-[11px] text-muted-foreground">
              {tier === 'memory' ? 'Not saved · browser storage unavailable' : savedAt ? 'Saved in this browser' : 'Saving…'}
            </span>
          </div>
          <nav aria-label="Studio sections" className="mb-6 flex gap-1 overflow-x-auto rounded-xl border bg-card p-1.5">
            {tabs.map((item) => (
              <button key={item.id} data-testid={`tab-${item.id}`} aria-current={tab === item.id ? 'page' : undefined}
                onClick={() => setTab(item.id)}
                className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${tab === item.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                {item.label}
              </button>
            ))}
          </nav>
          <section aria-label={active.label}><Content /></section>
          <footer className="mt-8 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
            A4 landscape · 10 slides · Edits and uploaded assets stay in this browser.
            Project PDF history is not durable shared storage in production; download important PDFs to keep a copy.
          </footer>
        </main>
        <ExportDialog open={exportOpen} onOpenChange={setExportOpen} saver={saver} />
      </div>
      {createPortal(
        <div className="print-deck" aria-hidden="true">
          {Array.from({ length: SLIDE_COUNT }, (_, index) => (
            <div key={index} className="print-page" data-export-slide><Slide index={index} state={state} model={model} /></div>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
}
