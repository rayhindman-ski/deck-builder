import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getListDeckExportsQueryKey, getListDeckExportsQueryOptions, useSaveDeckExport, type DeckExport } from '@workspace/api-client-react';
import { blobToBase64, downloadBlob, errorMessage, renderDeckPdf } from './export-pdf';

export type ExportMode = 'download' | 'project' | 'print';

/**
 * Every export path renders the current 10 slides to a PDF and archives it via saveDeckExport,
 * which allocates the next vNN on the server. Then the mode-specific action runs.
 */
export function useDeckSaver() {
  const qc = useQueryClient();
  const save = useSaveDeckExport();
  const [busy, setBusy] = useState<ExportMode | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState<DeckExport | null>(null);
  const inFlight = useRef(false);

  const run = async (mode: ExportMode): Promise<DeckExport | null> => {
    if (inFlight.current) return null;
    const root = document.querySelector<HTMLElement>('.print-deck');
    if (!root) { setError('Render area missing.'); return null; }
    inFlight.current = true;
    setBusy(mode); setError(null);
    let stage = 'Connecting to the project archive';
    try {
      setProgress(stage);
      await qc.fetchQuery({ ...getListDeckExportsQueryOptions(), staleTime: 0, retry: 1 });
      stage = 'Rendering the PDF';
      const blob = await renderDeckPdf(root, (d, t) => setProgress(d < t ? `Rendering slide ${d + 1} of ${t}` : 'Encoding PDF'));
      stage = 'Saving the PDF in the project';
      setProgress('Archiving to doc/decks');
      const pdfBase64 = await blobToBase64(blob);
      const saved = await save.mutateAsync({ data: { pdfBase64 } });
      await qc.invalidateQueries({ queryKey: getListDeckExportsQueryKey() });
      setLast(saved);
      if (mode === 'download') downloadBlob(blob, saved.filename);
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
      setError(`${stage}: ${errorMessage(e)}`);
      return null;
    } finally {
      setBusy(null); setProgress('');
      inFlight.current = false;
    }
  };

  return { run, busy, progress, error, last, clearError: () => setError(null) };
}
