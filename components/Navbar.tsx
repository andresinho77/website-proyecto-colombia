"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, HeartHandshake } from 'lucide-react';
import { CitySwitcher } from './CitySwitcher';

interface NavbarProps {
  currentCitySlug?: string;
  currentDeptSlug?: string;
  isDepartmentFeed?: boolean;
  isNationalFeed?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCitySlug = 'pereira',
  currentDeptSlug,
  isDepartmentFeed = false,
  isNationalFeed = false,
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

          {/* Persistent Header Navigation (US-1.2). "Feed de Alojamientos"
              and "Publicar Espacio" were removed (2026-08-21): both are now
              redundant with IntentNavBar, which sits right below this bar on
              every page — its tabs already surface the feed and its "+"
              button already covers publish. */}
          <nav className="flex items-center gap-1.5 sm:gap-4 flex-shrink-0">
            {/* Mobile (below lg): no hover exists, so always show the short
                "Habeas Data" label next to the icon instead of hiding it
                behind an interaction nobody on touch can trigger. Desktop
                (lg+): icon-only, hover/focus slides the fuller label in from
                the right (max-width + translate-x, both animated). */}
            <Link
              href="/terminos-y-privacidad"
              aria-label="Política de privacidad / Habeas Data"
              className="group touch-target h-9 pl-2.5 pr-3 lg:pr-2.5 lg:hover:pr-3.5 lg:focus-visible:pr-3.5 rounded-full text-slate-400 hover:text-slate-200 focus-visible:text-slate-200 hover:bg-slate-800/60 focus-visible:bg-slate-800/60 flex items-center overflow-hidden transition-[padding,background-color,color] duration-300"
            >
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span className="ml-1.5 lg:hidden whitespace-nowrap text-xs font-medium">
                Habeas Data
              </span>
              <span className="hidden lg:inline-block max-w-0 group-hover:max-w-[220px] group-focus-visible:max-w-[220px] opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 -translate-x-2 group-hover:translate-x-0 group-focus-visible:translate-x-0 ml-0 group-hover:ml-2 group-focus-visible:ml-2 whitespace-nowrap overflow-hidden text-xs font-medium transition-all duration-300 ease-out">
                Política de privacidad / Habeas Data
              </span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
