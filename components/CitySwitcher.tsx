"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { CITIES, getCityBySlug, PREFERRED_CITY_STORAGE_KEY } from '../lib/cities';

interface CitySwitcherProps {
  currentSlug: string;
  /** "chip" = small badge next to the desktop title. "title" = the mobile
   * navbar's primary identity (replaces the app name on small screens). */
  variant?: 'chip' | 'title';
  className?: string;
}

export const CitySwitcher: React.FC<CitySwitcherProps> = ({
  currentSlug,
  variant = 'chip',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const current = getCityBySlug(currentSlug) ?? CITIES[0];

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    if (slug === currentSlug) return;
    try {
      window.localStorage.setItem(PREFERRED_CITY_STORAGE_KEY, slug);
    } catch {
      // localStorage unavailable (private mode, etc.) — navigation still works.
    }
    router.push(`/${slug}/`);
  };

  const triggerClasses =
    variant === 'chip'
      ? 'min-w-[104px] justify-center text-sm px-3.5 py-1.5 rounded-full bg-transparent text-slate-100 border border-slate-700 font-medium hover:bg-slate-900 transition-colors'
      : 'font-display font-semibold text-lg tracking-tight text-slate-100';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`touch-target flex items-center gap-1.5 ${triggerClasses}`}
      >
        <span>{current.name}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-2 w-44 rounded-xl shadow-lg py-1.5 z-50 overflow-hidden bg-slate-950 border border-slate-800"
        >
          {CITIES.map((city) => (
            <button
              key={city.slug}
              type="button"
              role="option"
              aria-selected={city.slug === currentSlug}
              onClick={() => handleSelect(city.slug)}
              className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${
                city.slug === currentSlug
                  ? 'text-emerald-700 font-semibold bg-emerald-50'
                  : 'text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
