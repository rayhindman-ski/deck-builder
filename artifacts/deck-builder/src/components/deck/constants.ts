/** 297mm × 210mm at 96dpi */
export const SLIDE_W = 1123;
export const SLIDE_H = 794;
export const SLIDE_COUNT = 10;

/** Index of the illustrated copy of the Offerings slide (inserted after slide 4). */
export const ILLUSTRATED_INDEX = 4;
/** Maps a slide index to its slot in the persisted 7-entry toc / 9-entry SECTION_TITLES. */
export const baseSlot = (i: number) => (i > ILLUSTRATED_INDEX ? i - 1 : i === ILLUSTRATED_INDEX ? ILLUSTRATED_INDEX - 1 : i);
export function slideLabel(i: number, toc: string[], sections: string[]) {
  const b = baseSlot(i);
  const base = b < 2 ? sections[b] : (toc[b - 2] ?? sections[b]);
  return i === ILLUSTRATED_INDEX ? `${base} (Illustrated)` : base;
}
