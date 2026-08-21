"use client";

import React, { useEffect } from 'react';
import { X, RefreshCw, Filter } from 'lucide-react';
import { FilterState } from '../lib/types';
import { FilterFields } from './FilterFields';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onChangeFilter: (updated: Partial<FilterState>) => void;
  onReset: () => void;
  totalResults: number;
  hideTipoFilter?: boolean;
}

/**
 * US-4.9: mobile filter entry point. Below `lg:`, SearchFilters renders only
 * a compact trigger bar instead of the full always-open grid — that grid
 * was pushing the actual listings out of the first screen on phones. This
 * modal holds the real controls (FilterFields, shared with the desktop
 * panel) behind that trigger, bottom-sheet on narrow screens
 * (items-end + rounded-t-3xl) and a centered dialog from `sm:` up, same
 * overlay convention as PublishModal/ShareModal.
 */
export const FilterSheet: React.FC<FilterSheetProps> = ({
  isOpen,
  onClose,
  filters,
  onChangeFilter,
  onReset,
  totalResults,
  hideTipoFilter = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="glass-card w-full sm:max-w-lg max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-lg flex flex-col">
        <div className="flex items-center justify-between gap-2 px-5 pt-5 pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-emerald-700" />
            <h3 className="font-display font-semibold text-slate-100 text-base">Filtros de búsqueda</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar filtros"
            className="touch-target w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto">
          <FilterFields filters={filters} onChangeFilter={onChangeFilter} hideTipoFilter={hideTipoFilter} />
        </div>

        <div className="px-5 py-4 border-t border-slate-800 flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onReset}
            className="touch-target flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Limpiar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="touch-target flex-1 py-2.5 rounded-xl bg-solidarity-600 hover:bg-solidarity-500 text-white font-semibold text-sm shadow-md shadow-solidarity-900/40 transition-colors"
          >
            Ver {totalResults} {totalResults === 1 ? 'publicación' : 'publicaciones'}
          </button>
        </div>
      </div>
    </div>
  );
};
