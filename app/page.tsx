"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DEFAULT_CITY, getCityBySlug, PREFERRED_CITY_STORAGE_KEY } from '../lib/cities';

// `/` has no city of its own — it always resolves to one (the user's last
// pick, or the default) so every real screen lives at /<ciudad>/. This is a
// client-side redirect (not `redirect()`/`next.config` redirects) because
// the site is a static export (`output: 'export'`, see next.config.mjs) with
// no server available to issue one.
export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    let target = DEFAULT_CITY.slug;
    try {
      const saved = window.localStorage.getItem(PREFERRED_CITY_STORAGE_KEY);
      if (saved && getCityBySlug(saved)) target = saved;
    } catch {
      // localStorage unavailable — fall back to the default city.
    }
    router.replace(`/${target}/`);
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <p className="text-slate-400 text-sm">Cargando…</p>
    </div>
  );
}
