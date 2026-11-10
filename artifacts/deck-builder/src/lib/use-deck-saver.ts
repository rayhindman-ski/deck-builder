import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getListDeckExportsQueryKey, useSaveDeckExport, type DeckExport } from '@workspace/api-client-react';
import { blobToBase64, errorMessage, renderDeckPdf, triggerDownload } from './export-pdf';

export type ExportMode = 'download' | 'project' | 'print';

/**
 * Every export path renders the current 9 slides to a PDF and archives it via saveDeckExport,
 * which allocates the next vNN on the server. Then the mode-specific action runs.
 */
export function useDeckSaver() {
  const qc = useQueryClient();
  const save = useSaveDeckExport();
  const [busy, setBusy] = useState<ExportMode | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState<DeckExport | null>(null);

  const run = async (mode: ExportMode): Promise<DeckExport | null> => {
    const root = document.querySelector<HTMLElement>('.print-deck');
    if (!root) { setError('Render area missing.'); return null; }
    setBusy(mode); setError(null);
    try {
      const blob = await renderDeckPdf(root, (d, t) => setProgress(d < t ? `Rendering slide ${d + 1} of ${t}` : 'Encoding PDF'));
      setProgress('Archiving to doc/decks');
      const pdfBase64 = await blobToBase64(blob);
      const saved = await save.mutateAsync({ data: { pdfBase64 } });
      await qc.invalidateQueries({ queryKey: getListDeckExportsQueryKey() });
      setLast(saved);
      if (mode === 'download') triggerDownload(saved.downloadUrl, saved.filename);
      if (mode === 'print') {
        const prev = document.title;
        document.title = saved.filename.replace(/\.pdf$/i, '');
        const restore = () => { document.title = prev; window.removeEventListener('afterprint', restore); };
        window.addEventListener('afterprint', restore);
        setProgress('Opening print dialog');
        await new Promise((r) => setTimeout(r, 60));
        window.print();
      }
      return saved;
    } catch (e) {
      setError(errorMessage(e));
      return null;
    } finally {
      setBusy(null); setProgress('');
    }
  };

  return { run, busy, progress, error, last, clearError: () => setError(null) };
}
