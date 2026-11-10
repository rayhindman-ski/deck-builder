import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { SLIDE_H, SLIDE_W } from '@/components/deck/constants';
import { exportFontCss } from './deck-fonts';

function timeout<T>(promise: Promise<T>, message: string, milliseconds = 20000): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error(message)), milliseconds); }),
  ]).finally(() => clearTimeout(timer));
}

async function waitForAssets(root: HTMLElement) {
  if (document.fonts?.ready) await timeout(document.fonts.ready, 'Fonts took too long to load. Please retry the export.');
  const imgs = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    imgs.map(async (img) => {
      const message = `The slide image "${img.alt || 'unnamed image'}" could not load. Check or replace it in Files, then retry.`;
      if (!img.complete) await timeout(new Promise<void>((resolve, reject) => {
        const cleanup = () => { img.removeEventListener('load', loaded); img.removeEventListener('error', failed); };
        const loaded = () => { cleanup(); resolve(); };
        const failed = () => { cleanup(); reject(new Error(message)); };
        img.addEventListener('load', loaded, { once: true });
        img.addEventListener('error', failed, { once: true });
      }), message);
      if (!img.naturalWidth) throw new Error(message);
      await img.decode().catch(() => undefined);
    }),
  );
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
}

/** Renders each [data-export-slide] node in `root` at native A4 size into a landscape A4 PDF. */
export async function renderDeckPdf(root: HTMLElement, onProgress?: (done: number, total: number) => void): Promise<Blob> {
  await waitForAssets(root);
  const fontEmbedCSS = await exportFontCss(root);
  const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-export-slide]'));
  if (!nodes.length) throw new Error('No slides found to render.');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
  for (let i = 0; i < nodes.length; i++) {
    onProgress?.(i, nodes.length);
    const opts = { width: SLIDE_W, height: SLIDE_H, pixelRatio: 2, quality: 0.92, cacheBust: false, backgroundColor: '#ffffff', fontEmbedCSS };
    let data: string;
    try {
      data = await timeout(toJpeg(nodes[i], opts), `Slide ${i + 1} took too long to render. Please retry.`, 30000);
    } catch (error) {
      throw new Error(`Could not render slide ${i + 1}. ${errorMessage(error)}`);
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

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export function errorMessage(e: unknown): string {
  if (typeof Event !== 'undefined' && e instanceof Event) {
    return 'The browser could not render a slide image. Check that its images and fonts are available, then retry.';
  }
  if (e && typeof e === 'object') {
    const any = e as { data?: { error?: string }; message?: string };
    if (any.data && typeof any.data.error === 'string') return any.data.error;
    if (any.message) return any.message;
  }
  return String(e ?? 'Unknown error');
}
