"use client";

import React from 'react';
import { Home, Heart, Zap } from 'lucide-react';

interface HeroButtonsProps {
  onSelectTipo: (tipo: 'ofrezco' | 'necesito') => void;
}

export const HeroButtons: React.FC<HeroButtonsProps> = ({ onSelectTipo }) => {
  return (
    <section className="relative py-12 sm:py-16 px-4 max-w-5xl mx-auto text-center">
      {/* Emergency Alert Tag */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-solidarity-950/80 border border-solidarity-500/30 text-solidarity-400 text-xs font-semibold uppercase tracking-wider mb-6 shadow-inner">
        <Zap className="w-4 h-4 text-emerald-400 animate-bounce" />
        Red de Respuesta Inmediata • Sin Cuenta • 100% Gratuito
      </div>

      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4">
        Conectando techo y solidaridad en{' '}
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
          Colombia
        </span>
      </h1>

      <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg mb-8 sm:mb-10 leading-relaxed font-light">
        Plataforma pública para familias afectadas por el terremoto del 10 de agosto en{' '}
        <strong className="text-white font-semibold">Chocó, Pereira, Cali, Quibdó, Manizales y Armenia</strong>.
        Conexión directa por WhatsApp en menos de 60 segundos.
      </p>

      {/* US-1.1: Two Large Touch-Friendly (≥44px) CTA Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <button
          onClick={() => onSelectTipo('necesito')}
          className="touch-target group relative p-6 rounded-2xl bg-gradient-to-br from-rose-950 via-rose-900 to-amber-950 border border-rose-600/40 hover:border-rose-500 text-white shadow-xl shadow-rose-950/50 hover:shadow-rose-900/60 transition-all transform hover:-translate-y-1 text-left flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-600/30 border border-rose-500/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <Heart className="w-7 h-7 text-rose-300" />
          </div>
          <div>
            <span className="block text-xl font-bold text-white mb-1 group-hover:text-rose-200">
              Necesito Alojamiento 🆘
            </span>
            <span className="text-xs text-rose-200/80 block font-normal leading-relaxed">
              Publica tu necesidad o busca techo disponible en tu ciudad sin registros.
            </span>
          </div>
        </button>

        <button
          onClick={() => onSelectTipo('ofrezco')}
          className="touch-target group relative p-6 rounded-2xl bg-gradient-to-br from-solidarity-950 via-solidarity-900 to-emerald-950 border border-solidarity-600/40 hover:border-solidarity-500 text-white shadow-xl shadow-solidarity-950/50 hover:shadow-solidarity-900/60 transition-all transform hover:-translate-y-1 text-left flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-solidarity-600/30 border border-solidarity-500/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <Home className="w-7 h-7 text-emerald-300" />
          </div>
          <div>
            <span className="block text-xl font-bold text-white mb-1 group-hover:text-emerald-200">
              Tengo Espacio Disponible 🏡
            </span>
            <span className="text-xs text-emerald-200/80 block font-normal leading-relaxed">
              Publica en menos de 60s la habitación, sofá o predio que puedes compartir.
            </span>
          </div>
        </button>
      </div>
    </section>
  );
};
