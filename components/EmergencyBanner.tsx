"use client";

import React from 'react';
import { PhoneCall, AlertTriangle, ShieldCheck } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-red-950 via-rose-900 to-amber-950 border-b border-rose-800/40 text-white text-xs sm:text-sm py-2.5 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
          <span className="font-semibold text-rose-200">
            Líneas de Atención Nacional de Emergencia (Terremoto 10 de Agosto):
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
          <a
            href="tel:132"
            className="px-2.5 py-1 rounded bg-rose-950/80 border border-rose-700/50 hover:bg-rose-900 text-rose-200 flex items-center gap-1 transition-colors"
          >
            <PhoneCall className="w-3 h-3 text-emerald-400" /> Cruz Roja: 132
          </a>
          <a
            href="tel:144"
            className="px-2.5 py-1 rounded bg-rose-950/80 border border-rose-700/50 hover:bg-rose-900 text-rose-200 flex items-center gap-1 transition-colors"
          >
            <PhoneCall className="w-3 h-3 text-emerald-400" /> Defensa Civil: 144
          </a>
          <a
            href="tel:123"
            className="px-2.5 py-1 rounded bg-rose-950/80 border border-rose-700/50 hover:bg-rose-900 text-rose-200 flex items-center gap-1 transition-colors"
          >
            <ShieldCheck className="w-3 h-3 text-amber-400" /> UNGRD: 123
          </a>
        </div>
      </div>
    </div>
  );
};
