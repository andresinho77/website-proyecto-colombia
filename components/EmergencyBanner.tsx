"use client";

import React, { useState } from 'react';
import { PhoneCall, AlertTriangle, ShieldCheck, ChevronDown, X } from 'lucide-react';

interface EmergencyBannerProps {
  /** Called when the user dismisses the banner via the "×" — the parent
   * (CityFeedPage) owns whether the banner renders at all, since dismissal
   * needs to persist (lib/localStorage.ts) and surface a reopen affordance
   * in the Navbar, both outside this component's own tree (US-1.5). */
  onDismiss?: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ onDismiss }) => {
  // Collapsed by default so the numbers don't eat first-screen space on
  // mobile/tablet; lg:+ (1024px) always shows them inline regardless of
  // this state. Pinned open at `lg:` rather than `md:` (768px) — the label
  // + 3 pills + "×" button don't fit in one row yet at 768-1023px widths,
  // so that band stays a dropdown too, just with a shorter label (below).
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      data-emergency-banner
      className="bg-rose-950 border-b-2 border-amber-500/70 text-white text-xs sm:text-sm py-2.5 px-4"
    >
      {/* <1024px: stacked — row 1 is the title button + "×", row 2 (when
          open) is the phone-line list on its own line below, not squeezed
          into the same row. 1024px+: back to a single row (pinned open).
          Ordering at lg:+ is controlled explicitly (order-1/2/3 below)
          since the title+"×" pair is nested one level deeper than the pills
          for the mobile stack to work — flex `order` reads across that
          nesting once lg:flex-row kicks in. */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center gap-2 lg:justify-center">
        <div className="flex items-center justify-between gap-2 lg:contents">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            className="flex-1 min-w-0 lg:flex-initial lg:order-1 flex items-center justify-center gap-2 lg:cursor-default"
          >
            <span className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              {/* <768px: dropdown header, full label wraps to whatever width
                  is left instead of truncating. 768-1023px: still a dropdown
                  (see the `lg:` pin below), but the full label no longer fits
                  next to the "×" button on one line, so a shorter variant
                  takes over. 1024px+: pinned open, full label, room to spare. */}
              <span className="font-semibold text-rose-100 text-left md:hidden lg:inline">
                Líneas de atención nacional de emergencia
              </span>
              <span className="hidden md:inline lg:hidden font-semibold text-rose-100 text-left">
                Líneas de atención a emergencias
              </span>
            </span>
            <ChevronDown
              className={`w-4 h-4 text-rose-200 flex-shrink-0 transition-transform duration-300 lg:hidden ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Cerrar aviso de líneas de emergencia"
              title="Cerrar (podrás reabrirlo desde el ícono de teléfono junto a Habeas Data)"
              className="touch-target w-8 h-8 flex-shrink-0 lg:order-3 flex items-center justify-center rounded-full text-rose-300 hover:text-white hover:bg-rose-900/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Animated collapse: grid-template-rows tween avoids measuring
            height in JS. lg:+ is pinned open regardless of `isOpen`. */}
        <div
          className={`grid lg:order-2 transition-[grid-template-rows] duration-300 ease-in-out lg:!grid-rows-[1fr] ${
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs pt-2 lg:pt-0">
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
