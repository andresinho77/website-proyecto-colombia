"use client";

import React from 'react';
import Link from 'next/link';
import { AlertOctagon, RotateCw, ArrowLeft } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useHomeHref } from '../lib/useHomeHref';

// US-1.6: Next.js error boundary (app/error.tsx — must be a Client
// Component, per Next.js). Catches unexpected render/runtime errors below
// this point in the tree.
//
// SECURITY — do not relax this gate: `error.stack`/`error.message` can leak
// file paths, function names, or (if a future change ever puts one in an
// Error) request data. They must never reach a production visitor.
// `process.env.NODE_ENV` is inlined by Next's build (same mechanism that
// inlines NEXT_PUBLIC_API_URL, see lib/api.ts) and dead-code-eliminated by
// the production minifier — this is NOT a CSS/runtime `display:none`, the
// JSX block below does not exist in the production bundle at all. Verified
// by grepping the static `out/` export for `error.stack`/`Detalles técnicos`
// after a real `NODE_ENV=production` build; see ROADMAP.md US-1.6 for the
// verification note.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { citySlug: homeCitySlug, href: homeHref } = useHomeHref();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar currentCitySlug={homeCitySlug} />

        <main className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-rose-950 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-slate-100 mb-3">
            Algo salió mal
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mb-8">
            Encontramos un error inesperado. Puedes intentar de nuevo o volver
            al feed de alojamientos — tus datos no se vieron afectados.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <button
              type="button"
              onClick={reset}
              className="touch-target w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-solidarity-600 hover:bg-solidarity-500 text-white font-semibold text-sm shadow-md shadow-solidarity-900/40 transition-colors"
            >
              <RotateCw className="w-4 h-4" />
              Intentar de nuevo
            </button>
            <Link
              href={homeHref}
              className="touch-target w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al feed
            </Link>
          </div>

          {process.env.NODE_ENV !== 'production' && (
            <div className="text-left glass-card rounded-2xl p-4 border border-rose-800/60">
              <p className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2">
                Detalles técnicos (solo visible en desarrollo)
              </p>
              <pre className="text-xs text-slate-300 whitespace-pre-wrap break-words max-h-80 overflow-y-auto bg-slate-950/80 rounded-lg p-3 border border-slate-800">
                {error.message}
                {error.digest ? `\n\ndigest: ${error.digest}` : ''}
                {error.stack ? `\n\n${error.stack}` : ''}
              </pre>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
