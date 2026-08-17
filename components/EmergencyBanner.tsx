"use client";

import React, { useState } from 'react';
import { PhoneCall, AlertTriangle, ShieldCheck, ChevronDown } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  // Collapsed by default so the numbers don't eat first-screen space on
  // mobile/tablet; md:+ always shows them inline regardless of this state.
  // (Pinned open at md: rather than sm: because label + 3 pills don't fit
  // in one row yet at sm:-only widths like ~712px — it just wraps badly.)
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-rose-950 border-b-2 border-amber-500/70 text-white text-xs sm:text-sm py-2.5 px-4">
      <div className="max-w-7xl mx-auto md:flex md:items-center md:justify-center md:gap-3">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="w-full md:w-auto flex items-center justify-between gap-2 md:justify-center md:cursor-default"
        >
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="font-semibold text-rose-100 text-left">
              Líneas de atención nacional de emergencia
            </span>
          </span>
          <ChevronDown
            className={`w-4 h-4 text-rose-200 flex-shrink-0 transition-transform duration-300 md:hidden ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Animated collapse: grid-template-rows tween avoids measuring
            height in JS. md:+ is pinned open regardless of `isOpen`. */}
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-in-out md:!grid-rows-[1fr] ${
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs pt-2 md:pt-0">
              <a
                href="tel:132"
                className="px-2.5 py-1 rounded bg-rose-900/70 border border-rose-700/60 hover:bg-rose-900 text-rose-100 flex items-center gap-1 transition-colors"
              >
                <PhoneCall className="w-3 h-3 text-amber-300" /> Cruz Roja: 132
              </a>
              <a
                href="tel:144"
                className="px-2.5 py-1 rounded bg-rose-900/70 border border-rose-700/60 hover:bg-rose-900 text-rose-100 flex items-center gap-1 transition-colors"
              >
                <PhoneCall className="w-3 h-3 text-amber-300" /> Defensa Civil: 144
              </a>
              <a
                href="tel:123"
                className="px-2.5 py-1 rounded bg-rose-900/70 border border-rose-700/60 hover:bg-rose-900 text-rose-100 flex items-center gap-1 transition-colors"
              >
                <ShieldCheck className="w-3 h-3 text-amber-300" /> UNGRD: 123
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
