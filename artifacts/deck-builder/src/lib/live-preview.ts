import { useEffect, useRef, useState } from 'react';
import { loadState, migrate, STORAGE_KEY } from './persistence';
import type { DeckState } from './types';

const CHANNEL = `deck-builder:live-preview:${import.meta.env.BASE_URL}`;

/** The editor is the only writer; preview tabs never save back to browser storage. */
export function usePublishDeck(state: DeckState) {
  const latest = useRef(state);
  latest.current = state;
  const channel = useRef<BroadcastChannel | null>(null);
  const previews = useRef(new Set<Window>());

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.channel !== CHANNEL || !event.source) return;
      const target = event.source as Window;
      const known = previews.current.has(target);
      if (!known && target.opener !== window) return;
      previews.current.add(target);
      if (event.data.type === 'request' || (!known && event.data.type === 'ping')) {
        target.postMessage({ channel: CHANNEL, type: 'snapshot', state: latest.current }, window.location.origin);
      } else if (event.data.type === 'ping') {
        target.postMessage({ channel: CHANNEL, type: 'pong' }, window.location.origin);
      }
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, []);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const connection = new BroadcastChannel(CHANNEL);
    channel.current = connection;
    connection.onmessage = ({ data }) => {
      if (data?.type === 'request') {
        connection.postMessage({ type: 'snapshot', state: latest.current });
      } else if (data?.type === 'ping') {
        connection.postMessage({ type: 'pong' });
      }
    };
    connection.postMessage({ type: 'snapshot', state: latest.current });
    return () => { channel.current = null; connection.close(); };
  }, []);

  useEffect(() => {
    channel.current?.postMessage({ type: 'snapshot', state });
    for (const preview of previews.current) {
      if (preview.closed) previews.current.delete(preview);
      else preview.postMessage({ channel: CHANNEL, type: 'snapshot', state }, window.location.origin);
    }
  }, [state]);

  return () => {
    const url = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/live-preview`;
    const preview = window.open(url, '_blank');
    if (preview) previews.current.add(preview);
    return !!preview;
  };
}

export function useLiveDeck() {
  const [state, setState] = useState<DeckState>(() => loadState().state);
  const [connected, setConnected] = useState(false);
  const [supported] = useState(() => typeof BroadcastChannel !== 'undefined');

  useEffect(() => {
    let lastSeen = 0;
    const opener = window.opener as Window | null;
    const connection = supported ? new BroadcastChannel(CHANNEL) : null;
    const receiveStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try { setState(migrate(JSON.parse(event.newValue))); } catch { /* Ignore malformed external storage changes. */ }
    };
    const receive = (data: { type?: string; state?: unknown }) => {
        if (data?.type !== 'snapshot' && data?.type !== 'pong') return;
        lastSeen = Date.now();
        setConnected(true);
        if (data.type === 'snapshot') setState(migrate(data.state));
    };
    if (connection) connection.onmessage = ({ data }) => receive(data);
    const receiveMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.source === opener && event.data?.channel === CHANNEL) receive(event.data);
    };
    window.addEventListener('message', receiveMessage);
    const send = (type: string) => {
      connection?.postMessage({ type });
      if (opener && !opener.closed) opener.postMessage({ channel: CHANNEL, type }, window.location.origin);
    };
    const request = () => send('request');
    request();
    const timer = window.setInterval(() => {
      setConnected(lastSeen > 0 && Date.now() - lastSeen < 8000);
      send('ping');
    }, 2000);
    window.addEventListener('focus', request);
    window.addEventListener('storage', receiveStorage);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', request);
      window.removeEventListener('storage', receiveStorage);
      window.removeEventListener('message', receiveMessage);
      connection?.close();
    };
  }, [supported]);

  return { state, connected, supported: supported || !!window.opener };
}
