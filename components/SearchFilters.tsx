"use client";

import React from 'react';
import { MapPin, Filter, RefreshCw } from 'lucide-react';
import { FilterState } from '../lib/types';

interface SearchFiltersProps {
  filters: FilterState;
  onChangeFilter: (updated: Partial<FilterState>) => void;
  onReset: () => void;
  totalResults: number;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onChangeFilter,
  onReset,
  totalResults,
}) => {
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">

        {/* Tipo Filter */}
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

        {/* Barrio Free Text Search (US-4.2) */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Barrio / Sector (Texto libre)
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
      </div>

      {/* Reset Filters CTA */}
      {(filters.barrio || filters.tipo !== 'todos' || filters.maxPrecio) && (
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onReset}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};
