import { useRef, useState } from 'react';
import { FileText, ImagePlus, Trash2, UploadCloud } from 'lucide-react';
import { useStore } from '@/lib/store';
import { uid } from '@/lib/defaults';
import { useToast } from '@/hooks/use-toast';
import type { Asset, AssetTag } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Panel } from './parts';

const TAGS: AssetTag[] = ['Logo', 'Visual Asset', 'Context Doc', 'Menu Spec'];
const MAX = 3 * 1024 * 1024;
const fmtBytes = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

const readFile = (f: File) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => rej(r.error); r.readAsDataURL(f); });

export function FilesTab() {
  const { state, update, tier } = useStore();
  const { toast } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [filter, setFilter] = useState<AssetTag | 'All'>('All');

  const ingest = async (files: FileList | null) => {
    if (!files) return;
    const added: Asset[] = [];
    for (const f of Array.from(files)) {
      if (f.size > MAX) { toast({ title: `${f.name} skipped`, description: 'Files over 3 MB would overflow browser storage.', variant: 'destructive' }); continue; }
      const src = await readFile(f);
      added.push({ id: uid(), name: f.name, mime: f.type || 'application/octet-stream', bytes: f.size, src, tag: f.type.startsWith('image/') ? 'Visual Asset' : 'Context Doc' });
    }
    if (added.length) {
      update((s) => ({ ...s, assets: [...s.assets, ...added] }));
      toast({ title: `${added.length} file${added.length > 1 ? 's' : ''} added`, description: 'Stored as Base64 with your deck state.' });
    }
  };
  const edit = (id: string, v: Partial<Asset>) => update((s) => ({ ...s, assets: s.assets.map((a) => (a.id === id ? { ...a, ...v } : a)) }));
  const remove = (id: string) => update((s) => ({ ...s, assets: s.assets.filter((a) => a.id !== id), style: s.style.logo === `asset:${id}` ? { ...s.style, logo: 'builtin:rayana-dark' } : s.style }));
  const list = state.assets.filter((a) => filter === 'All' || a.tag === filter);
  const used = state.assets.filter((a) => !a.builtin).reduce((n, a) => n + a.src.length, 0);

  return (
    <div className="space-y-5">
      <div
        data-testid="dropzone-files"
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); ingest(e.dataTransfer.files); }}
        onClick={() => input.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-all ${over ? 'scale-[1.01] border-primary bg-primary/5' : 'bg-card hover:border-primary/50'}`}
      >
        <UploadCloud className={`h-8 w-8 transition-transform ${over ? '-translate-y-1 text-primary' : 'text-muted-foreground'}`} />
        <p className="mt-3 font-display text-lg">Drop images, menus or brand docs</p>
        <p className="mt-1 text-xs text-muted-foreground">Encoded to Base64 in the browser · 3 MB per file · {fmtBytes(used * 0.75)} stored · persisting to {tier}</p>
        <input ref={input} data-testid="input-file-upload" type="file" multiple hidden accept="image/*,.pdf,.doc,.docx,.txt,.md,.csv" onChange={(e) => { ingest(e.target.files); e.target.value = ''; }} />
      </div>

      <Panel kicker="Library" title="File assets" aside={
        <div className="flex flex-wrap gap-1">
          {(['All', ...TAGS] as const).map((t) => (
            <button key={t} data-testid={`filter-${t}`} onClick={() => setFilter(t)} className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${filter === t ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>{t}</button>
          ))}
        </div>
      }>
        {list.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed p-8 text-sm text-muted-foreground"><ImagePlus className="mb-2 h-6 w-6" />Nothing tagged {filter} yet.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {list.map((a) => (
              <div key={a.id} data-testid={`card-asset-${a.id}`} className="group overflow-hidden rounded-lg border bg-background rise">
                <div className="relative aspect-[4/3] overflow-hidden" style={{ background: a.invert ? '#3E1F1A' : '#F4EBDB' }}>
                  {a.mime.startsWith('image/') ? (
                    <img src={a.src} alt={a.name} className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${a.tag === 'Logo' ? 'object-contain p-3' : 'object-cover'}`}
                      style={a.invert ? { filter: 'invert(1) sepia(0.35)', mixBlendMode: 'screen' } : a.tag === 'Logo' ? { mixBlendMode: 'multiply' } : undefined} />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-1 text-[#3E1F1A]"><FileText className="h-8 w-8" /><span className="font-mono text-[10px] uppercase">{a.name.split('.').pop()}</span></div>
                  )}
                  {a.builtin && <span className="absolute left-2 top-2 rounded bg-foreground/80 px-1.5 py-0.5 font-mono text-[9px] uppercase text-background">Sample</span>}
                </div>
                <div className="space-y-2 p-2.5">
                  <div className="truncate text-xs font-semibold" title={a.name}>{a.name}</div>
                  <div className="flex items-center gap-1">
                    <Select value={a.tag} onValueChange={(v) => edit(a.id, { tag: v as AssetTag })}>
                      <SelectTrigger data-testid={`select-tag-${a.id}`} className="h-7 text-[11px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{TAGS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                    {!a.builtin && (
                      <Button data-testid={`button-delete-asset-${a.id}`} variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => remove(a.id)} aria-label="Delete asset"><Trash2 className="h-3.5 w-3.5" /></Button>
                    )}
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground">{a.builtin ? 'bundled' : fmtBytes(a.bytes)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 text-xs text-muted-foreground">Visual Asset images fill the slide 3 showcase (first three). Logo images become selectable cover emblems in Styling.</p>
      </Panel>
    </div>
  );
}
