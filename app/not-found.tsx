"use client";

import React from 'react';
import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useHomeHref } from '../lib/useHomeHref';

// US-1.6: Next.js special file, rendered for any route that doesn't match —
// replaces the framework's default 404 with copy that fits the rest of the
// site (crisis/ayuda humanitaria tone, not a generic template joke).
export default function NotFound() {
  const { citySlug: homeCitySlug, href: homeHref } = useHomeHref();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar currentCitySlug={homeCitySlug} />

        <main className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-solidarity-600/20 border border-solidarity-500/40 flex items-center justify-center text-emerald-500">
            <Compass className="w-8 h-8" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-slate-100 mb-3">
            No encontramos esta página
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mb-8">
            El enlace puede estar roto o la publicación ya no está disponible.
            Pero la ayuda sigue activa — volvamos al feed de alojamientos.
          </p>
          <Link
            href={homeHref}
            className="touch-target inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-solidarity-600 hover:bg-solidarity-500 text-white font-semibold text-sm shadow-md shadow-solidarity-900/40 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al feed de alojamientos
          </Link>
        </main>
      </div>

      <Footer />
    </div>
  );
}
