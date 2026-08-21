"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, MapPin, Check, X, Sparkles } from 'lucide-react';
import {
  LocationCity,
  searchLocations,
  getPriorityLocations,
  findLocationByLegacyCity,
} from '../lib/locations';

interface LocationComboboxProps {
  value?: string; // City name or slug
  departmentValue?: string; // Optional department name or slug
  onChange: (location: LocationCity) => void;
  placeholder?: string;
  className?: string;
  showPriorityChips?: boolean;
  required?: boolean;
  id?: string;
}

export const LocationCombobox: React.FC<LocationComboboxProps> = ({
  value,
  departmentValue,
  onChange,
  placeholder = 'Buscar ciudad o departamento en Colombia...',
  className = '',
  showPriorityChips = true,
  required = false,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Resolve current selection display
  const selectedLocation = useMemo(() => {
    if (!value) return undefined;
    return findLocationByLegacyCity(value);
  }, [value]);

  const priorityLocations = useMemo(() => getPriorityLocations(), []);

  const searchResults = useMemo(() => {
    return searchLocations(query, 20);
  }, [query]);

  // Sync display text when value prop changes
  useEffect(() => {
    if (selectedLocation) {
      setQuery(`${selectedLocation.name} (${selectedLocation.departmentName})`);
    } else if (value) {
      setQuery(value);
    }
  }, [selectedLocation, value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        // Revert input text to selected label if query was left unfinished
        if (selectedLocation) {
          setQuery(`${selectedLocation.name} (${selectedLocation.departmentName})`);
        } else if (value) {
          setQuery(value);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedLocation, value]);

  const handleSelect = (loc: LocationCity) => {
    setQuery(`${loc.name} (${loc.departmentName})`);
    setIsOpen(false);
    onChange(loc);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % Math.max(1, searchResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev <= 0 ? searchResults.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = searchResults[highlightedIndex];
      if (selected) {
        handleSelect(selected);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuery('');
    setIsOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Combobox Input */}
      <div className="relative flex items-center">
        <MapPin className="w-4 h-4 text-emerald-500 absolute left-3.5 pointer-events-none" />
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="location-results-listbox"
          aria-autocomplete="list"
          required={required}
          value={query}
          onFocus={() => {
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="touch-target w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 placeholder-slate-500 transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1 text-slate-400 hover:text-slate-200 rounded-md transition-colors"
            title="Limpiar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Priority Chips (shown when open and query is short) */}
      {isOpen && showPriorityChips && query.length <= 2 && (
        <div
          id="location-results-listbox"
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 p-2 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Ciudades Principales y Zonas de Emergencia
          </div>
          <div className="flex flex-wrap gap-1.5 p-1 mb-2 border-b border-slate-800/80 pb-2">
            {priorityLocations.slice(0, 8).map((loc) => {
              const isSelected = selectedLocation?.slug === loc.slug;
              return (
                <button
                  key={`${loc.departmentSlug}:${loc.slug}`}
                  type="button"
                  onClick={() => handleSelect(loc)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-slate-50 border border-slate-800'
                  }`}
                >
                  {loc.name}
                </button>
              );
            })}
          </div>

          {/* Results List Header */}
          <div className="px-2 py-1 text-[11px] font-medium text-slate-500">
            Todas las ciudades ({searchResults.length} encontradas)
          </div>

          {/* Scrollable list */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 custom-scrollbar">
            {searchResults.map((loc, idx) => {
              const isSelected = selectedLocation?.slug === loc.slug && selectedLocation?.departmentSlug === loc.departmentSlug;
              const isHighlighted = idx === highlightedIndex;
              return (
                <button
                  key={`${loc.departmentSlug}:${loc.slug}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={() => handleSelect(loc)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm flex items-center justify-between transition-colors ${
                    isHighlighted
                      ? 'bg-slate-800/90 text-slate-50'
                      : 'text-slate-200 hover:bg-slate-900'
                  } ${isSelected ? 'border-l-2 border-emerald-500 font-semibold' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-100">{loc.name}</span>
                    <span className="text-slate-400 text-xs">
                      {loc.departmentName}
                    </span>
                  </div>
                  {loc.isPriority && (
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
                      Prioritaria
                    </span>
                  )}
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 ml-1.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Regular Results List when query length > 2 */}
      {isOpen && (!showPriorityChips || query.length > 2) && (
        <div
          id="location-results-listbox"
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 p-1.5 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100"
        >
          {searchResults.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No se encontraron municipios ni departamentos para &ldquo;{query}&rdquo;.
            </div>
          ) : (
            searchResults.map((loc, idx) => {
              const isSelected = selectedLocation?.slug === loc.slug && selectedLocation?.departmentSlug === loc.departmentSlug;
              const isHighlighted = idx === highlightedIndex;
              return (
                <button
                  key={`${loc.departmentSlug}:${loc.slug}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={() => handleSelect(loc)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm flex items-center justify-between transition-colors ${
                    isHighlighted
                      ? 'bg-slate-800/90 text-slate-50'
                      : 'text-slate-200 hover:bg-slate-900'
                  } ${isSelected ? 'border-l-2 border-emerald-500 font-semibold' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-100">{loc.name}</span>
                    <span className="text-slate-400 text-xs">
                      ({loc.departmentName})
                    </span>
                  </div>
                  {loc.isPriority && (
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
                      Prioritaria
                    </span>
                  )}
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 ml-1.5" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
