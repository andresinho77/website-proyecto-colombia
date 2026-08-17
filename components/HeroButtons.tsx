"use client";

import React from 'react';
import { Home, Heart, Zap } from 'lucide-react';

interface HeroButtonsProps {
  onSelectTipo: (tipo: 'ofrezco' | 'necesito') => void;
}

export const HeroButtons: React.FC<HeroButtonsProps> = ({ onSelectTipo }) => {
  return (
    <section className="relative py-12 sm:py-16 px-4 text-center overflow-hidden">
      {/* Decorative background mural — plain <img>, tinted green with a CSS
          filter (invert+sepia+hue-rotate is the standard trick for recoloring
          a black SVG/PNG without baking a specific color into the asset).
          Simpler and more reliably supported than the mask-image approach.
          Sits outside the max-w-5xl content wrapper below so it spans the
          full section width, not just the centered text column. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/solidaridad.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 w-full h-full object-center sm:w-full sm:h-fit opacity-30 -translate-y-[20%] "
        style={{
          filter:
            'invert(29%) sepia(96%) saturate(748%) hue-rotate(93deg) brightness(94%) contrast(92%)',
        }}
      />

      <div className="relative max-w-5xl mx-auto">
        {/* Emergency Alert Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950 border border-emerald-700/50 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-6">
          <Zap className="w-4 h-4 text-amber-400" />
          Red de apoyo 100% gratuita
        </div>

        <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-slate-100 tracking-tight leading-tight mb-4">
          Un techo, cerca, ahora
        </h1>

        <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg mb-8 sm:mb-10 leading-relaxed">
          Plataforma pública para familias afectadas por el terremoto del 10 de agosto en{' '}
          <strong className="text-slate-100 font-semibold">Chocó, Pereira, Cali, Quibdó, Manizales y Armenia</strong>.
          ¡Crear tu anuncio toma menos de 60 segundos!
        </p>

        {/* US-1.1: Two Large Touch-Friendly (≥44px) CTA Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <button
            onClick={() => onSelectTipo('necesito')}
            className="touch-target group relative p-6 rounded-2xl bg-rose-700 border border-rose-600/50 hover:border-rose-400 text-white shadow-sm transition-colors text-left flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-800/60 border border-rose-500/40 flex items-center justify-center flex-shrink-0">
              <Heart className="w-7 h-7 text-rose-200" />
            </div>
            <div>
              <span className="font-display block text-xl font-semibold text-white mb-1">
                Necesito <br/> alojamiento
              </span>
              <span className="text-xs text-rose-100/85 block leading-relaxed">
                Publica tu necesidad o busca techo disponible en tu ciudad sin registros.
              </span>
            </div>
          </button>

          <button
            onClick={() => onSelectTipo('ofrezco')}
            className="touch-target group relative p-6 rounded-2xl bg-emerald-950 border border-emerald-700/50 hover:border-emerald-500 text-white shadow-sm transition-colors text-left flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-900/60 border border-emerald-600/40 flex items-center justify-center flex-shrink-0">
              <Home className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <span className="font-display block text-xl font-semibold text-white mb-1">
                Tengo espacio disponible
              </span>
              <span className="text-xs text-emerald-200/80 block leading-relaxed">
                Publica en menos de 60s la habitación, sofá o predio que puedes compartir.
              </span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};
