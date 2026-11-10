import type { Asset } from '@/lib/types';
import { EMBLEM_SRC } from '@/lib/defaults';

export function resolveLogo(logo: string, assets: Asset[]): { src: string; invert: boolean } | null {
  if (logo === 'builtin:rayana-dark') return { src: EMBLEM_SRC, invert: false };
  if (logo === 'builtin:rayana-light') return { src: EMBLEM_SRC, invert: true };
  if (logo.startsWith('asset:')) {
    const a = assets.find((x) => x.id === logo.slice(6));
    if (a && a.mime.startsWith('image/')) return { src: a.src, invert: !!a.invert };
  }
  return null;
}

/** Use the prepared transparent emblem; invert only for its light treatment. */
export function Emblem({ src, invert, width, className = '' }: { src: string; invert: boolean; width: number; className?: string }) {
  return (
    <img
      src={src}
      alt="Rayana's Bistro emblem"
      width={width}
      draggable={false}
      className={className}
      style={{
        width,
        height: 'auto',
        display: 'block',
        filter: invert ? 'invert(1) sepia(0.35) brightness(1.08)' : 'none',
      }}
    />
  );
}
