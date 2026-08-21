"use client";

import React, { useState } from 'react';
import { Filter, RefreshCw, X, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { FilterState } from '../lib/types';
import { FilterFields, SORT_LABELS } from './FilterFields';
import { FilterSheet } from './FilterSheet';

interface SearchFiltersProps {
  filters: FilterState;
  onChangeFilter: (updated: Partial<FilterState>) => void;
  onReset: () => void;
  totalResults: number;
  /** US-4.5: hidden on the dedicated /necesito or /ofrezco routes, where the
   * intent is already fixed by the URL, not a filter within the feed. */
  hideTipoFilter?: boolean;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onChangeFilter,
  onReset,
  totalResults,
  hideTipoFilter = false,
}) => {
  // US-4.9: below `lg:`, the full grid of selects used to always render
  // open, pushing the actual listings off the first screen on phones. Now
  // it collapses to a compact trigger bar that opens FilterSheet — the
  // desktop panel (lg:+) is unaffected, still always-open.
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  if (!hideTipoFilter && filters.tipo !== 'todos') {
    chips.push({
      key: 'tipo',
      label: filters.tipo === 'ofrezco' ? 'Ofrezco alojamiento' : 'Necesito alojamiento',
      onRemove: () => onChangeFilter({ tipo: 'todos' }),
    });
  }
  if (filters.zona) {
    chips.push({ key: 'zona', label: `Zona: ${filters.zona}`, onRemove: () => onChangeFilter({ zona: '' }) });
  }
  if (filters.barrio) {
    chips.push({ key: 'barrio', label: `Barrio: ${filters.barrio}`, onRemove: () => onChangeFilter({ barrio: '' }) });
  }
  if (filters.maxPrecio) {
    chips.push({
      key: 'maxPrecio',
      label: filters.maxPrecio === '0' ? 'Solo gratis' : `Hasta $${Number(filters.maxPrecio).toLocaleString('es-CO')}`,
      onRemove: () => onChangeFilter({ maxPrecio: '' }),
    });
  }
  if (filters.sortBy && filters.sortBy !== 'recientes') {
    chips.push({
      key: 'sortBy',
      label: `Orden: ${SORT_LABELS[filters.sortBy]}`,
      onRemove: () => onChangeFilter({ sortBy: 'recientes' }),
    });
  }

  return (
    <>
      {/* Mobile/tablet (<lg): compact trigger instead of the full panel —
          see US-4.9. Chips still render inline here since they're a single
          low-height row and let you drop a filter without reopening the
          sheet at all. */}
      <div className="lg:hidden mb-8">
        <button
          type="button"
          onClick={() => setIsSheetOpen(true)}
          className="touch-target w-full glass-card px-4 py-3 rounded-2xl flex items-center justify-between gap-2"
        >
          <span className="flex items-center gap-2 min-w-0">
            <SlidersHorizontal className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span className="font-semibold text-slate-100 text-sm">Filtros</span>
            {chips.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-700 text-white font-bold flex-shrink-0">
                {chips.length}
              </span>
            )}
            <span className="text-xs text-slate-400 font-mono truncate">
              {totalResults} {totalResults === 1 ? 'publicación' : 'publicaciones'}
            </span>
          </span>
          <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
        </button>

        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onRemove}
                className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/50 text-emerald-200 text-xs font-medium hover:bg-emerald-900/60 hover:border-emerald-500 transition-colors"
              >
                {chip.label}
                <X className="w-3 h-3" />
              </button>
            ))}
            <button
              onClick={onReset}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Limpiar
            </button>
          </div>
        )}
      </div>

      <FilterSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        filters={filters}
        onChangeFilter={onChangeFilter}
        onReset={onReset}
        totalResults={totalResults}
        hideTipoFilter={hideTipoFilter}
      />

      {/* Desktop (lg:+): unchanged always-open panel. */}
      <div className="hidden lg:block glass-card p-5 rounded-2xl mb-8">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-800">
          <Filter className="w-5 h-5 text-emerald-700" />
          <h3 className="font-display font-semibold text-slate-100 text-base">Filtros de búsqueda</h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {totalResults} {totalResults === 1 ? 'publicación' : 'publicaciones'}
          </span>
        </div>

        <FilterFields filters={filters} onChangeFilter={onChangeFilter} hideTipoFilter={hideTipoFilter} />

        {/* Active Filter Chips (US-4.7) — removable one at a time, plus a
            "clear all" action when there's more than one active. */}
        {chips.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onRemove}
                className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/50 text-emerald-200 text-xs font-medium hover:bg-emerald-900/60 hover:border-emerald-500 transition-colors"
              >
                {chip.label}
                <X className="w-3 h-3" />
              </button>
            ))}
            <button
              onClick={onReset}
              className="ml-auto text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </>
  );
};
