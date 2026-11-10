import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { SLIDE_H, SLIDE_W } from '@/components/deck/constants';

async function waitForAssets(root: HTMLElement) {
  if (document.fonts?.ready) await document.fonts.ready;
  const imgs = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    imgs.map((img) =>
      img.complete && img.naturalWidth
        ? img.decode().catch(() => undefined)
        : new Promise<void>((res) => { img.onload = () => res(); img.onerror = () => res(); }),
    ),
  );
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
}

/** Renders each [data-export-slide] node in `root` at native A4 size into a landscape A4 PDF. */
export async function renderDeckPdf(root: HTMLElement, onProgress?: (done: number, total: number) => void): Promise<Blob> {
  await waitForAssets(root);
  const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-export-slide]'));
  if (!nodes.length) throw new Error('No slides found to render.');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
  for (let i = 0; i < nodes.length; i++) {
    onProgress?.(i, nodes.length);
    const opts = { width: SLIDE_W, height: SLIDE_H, pixelRatio: 2, quality: 0.92, cacheBust: false, backgroundColor: '#ffffff' };
    let data: string;
    try {
      data = await toJpeg(nodes[i], opts);
    } catch {
      // Cross-origin font CSS can fail to inline; retry without embedded web fonts.
      data = await toJpeg(nodes[i], { ...opts, skipFonts: true });
    }
    if (i > 0) pdf.addPage('a4', 'landscape');
    pdf.addImage(data, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');
  }
  onProgress?.(nodes.length, nodes.length);
  return pdf.output('blob');
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(r.error);
    r.readAsDataURL(blob);
  });
}

export function triggerDownload(href: string, filename: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function errorMessage(e: unknown): string {
  if (e && typeof e === 'object') {
    const any = e as { data?: { error?: string }; message?: string };
    if (any.data && typeof any.data.error === 'string') return any.data.error;
    if (any.message) return any.message;
  }
  return String(e ?? 'Unknown error');
}
