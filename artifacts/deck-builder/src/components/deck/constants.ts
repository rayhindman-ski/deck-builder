/** 297mm × 210mm at 96dpi */
export const SLIDE_W = 1123;
export const SLIDE_H = 794;
export const SLIDE_COUNT = 9;

export function slideLabel(i: number, toc: string[], sections: string[]) {
  return i < 2 ? sections[i] : (toc[i - 2] ?? sections[i]);
}
