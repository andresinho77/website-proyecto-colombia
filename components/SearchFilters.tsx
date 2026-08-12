"use client";

import React from 'react';
import { Search, MapPin, DollarSign, Filter, RefreshCw } from 'lucide-react';
import { FilterState } from '../lib/types';

interface SearchFiltersProps {
  filters: FilterState;
  onChangeFilter: (updated: Partial<FilterState>) => void;
  onReset: () => void;
  totalResults: number;
}

const CITIES = ['Pereira', 'Cali', 'Quibdó', 'Manizales', 'Armenia', 'Condoto', 'Istmina'];

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onChangeFilter,
  onReset,
  totalResults,
}) => {
  return (
    <div className="glass-card p-5 rounded-2xl mb-8 border border-slate-800 shadow-xl">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white text-base">Filtros de Búsqueda</h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {totalResults} {totalResults === 1 ? 'publicación' : 'publicaciones'}
          </span>
        </div>

        {/* Highlighted Quick Cities (US-4.1) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Ciudades:</span>
          {CITIES.map((c) => {
            const isSelected = filters.ciudad.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                onClick={() =>
                  onChangeFilter({ ciudad: isSelected ? '' : c })
                }
                className={`touch-target px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  isSelected
                    ? 'bg-solidarity-600 text-white shadow-md shadow-solidarity-900/50'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Tipo Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Tipo de Publicación
          </label>
          <select
            value={filters.tipo}
            onChange={(e) => onChangeFilter({ tipo: e.target.value })}
            className="touch-target w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="todos">Todos (Ofrezco y Necesito)</option>
            <option value="ofrezco">🏡 Ofrezco Alojamiento</option>
            <option value="necesito">🆘 Necesito Alojamiento</option>
          </select>
        </div>

        {/* Ciudad Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Ciudad
          </label>
          <select
            value={filters.ciudad}
            onChange={(e) => onChangeFilter({ ciudad: e.target.value })}
            className="touch-target w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="">Todas las ciudades</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
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
              className="touch-target w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-emerald-500 placeholder-slate-500"
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
            className="touch-target w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="">Cualquier precio</option>
            <option value="0">Solo $0 (Gratis)</option>
            <option value="200000">Hasta $200.000 / mes</option>
            <option value="500000">Hasta $500.000 / mes</option>
          </select>
        </div>
      </div>

      {/* Reset Filters CTA */}
      {(filters.ciudad || filters.barrio || filters.tipo !== 'todos' || filters.maxPrecio) && (
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
