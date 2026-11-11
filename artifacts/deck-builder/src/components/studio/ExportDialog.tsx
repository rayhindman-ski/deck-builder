import { Archive, Download, FileDown, Loader2, Printer, AlertTriangle, RotateCw } from 'lucide-react';
import { useListDeckExports } from '@workspace/api-client-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { ExportMode, useDeckSaver } from '@/lib/use-deck-saver';
import { errorMessage } from '@/lib/export-pdf';

const fmtBytes = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(2)} MB` : `${Math.round(b / 1024)} KB`);

export function ExportDialog({ open, onOpenChange, saver }: { open: boolean; onOpenChange: (o: boolean) => void; saver: ReturnType<typeof useDeckSaver> }) {
  const list = useListDeckExports({ query: { enabled: open, retry: 1, refetchOnMount: 'always' } });
  const versions = [...(list.data ?? [])].sort((a, b) => b.version - a.version);
  const next = (versions[0]?.version ?? 0) + 1;

  const options: { mode: ExportMode; icon: typeof Download; title: string; body: string }[] = [
    { mode: 'download', icon: FileDown, title: 'Local PDF download', body: 'Renders all 10 slides, archives the next version in the project, then downloads that exact file.' },
    { mode: 'project', icon: Archive, title: 'Save in project', body: 'Renders and archives to doc/decks only. Nothing is downloaded.' },
    { mode: 'print', icon: Printer, title: 'Native print', body: 'Archives a version first, then opens the browser print dialog titled with that version. Choose Save as PDF there; the browser decides the final filename and folder, and we cannot detect whether you completed or cancelled.' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Save & export</DialogTitle>
          <DialogDescription>
            Every action archives a real PDF as <span className="font-mono">replit-example-deck-vNN.pdf</span>. Versions are allocated server-side from the highest file already in doc/decks, so numbers keep climbing across refreshes and never overwrite. {list.isSuccess ? <>Next expected: <b className="font-mono">v{String(next).padStart(2, '0')}</b>.</> : 'The next version will be confirmed when the archive connects.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2.5">
          {options.map(({ mode, icon: Icon, title, body }) => (
            <button key={mode} data-testid={`button-export-${mode}`} disabled={!!saver.busy} onClick={() => saver.run(mode)}
              className="group flex items-start gap-3 rounded-xl border bg-background p-4 text-left transition-all hover:border-primary/60 hover:shadow-sm disabled:opacity-60">
              <span className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary transition-transform group-hover:scale-110">
                {saver.busy === mode ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
              </span>
              <span className="flex-1">
                <span className="block font-semibold">{title}</span>
                <span className="block text-xs leading-relaxed text-muted-foreground">{saver.busy === mode ? saver.progress : body}</span>
              </span>
            </button>
          ))}
        </div>

        {saver.error && (
          <div data-testid="text-export-error" className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="flex-1">{saver.error}</span>
            <button className="text-xs underline" onClick={saver.clearError} data-testid="button-dismiss-error">Dismiss</button>
          </div>
        )}
        {saver.last && !saver.busy && (
          <div data-testid="text-export-last" className="rounded-lg bg-primary/10 p-3 text-sm text-primary">
            Archived <b className="font-mono">{saver.last.filename}</b> at {saver.last.path}
          </div>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Version history</h4>
            <Button size="sm" variant="ghost" className="h-7" onClick={() => list.refetch()} data-testid="button-refresh-versions"><RotateCw className="h-3.5 w-3.5" /></Button>
          </div>
          <div className="max-h-56 overflow-y-auto rounded-lg border">
            {list.isLoading && <div className="space-y-2 p-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-8" />)}</div>}
            {list.isError && (
              <div className="flex items-center justify-between gap-3 p-3 text-sm text-destructive"><span>Could not load history: {errorMessage(list.error)}</span><Button size="sm" variant="outline" onClick={() => list.refetch()}>Retry</Button></div>
            )}
            {!list.isLoading && !list.isError && versions.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No archived versions yet. Your first export becomes v01.</div>}
            {versions.map((v) => (
              <div key={v.filename} data-testid={`row-version-${v.version}`} className="flex items-center gap-3 border-b px-3 py-2 last:border-0">
                <span className="rounded bg-[hsl(var(--chart-2))]/15 px-1.5 py-0.5 font-mono text-xs font-semibold text-[hsl(var(--chart-2))]">v{String(v.version).padStart(2, '0')}</span>
                <span className="flex-1 truncate font-mono text-xs">{v.filename}</span>
                <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">{fmtBytes(v.bytes)} · {new Date(v.createdAt).toLocaleString()}</span>
                <a href={v.downloadUrl} download={v.filename} data-testid={`link-download-${v.version}`} className="rounded p-1.5 text-primary hover:bg-primary/10" aria-label={`Download ${v.filename}`}><Download className="h-4 w-4" /></a>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
