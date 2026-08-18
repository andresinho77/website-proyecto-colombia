"use client";

import React from 'react';
import { ListingCard } from './ListingCard';
import { Listing } from '../lib/types';
import { AlertCircle, ChevronDown, Loader2 } from 'lucide-react';

interface ListingGridProps {
  listings: Listing[];
  isLoading?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onShareWhatsApp?: (listing: Listing) => void;
  onRefresh?: () => void;
  onOpenPublish?: (defaultTipo?: 'ofrezco' | 'necesito') => void;
  /** US-6.5 — see ListingCard's prop of the same name. */
  turnstileToken?: string | null;
  onTurnstileConsumed?: () => void;
}

export const ListingGrid: React.FC<ListingGridProps> = ({
  listings,
  isLoading,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onShareWhatsApp,
  onRefresh,
  onOpenPublish,
  turnstileToken,
  onTurnstileConsumed,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            className="glass-card rounded-2xl p-6 h-64 animate-pulse border border-slate-800"
          >
            <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-slate-800 rounded w-2/3 mb-4"></div>
            <div className="h-20 bg-slate-900 rounded mb-4"></div>
            <div className="h-10 bg-slate-800 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="glass-card p-12 rounded-2xl text-center max-w-xl mx-auto my-8">
        <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h3 className="font-display text-xl font-semibold text-slate-100 mb-2">No se encontraron publicaciones</h3>
        <p className="text-slate-400 text-sm mb-6">
          No hay alojamientos registrados que coincidan con los filtros seleccionados.
        </p>

        {onOpenPublish && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenPublish('necesito')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-semibold text-xs"
            >
              Publicar necesidad
            </button>
            <button
              onClick={() => onOpenPublish('ofrezco')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs"
            >
              Ofrecer espacio
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onShareWhatsApp={onShareWhatsApp}
            onRefresh={onRefresh}
            turnstileToken={turnstileToken}
            onTurnstileConsumed={onTurnstileConsumed}
          />
        ))}
      </div>

      {/* Pagination "Cargar más" Button */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-4 pb-8">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="touch-target px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white font-semibold text-sm shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Cargando más alojamientos...</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 text-emerald-400" />
                <span>Cargar más publicaciones</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
