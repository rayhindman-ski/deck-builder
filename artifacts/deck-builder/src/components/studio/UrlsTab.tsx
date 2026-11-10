import { useState } from 'react';
import { Globe, Loader2, Plus, RefreshCw, Trash2, ArrowDownToLine, Info } from 'lucide-react';
import { useInspectBrandSource } from '@workspace/api-client-react';
import { useStore } from '@/lib/store';
import { uid } from '@/lib/defaults';
import { errorMessage } from '@/lib/export-pdf';
import type { UrlEntry, UrlRole } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Panel } from './parts';

const ROLES: UrlRole[] = ['Primary Brand', 'Specialty Roastery', 'Wholesale', 'Menu & Catering'];

function StatusPill({ u, loading }: { u: UrlEntry; loading: boolean }) {
  if (loading) return <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-mono text-[10.5px]"><Loader2 className="h-3 w-3 animate-spin" />checking</span>;
  if (u.error) return <span data-testid={`status-url-${u.id}`} className="rounded-full bg-destructive/10 px-2 py-0.5 font-mono text-[10.5px] text-destructive">failed</span>;
  if (u.status == null) return <span data-testid={`status-url-${u.id}`} className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10.5px] text-muted-foreground">not checked</span>;
  const ok = u.status >= 200 && u.status < 400;
  return <span data-testid={`status-url-${u.id}`} className={`rounded-full px-2 py-0.5 font-mono text-[10.5px] ${ok ? 'bg-primary/10 text-primary' : 'bg-[hsl(var(--chart-2))]/15 text-[hsl(var(--chart-2))]'}`}>HTTP {u.status}</span>;
}

export function UrlsTab() {
  const { state, update } = useStore();
  const inspect = useInspectBrandSource();
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const edit = (id: string, v: Partial<UrlEntry>) => update((s) => ({ ...s, urls: s.urls.map((u) => (u.id === id ? { ...u, ...v } : u)) }));
  const remove = (id: string) => update((s) => ({ ...s, urls: s.urls.filter((u) => u.id !== id) }));
  const add = () => {
    let url = draft.trim();
    if (!url) return;
    if (!/^https?:\/\//.test(url)) url = `https://${url}`;
    update((s) => ({ ...s, urls: [...s.urls, { id: uid(), url, role: 'Wholesale', status: null, title: '', summary: '', notes: '', checkedAt: null, error: null }] }));
    setDraft('');
  };
  const check = async (u: UrlEntry) => {
    setBusy((b) => ({ ...b, [u.id]: true }));
    try {
      const r = await inspect.mutateAsync({ data: { url: u.url } });
      edit(u.id, { status: r.status, title: r.title, summary: r.summary, checkedAt: new Date().toISOString(), error: null });
    } catch (e) {
      edit(u.id, { error: errorMessage(e), checkedAt: new Date().toISOString() });
    } finally {
      setBusy((b) => ({ ...b, [u.id]: false }));
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Panel kicker="Brand sources" title="Website URLs" aside={<span className="font-mono text-xs text-muted-foreground">{state.urls.length} sources</span>}>
        <form className="mb-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); add(); }}>
          <Input data-testid="input-new-url" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="www.rayanaroast.com" />
          <Button data-testid="button-add-url" type="submit" disabled={!draft.trim()}><Plus className="mr-1 h-4 w-4" />Add</Button>
        </form>
        {state.urls.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Globe className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No sources yet. Slide 3 will show only the philosophy and visuals until you add one.</p>
          </div>
        )}
        <div className="space-y-3">
          {state.urls.map((u) => (
            <div key={u.id} data-testid={`card-url-${u.id}`} className="rounded-lg border bg-background p-4 rise">
              <div className="flex flex-wrap items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <Input data-testid={`input-url-${u.id}`} value={u.url} onChange={(e) => edit(u.id, { url: e.target.value, status: null, error: null })} className="h-8 min-w-[200px] flex-1 font-mono text-xs" />
                <Select value={u.role} onValueChange={(v) => edit(u.id, { role: v as UrlRole })}>
                  <SelectTrigger data-testid={`select-role-${u.id}`} className="h-8 w-[170px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
                <StatusPill u={u} loading={!!busy[u.id]} />
                <Button data-testid={`button-check-url-${u.id}`} size="sm" variant="outline" className="h-8" onClick={() => check(u)} disabled={!!busy[u.id]}>
                  <RefreshCw className="mr-1 h-3.5 w-3.5" />Inspect
                </Button>
                <Button data-testid={`button-delete-url-${u.id}`} size="icon" variant="ghost" className="h-8 w-8" onClick={() => remove(u.id)} aria-label="Remove source"><Trash2 className="h-4 w-4" /></Button>
              </div>
              {u.error && <p className="mt-2 text-xs text-destructive">{u.error}. Manual notes below still feed slide 3.</p>}
              {(u.title || u.summary) && !u.error && (
                <div className="mt-3 rounded-md bg-muted/60 p-3 text-xs">
                  <div className="font-semibold">{u.title}</div>
                  <p className="mt-1 leading-relaxed text-muted-foreground">{u.summary}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-muted-foreground">read {u.checkedAt ? new Date(u.checkedAt).toLocaleString() : ''}</span>
                    <Button data-testid={`button-use-summary-${u.id}`} size="sm" variant="ghost" className="h-7 text-xs" onClick={() => edit(u.id, { notes: u.summary })}>
                      <ArrowDownToLine className="mr-1 h-3 w-3" />Use as notes
                    </Button>
                  </div>
                </div>
              )}
              <Textarea data-testid={`input-notes-${u.id}`} rows={2} value={u.notes} onChange={(e) => edit(u.id, { notes: e.target.value })} placeholder="Summary notes shown on the Brand & Sources slide" className="mt-3 text-sm" />
            </div>
          ))}
        </div>
      </Panel>
      <aside className="h-fit rounded-xl border border-dashed bg-accent/40 p-5 text-sm leading-relaxed">
        <div className="flex items-center gap-2 font-semibold"><Info className="h-4 w-4" />What Inspect actually does</div>
        <ul className="mt-3 list-disc space-y-1.5 pl-4 text-foreground/80">
          <li>The server fetches the single public page over HTTPS and reads its HTTP status, title and description.</li>
          <li>Only rayanacoffees.com and rayanaroast.com (with or without www) are supported. Other URLs return an error but keep your manual notes.</li>
          <li>It does not crawl, download images, or rewrite slides. You choose what goes in by editing notes or pressing Use as notes.</li>
          <li>The first three sources, their roles and notes appear on slide 3.</li>
        </ul>
      </aside>
    </div>
  );
}
