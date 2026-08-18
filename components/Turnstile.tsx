"use client";

import { useCallback, useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      execute: (widgetId: string) => void;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

let scriptLoadPromise: Promise<void> | null = null;
function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;
  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Cloudflare Turnstile.'));
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
}

/**
 * US-6.5: one invisible Turnstile challenge per feed session, used to gate
 * the "reveal WhatsApp contact" call server-side (see `getContactLink` in
 * lib/api.ts) without adding any login/account friction — same site key
 * already wired for the publish form's `CreateListingInput.turnstileToken`.
 *
 * If `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is unset, or Cloudflare's script fails
 * to load (blocked CDN, ad blocker, offline demo), `token` stays `null`
 * forever — callers MUST degrade gracefully (still let the contact go
 * through) rather than block someone from reaching help over a missing
 * anti-scraping token. Render `<TurnstileContainer />` once per page with
 * the returned `containerRef`; the widget renders invisibly into it.
 */
export function useInvisibleTurnstile() {
  const [token, setToken] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !containerRef.current) return;
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !window.turnstile || !containerRef.current) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          size: 'normal',
          appearance: 'interaction-only',
          retry: 'auto',
          callback: (t: string) => setToken(t),
          'expired-callback': () => setToken(null),
          'error-callback': () => setToken(null),
        });
      })
      .catch(() => setToken(null));

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, []);

  // Tokens are single-use server-side once validated; call after a
  // successful reveal so the next click gets a fresh one instead of retrying
  // an already-consumed token.
  const refresh = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, []);

  return { token, containerRef, refresh };
}

export const TurnstileContainer: React.FC<{ containerRef: React.RefObject<HTMLDivElement> }> = ({
  containerRef,
}) => (
  // Cloudflare warns display:none containers can break widget rendering, so
  // this is positioned off-screen rather than hidden via `hidden`/display:none.
  <div ref={containerRef} className="absolute -left-[9999px] top-0" aria-hidden="true" />
);
