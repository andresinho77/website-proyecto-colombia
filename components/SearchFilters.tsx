"use client";

import React from 'react';
import { MapPin, Filter, RefreshCw, X, ArrowUpDown } from 'lucide-react';
import { FilterState, SortOption } from '../lib/types';
import { getZonesForCityName } from '../lib/zones';

const SORT_LABELS: Record<SortOption, string> = {
  recientes: 'Más recientes',
  precio_asc: 'Precio: menor a mayor',
  precio_desc: 'Precio: mayor a menor',
  personas_desc: 'Más personas',
};

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
  const zones = getZonesForCityName(filters.ciudad);

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
    <div className="glass-card p-5 rounded-2xl mb-8">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-800">
        <Filter className="w-5 h-5 text-emerald-700" />
        <h3 className="font-display font-semibold text-slate-100 text-base">Filtros de búsqueda</h3>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
          {totalResults} {totalResults === 1 ? 'publicación' : 'publicaciones'}
        </span>
      </div>

      {/* Filter Inputs Grid — city is fixed by the page (see Navbar's city
          switcher), not filterable here */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">

        {/* Tipo Filter — hidden on the dedicated /necesito|/ofrezco routes (US-4.5) */}
        {!hideTipoFilter && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tipo de Publicación
            </label>
            <select
              value={filters.tipo}
              onChange={(e) => onChangeFilter({ tipo: e.target.value })}
              className="touch-target w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="todos">Todos (Ofrezco y Necesito)</option>
              <option value="ofrezco">Ofrezco alojamiento</option>
              <option value="necesito">Necesito alojamiento</option>
            </select>
          </div>
        )}

        {/* Zone Filter (US-4.4) — a short, curated per-city list (Norte/
            Sur/Centro/...) to jump quickly to the right area of the feed. */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Zona
          </label>
          <select
            value={filters.zona}
            onChange={(e) => onChangeFilter({ zona: e.target.value })}
            className="touch-target w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="">Todas las zonas</option>
            {zones.map((zona) => (
              <option key={zona} value={zona}>
                {zona}
              </option>
            ))}
          </select>
        </div>

        {/* Barrio Free Text Search (US-4.2) — narrower than Zona, for
            someone searching a specific neighborhood by name. */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Barrio (Texto libre)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ej: Circunvalar, Cuba..."
              value={filters.barrio}
              onChange={(e) => onChangeFilter({ barrio: e.target.value })}
              className="touch-target w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-emerald-500 placeholder-slate-500"
            />
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        {/* Price Filter (US-4.2) */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Precio Máximo (COP)
          </label>
          <select
            value={filters.maxPrecio}
            onChange={(e) => onChangeFilter({ maxPrecio: e.target.value })}
            className="touch-target w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="">Cualquier precio</option>
            <option value="0">Solo $0 (Gratis)</option>
            <option value="200000">Hasta $200.000 / mes</option>
            <option value="500000">Hasta $500.000 / mes</option>
          </select>
        </div>

        {/* Sort Control (US-4.7) — applies to whatever page of results is
            already loaded; see CityFeedPage for the client-side sort. */}
        <div>
          <label htmlFor="sort-by-select" className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            Ordenar por
          </label>
          <select
            id="sort-by-select"
            value={filters.sortBy || 'recientes'}
            onChange={(e) => onChangeFilter({ sortBy: e.target.value as SortOption })}
            className="touch-target w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
              <option key={opt} value={opt}>
                {SORT_LABELS[opt]}
              </option>
            ))}
          </select>
        </div>
      </div>

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
  );
};
