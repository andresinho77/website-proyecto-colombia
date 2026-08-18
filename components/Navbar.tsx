"use client";

import React from 'react';
import Link from 'next/link';
import { PlusCircle, Search, ShieldAlert, HeartHandshake } from 'lucide-react';
import { CitySwitcher } from './CitySwitcher';

interface NavbarProps {
  currentCitySlug?: string;
  currentDeptSlug?: string;
  isDepartmentFeed?: boolean;
  isNationalFeed?: boolean;
  onOpenPublish?: (defaultTipo?: 'ofrezco' | 'necesito') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCitySlug = 'pereira',
  currentDeptSlug,
  isDepartmentFeed = false,
  isNationalFeed = false,
  onOpenPublish,
}) => {
  const homeHref = isNationalFeed
    ? '/'
    : isDepartmentFeed && currentDeptSlug
    ? `/departamento/${currentDeptSlug}/`
    : `/${currentCitySlug}/`;

  return (
    <header className="sticky top-0 z-40 glass-nav w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 h-16 sm:h-20">

          {/* Logo, Title & City Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-none">
            <Link href={homeHref} className="flex items-center flex-shrink-0 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-700 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </Link>

            {/* Mobile/tablet: current location is the primary identity */}
            <CitySwitcher
              currentSlug={currentCitySlug}
              currentDeptSlug={currentDeptSlug}
              isDepartmentMode={isDepartmentFeed}
              isNationalMode={isNationalFeed}
              variant="title"
              className="md:hidden min-w-0"
            />

            {/* Desktop: full app name + a city/dept chip alongside it */}
            <div className="hidden md:block min-w-0">
              <span className="flex items-center gap-2">
                <Link
                  href={homeHref}
                  className="font-display font-semibold text-xl tracking-tight text-slate-100 truncate"
                >
                  Alojamiento Solidario
                </Link>
                <CitySwitcher
                  currentSlug={currentCitySlug}
                  currentDeptSlug={currentDeptSlug}
                  isDepartmentMode={isDepartmentFeed}
                  isNationalMode={isNationalFeed}
                  variant="chip"
                />
              </span>
            </div>
          </div>

          {/* Persistent Header Navigation (US-1.2) */}
          <nav className="flex items-center gap-1.5 sm:gap-4 flex-shrink-0">
            <Link
              href={`${homeHref}#feed`}
              className="touch-target px-2.5 sm:px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Search className="w-4 h-4 text-emerald-700" />
              <span className="md:hidden">Buscar</span>
              <span className="hidden md:inline">Feed de Alojamientos</span>
            </Link>

            <Link
              href="/terminos-y-privacidad"
              className="touch-target px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-400 hover:text-slate-200 hidden lg:flex items-center gap-1 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-slate-400" />
              Habeas Data
            </Link>

            {onOpenPublish && (
              <button
                onClick={() => onOpenPublish('ofrezco')}
                className="touch-target px-2.5 sm:px-4 py-2 rounded-xl bg-solidarity-600 hover:bg-solidarity-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-solidarity-900/40 flex items-center justify-center gap-2 transition-all hover:shadow-solidarity-600/30"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="md:hidden">Publicar</span>
                <span className="hidden md:inline">Publicar Espacio</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
