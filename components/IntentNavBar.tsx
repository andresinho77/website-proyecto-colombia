"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Heart, Home as HomeIcon, Plus } from 'lucide-react';
import { ListingType } from '../lib/types';

interface IntentNavBarProps {
  /** Trailing-slash base path for the active location level, e.g. "/",
   * "/departamento/valle-del-cauca/" or "/pereira/". */
  basePath: string;
  intentTipo?: ListingType;
  onOpenPublish: (defaultTipo: ListingType) => void;
}

/**
 * US-4.5 replacement for the old full-width hero (components/HeroButtons.tsx,
 * removed): a single persistent bar — segmented Todos/Necesito/Ofrezco tabs
 * (navigation) plus one trailing "+" button (publish), first element under
 * the Navbar so it survives across every tab. Modeled on the iOS
 * Reminders/Todoist list-header idiom — one contextual add action per list,
 * not a button duplicated per row — so browsing and publishing coexist in
 * one bar without doubling touch targets on mobile.
 */
export const IntentNavBar: React.FC<IntentNavBarProps> = ({
  basePath,
  intentTipo,
  onOpenPublish,
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPickerOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsPickerOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPickerOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPickerOpen]);

  // Each tab's active background matches its journey's color elsewhere in
  // the app (rose = necesito, emerald = ofrezco). "Todos" went through 3
  // design passes: a full rose→emerald gradient (muddy brown-olive
  // midpoint), a compressed-seam version, then a solid accent-blue — landed
  // instead on a light-contrast neutral gray from the app's own slate scale
  // (already theme-aware light/dark), since "Todos" isn't really its own
  // journey/brand — it's the neutral "no filter" state (2026-08-21).
  const TODOS_ACCENT = 'bg-slate-700 text-slate-100';
  const tabs: { href: string; label: string; active: boolean; activeBg: string }[] = [
    { href: basePath, label: 'Todos', active: !intentTipo, activeBg: TODOS_ACCENT },
    { href: `${basePath}necesito/`, label: 'Necesito', active: intentTipo === 'necesito', activeBg: 'bg-rose-700 text-white' },
    { href: `${basePath}ofrezco/`, label: 'Ofrezco', active: intentTipo === 'ofrezco', activeBg: 'bg-emerald-700 text-white' },
  ];

  // Contextual "+" — necesito/ofrezco publish directly in that intent;
  // "todos" has no single intent to default to, so it opens a 2-option
  // picker instead of silently guessing one (same disambiguation the old
  // hero buttons gave, compressed into one extra tap).
  const plusAccent =
    intentTipo === 'necesito'
      ? 'bg-rose-700 text-white hover:bg-rose-600 shadow-rose-900/40'
      : intentTipo === 'ofrezco'
      ? 'bg-emerald-700 text-white hover:bg-emerald-600 shadow-emerald-900/40'
      // "Todos": same light-contrast neutral as the active "Todos" tab —
      // text-slate-100, NOT text-white, since bg-slate-700 is a light gray
      // in light theme (white-on-light-gray fails contrast there).
      : 'bg-slate-700 text-slate-100 hover:bg-slate-600 shadow-slate-900/40';

  const plusLabel =
    intentTipo === 'necesito'
      ? 'Publicar necesidad de alojamiento'
      : intentTipo === 'ofrezco'
      ? 'Publicar espacio disponible'
      : 'Publicar (elegir tipo)';

  const handlePlusClick = () => {
    if (intentTipo) {
      onOpenPublish(intentTipo);
      return;
    }
    setIsPickerOpen((prev) => !prev);
  };

  return (
    <div className="sticky top-16 sm:top-20 z-30 glass-nav border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        {/* Segmented Todos/Necesito/Ofrezco control */}
        <div
          role="tablist"
          aria-label="Tipo de búsqueda"
          className="inline-flex items-center gap-0.5 bg-slate-900 border border-slate-800 rounded-full p-1 overflow-x-auto"
        >
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              role="tab"
              aria-selected={tab.active}
              className={`touch-target inline-flex items-center justify-center px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                tab.active
                  ? `${tab.activeBg} shadow-sm`
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Contextual publish action */}
        <div ref={pickerRef} className="relative flex-shrink-0">
          <button
            type="button"
            onClick={handlePlusClick}
            aria-haspopup={intentTipo ? undefined : 'menu'}
            aria-expanded={intentTipo ? undefined : isPickerOpen}
            aria-label={plusLabel}
            title={plusLabel}
            className={`touch-target w-10 h-10 min-[380px]:w-auto min-[380px]:h-auto min-[380px]:px-4 min-[380px]:py-2 rounded-full font-semibold text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 flex-shrink-0 transition-all ${plusAccent}`}
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            {/* Visible from 380px up — below that (older/smaller phones,
                e.g. iPhone SE at 375px) icon-only keeps the button from
                fighting the tab strip for space. Arbitrary Tailwind
                breakpoint (min-[380px]:) since 380 isn't one of the
                default screens. */}
            <span className="hidden min-[380px]:inline">Publicar</span>
          </button>

          {isPickerOpen && (
            <div
              role="menu"
              aria-label="Elegir tipo de publicación"
              className="absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-2xl py-1.5 z-50 bg-slate-950 border border-slate-800 animate-in fade-in zoom-in-95 duration-100"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsPickerOpen(false);
                  onOpenPublish('necesito');
                }}
                className="w-full text-left px-3.5 py-2.5 text-sm text-slate-100 hover:bg-slate-900 flex items-center gap-2.5 transition-colors"
              >
                <span className="w-8 h-8 rounded-lg bg-rose-950 border border-rose-700/50 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 text-rose-300" />
                </span>
                Necesito alojamiento
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsPickerOpen(false);
                  onOpenPublish('ofrezco');
                }}
                className="w-full text-left px-3.5 py-2.5 text-sm text-slate-100 hover:bg-slate-900 flex items-center gap-2.5 transition-colors"
              >
                <span className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700/50 flex items-center justify-center flex-shrink-0">
                  <HomeIcon className="w-4 h-4 text-emerald-300" />
                </span>
                Tengo espacio disponible
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
