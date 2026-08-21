"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Search, Building2, MapPin, Check, Globe } from 'lucide-react';
import {
  findLocationByLegacyCity,
  getDepartmentBySlug,
  searchLocationsAndDepartments,
  getPriorityLocations,
  LocationCity,
  LocationDepartment,
  getDepartments,
} from '../lib/locations';
import { PREFERRED_CITY_STORAGE_KEY } from '../lib/cities';

interface CitySwitcherProps {
  currentSlug?: string;
  currentDeptSlug?: string;
  isDepartmentMode?: boolean;
  isNationalMode?: boolean;
  /** "chip" = small badge next to the desktop title. "title" = the mobile
   * navbar's primary identity (replaces the app name on small screens). */
  variant?: 'chip' | 'title';
  className?: string;
}

export const CitySwitcher: React.FC<CitySwitcherProps> = ({
  currentSlug = 'pereira',
  currentDeptSlug,
  isDepartmentMode = false,
  isNationalMode = false,
  variant = 'chip',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Resolve display name for current view
  const currentDept = useMemo(() => {
    if (currentDeptSlug) return getDepartmentBySlug(currentDeptSlug);
    return undefined;
  }, [currentDeptSlug]);

  const currentCity = useMemo(() => {
    if (isDepartmentMode || isNationalMode) return undefined;
    const loc = findLocationByLegacyCity(currentSlug);
    return loc || { name: 'Pereira', slug: 'pereira', departmentName: 'Risaralda', departmentSlug: 'risaralda' };
  }, [currentSlug, isDepartmentMode, isNationalMode]);

  const displayName = isNationalMode
    ? 'Toda Colombia'
    : isDepartmentMode
    ? (currentDept ? `Dpto. ${currentDept.name}` : 'Departamento')
    : (currentCity?.name || 'Pereira');

  const priorityLocations = useMemo(() => getPriorityLocations(), []);
  const priorityDepartments = useMemo(
    () => getDepartments().filter((d) => d.isPriority),
    []
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return {
        // slice(0, 5): matches the 5 earthquake-priority departments exactly
        // (Chocó, Valle del Cauca, Risaralda, Caldas, Quindío — see
        // lib/colombia-locations.json's isPriority flags). Was slice(0, 4),
        // which would have silently dropped one of the 5 from this default
        // view — bump this if the priority set ever grows again.
        departments: priorityDepartments.slice(0, 5),
        cities: priorityLocations.slice(0, 10),
      };
    }
    return searchLocationsAndDepartments(searchQuery);
  }, [searchQuery, priorityDepartments, priorityLocations]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      return;
    }
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);

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

  const handleSelectNational = () => {
    setIsOpen(false);
    router.push('/');
  };

  const handleSelectCity = (loc: LocationCity) => {
    setIsOpen(false);
    try {
      window.localStorage.setItem(PREFERRED_CITY_STORAGE_KEY, loc.slug);
    } catch {
      // ignore
    }
    router.push(`/${loc.slug}/`);
  };

  const handleSelectDepartment = (dept: LocationDepartment) => {
    setIsOpen(false);
    router.push(`/departamento/${dept.slug}/`);
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
        {/* Flag emoji baked into the displayName string (with a literal
            space) rendered inconsistently — flag glyphs (regional-indicator
            pairs) can eat the following space depending on the emoji font,
            so it's split into its own element with an explicit margin
            instead of relying on a text-space character. */}
        {isNationalMode && <span className="mr-1.5" aria-hidden="true">🇨🇴</span>}
        <span>{displayName}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-2 w-72 rounded-2xl shadow-2xl py-2 z-50 bg-slate-950 border border-slate-800 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Search Bar */}
          <div className="px-2.5 pb-2 border-b border-slate-800">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar municipio o departamento..."
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg pl-8 pr-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-500"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto pt-1 custom-scrollbar space-y-2">
            {/* National Level Option */}
            <div>
              <button
                type="button"
                role="option"
                aria-selected={isNationalMode}
                onClick={handleSelectNational}
                className={`w-full text-left px-3 py-1.5 text-xs sm:text-sm flex items-center justify-between transition-colors ${
                  isNationalMode
                    ? 'text-amber-300 font-semibold bg-amber-950/40'
                    : 'text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-medium text-slate-100">Toda Colombia</span>
                  <span className="text-[11px] text-slate-400">(Nacional)</span>
                </div>
                {isNationalMode && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            </div>

            {/* Departments Section */}
            {searchResults.departments.length > 0 && (
              <div>
                <div className="flex items-center gap-1 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                  <Building2 className="w-3 h-3" /> Departamentos
                </div>
                {searchResults.departments.map((dept) => {
                  const isSelected = isDepartmentMode && currentDeptSlug === dept.slug;
                  return (
                    <button
                      key={`dept-${dept.slug}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelectDepartment(dept)}
                      className={`w-full text-left px-3 py-1.5 text-xs sm:text-sm flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'text-indigo-300 font-semibold bg-indigo-950/40'
                          : 'text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-100">{dept.name}</span>
                        <span className="text-[11px] text-slate-400">(Todo el depto.)</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Cities Section */}
            <div>
              <div className="flex items-center gap-1 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                <MapPin className="w-3 h-3" /> {searchQuery ? 'Municipios y Ciudades' : 'Ciudades Principales'}
              </div>

              {searchResults.cities.length === 0 && searchResults.departments.length === 0 ? (
                <div className="px-3 py-3 text-center text-xs text-slate-400">
                  Sin resultados
                </div>
              ) : (
                searchResults.cities.map((loc) => {
                  const isSelected = !isDepartmentMode && !isNationalMode && loc.slug === currentCity?.slug;
                  return (
                    <button
                      key={`city-${loc.slug}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelectCity(loc)}
                      className={`w-full text-left px-3 py-1.5 text-xs sm:text-sm flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'text-emerald-400 font-semibold bg-emerald-950/40'
                          : 'text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <div>
                        <span className="font-medium text-slate-100">{loc.name}</span>
                        <span className="text-slate-400 text-xs ml-1.5 font-normal">
                          ({loc.departmentName})
                        </span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
