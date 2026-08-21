"use client";

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ArrowUpDown } from 'lucide-react';
import { FilterState, SortOption } from '../lib/types';
import { getZonesForCityName } from '../lib/zones';

/** Debounce (ms) before a Barrio keystroke actually triggers a refetch —
 * see the note above the input below for why this exists. */
const BARRIO_DEBOUNCE_MS = 400;

export const SORT_LABELS: Record<SortOption, string> = {
  recientes: 'Más recientes',
  precio_asc: 'Precio: menor a mayor',
  precio_desc: 'Precio: mayor a menor',
  personas_desc: 'Más personas',
};

interface FilterFieldsProps {
  filters: FilterState;
  onChangeFilter: (updated: Partial<FilterState>) => void;
  hideTipoFilter?: boolean;
}

/**
 * The actual filter/sort inputs (Tipo, Zona, Barrio, Precio, Ordenar),
 * extracted out of SearchFilters.tsx (US-4.9) so the same fields render
 * identically in both places that need them: the always-open desktop panel
 * (lg:+) and the mobile FilterSheet modal — instead of two copies of the
 * same 5 form controls drifting apart over time.
 */
export const FilterFields: React.FC<FilterFieldsProps> = ({
  filters,
  onChangeFilter,
  hideTipoFilter = false,
}) => {
  const zones = getZonesForCityName(filters.ciudad);

  // Barrio is free text driving a live API refetch (CityFeedPage's
  // loadListings effect re-runs whenever `filters` changes), so without
  // debouncing, every single keystroke flipped isLoading -> true and
  // flashed the ListingGrid skeleton mid-type. `barrioDraft` gives the
  // input instant local feedback while typing; onChangeFilter (and the
  // refetch it triggers) only fires once typing pauses. Synced back from
  // `filters.barrio` so external changes (a chip's "×", "Limpiar filtros")
  // still update this field immediately, no debounce on the way in.
  const [barrioDraft, setBarrioDraft] = useState(filters.barrio);
  const barrioTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setBarrioDraft(filters.barrio);
  }, [filters.barrio]);

  useEffect(() => {
    return () => {
      if (barrioTimeoutRef.current) clearTimeout(barrioTimeoutRef.current);
    };
  }, []);

  const handleBarrioChange = (value: string) => {
    setBarrioDraft(value);
    if (barrioTimeoutRef.current) clearTimeout(barrioTimeoutRef.current);
    barrioTimeoutRef.current = setTimeout(() => {
      onChangeFilter({ barrio: value });
    }, BARRIO_DEBOUNCE_MS);
  };

  return (
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
            value={barrioDraft}
            onChange={(e) => handleBarrioChange(e.target.value)}
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
  );
};
