const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const fonts = [
  ['Fraunces', 'fraunces'],
  ['Inter', 'inter'],
  ['JetBrains Mono', 'jetbrainsmono'],
  ['Montserrat', 'montserrat'],
  ['Playfair Display', 'playfairdisplay'],
  ['Plus Jakarta Sans', 'plusjakartasans'],
] as const;

/** Register bundled fonts without relying on Google Fonts or cross-origin CSS. */
export function installDeckFonts() {
  if (typeof document === 'undefined' || document.getElementById('deck-local-fonts')) return;
  const style = document.createElement('style');
  style.id = 'deck-local-fonts';
  style.textContent = fonts.map(([family, file]) =>
    `@font-face{font-family:"${family}";font-style:normal;font-weight:400 700;font-display:swap;src:url("${base}/fonts/${file}-latin.woff2") format("woff2");}`,
  ).join('\n');
  document.head.appendChild(style);
}

const embedded = new Map<string, Promise<string>>();

async function embedFont(family: string, file: string): Promise<string> {
  if (!embedded.has(family)) {
    embedded.set(family, (async () => {
      const response = await fetch(`${base}/fonts/${file}-latin.woff2`, { signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error(`Could not load the bundled ${family} font (${response.status}). Please retry.`);
      const blob = await response.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error(`Could not read the ${family} font.`));
        reader.readAsDataURL(blob);
      });
      return `@font-face{font-family:"${family}";font-style:normal;font-weight:400 700;src:url("${dataUrl}") format("woff2");}`;
    })().catch(error => { embedded.delete(family); throw error; }));
  }
  return embedded.get(family)!;
}

/** Only embed fonts actually used by slides; never scan unrelated remote stylesheets. */
export async function exportFontCss(root: HTMLElement): Promise<string> {
  const used = new Set<string>(['JetBrains Mono']);
  for (const node of [root, ...root.querySelectorAll<HTMLElement>('[style*="font-family"]')]) {
    used.add(getComputedStyle(node).fontFamily.split(',')[0].replace(/['"]/g, '').trim());
  }
  return (await Promise.all(fonts.filter(([family]) => used.has(family)).map(([family, file]) => embedFont(family, file)))).join('\n');
}
