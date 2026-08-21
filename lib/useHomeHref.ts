"use client";

import { useEffect, useState } from 'react';
import { DEFAULT_CITY, PREFERRED_CITY_STORAGE_KEY, getCityBySlug } from './cities';

export interface HomeHref {
  /** City slug alone, e.g. "pereira" — for props like Navbar's `currentCitySlug`. */
  citySlug: string;
  /** Trailing-slash route, e.g. "/pereira/" — for `<Link href>`. */
  href: string;
}

/**
 * Resolves a "go home" destination that respects whichever city the visitor
 * last browsed (CitySwitcher writes PREFERRED_CITY_STORAGE_KEY), falling
 * back to DEFAULT_CITY only when nothing is remembered yet. Shared by every
 * page that needs a context-aware "back to the app" link without real
 * browser history to fall back on (404, 500, terminos-y-privacidad) —
 * extracted from app/terminos-y-privacidad/page.tsx's original bug fix
 * (2026-08-21) so app/not-found.tsx and app/error.tsx don't duplicate it.
 *
 * Starts at DEFAULT_CITY and corrects itself in a useEffect (not read
 * directly in useState's initializer) since localStorage isn't available
 * during SSR — reading it synchronously here would cause a hydration
 * mismatch for a returning visitor with a different remembered city.
 */
export function useHomeHref(): HomeHref {
  const [citySlug, setCitySlug] = useState(DEFAULT_CITY.slug);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PREFERRED_CITY_STORAGE_KEY);
      if (saved && getCityBySlug(saved)) setCitySlug(saved);
    } catch {
      // ignore — keep DEFAULT_CITY fallback
    }
  }, []);

  return { citySlug, href: `/${citySlug}/` };
}
