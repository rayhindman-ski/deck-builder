import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { clearState, loadState, migrate, saveState } from './persistence';
import { createDefaultState } from './defaults';
import { compute, type Model } from './financial';
import type { DeckState, PersistTier } from './types';
import { withApprovedScenario } from './approved-scenario';

interface Ctx {
  state: DeckState;
  model: Model;
  tier: PersistTier;
  migrated: boolean;
  savedAt: number | null;
  update: (fn: (s: DeckState) => DeckState) => void;
  patch: <K extends keyof DeckState>(key: K, value: Partial<DeckState[K]>) => void;
  reset: () => void;
  importJson: (raw: unknown) => void;
  slide: number;
  setSlide: (n: number) => void;
  tab: string;
  setTab: (t: string) => void;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(() => loadState(), []);
  const [state, setState] = useState<DeckState>(initial.state);
  const [tier, setTier] = useState<PersistTier>(initial.tier);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [slide, setSlideRaw] = useState(0);
  const [tab, setTab] = useState('style');
  const timer = useRef<number | undefined>(undefined);

  // Also update an already-open editor after hot reload, without replacing user edits later.
  useEffect(() => {
    setState(s => s.fin.planningScenarioApplied ? s : { ...s, fin: withApprovedScenario(s.fin) });
  }, []);

  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setTier(saveState(state));
      setSavedAt(Date.now());
    }, 220);
    return () => window.clearTimeout(timer.current);
  }, [state]);

  const update = useCallback((fn: (s: DeckState) => DeckState) => setState(fn), []);
  const patch = useCallback(<K extends keyof DeckState>(key: K, value: Partial<DeckState[K]>) => {
    setState((s) => ({ ...s, [key]: { ...(s[key] as object), ...(value as object) } }));
  }, []);
  const reset = useCallback(() => { clearState(); setState(createDefaultState()); setSlideRaw(0); }, []);
  const importJson = useCallback((raw: unknown) => {
    const src = raw && typeof raw === 'object' && 'state' in (raw as object) ? (raw as { state: unknown }).state : raw;
    setState(migrate(src, false, false));
  }, []);
  const setSlide = useCallback((n: number) => setSlideRaw(Math.max(0, Math.min(8, n))), []);
  const model = useMemo(() => compute(state.fin), [state.fin]);

  return (
    <StoreCtx.Provider value={{ state, model, tier, migrated: initial.migrated, savedAt, update, patch, reset, importJson, slide, setSlide, tab, setTab }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error('StoreProvider missing');
  return c;
}
