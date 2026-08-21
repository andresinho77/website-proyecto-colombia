"use client";

import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { Listing } from '../lib/types';
import { useContactReveal } from '../lib/useContactReveal';

interface MapPopupCardProps {
  listing: Listing;
  turnstileToken?: string | null;
  onTurnstileConsumed?: () => void;
}

/**
 * Compact listing summary shown inside a map pin's Leaflet Popup (US-4.3).
 * Deliberately NOT the full ListingCard — a map popup has limited width and
 * only needs enough to identify the listing and act on it; report/resolve
 * stay list-only. Contact reveal reuses useContactReveal (lib/) so this
 * shares the exact popup-blocker-safe behavior ListingCard already has,
 * instead of a second, subtly different implementation.
 */
export const MapPopupCard: React.FC<MapPopupCardProps> = ({
  listing,
  turnstileToken,
  onTurnstileConsumed,
}) => {
  const { isContacting, contactError, handleContactClick } = useContactReveal(
    listing,
    turnstileToken,
    onTurnstileConsumed
  );
  const isOfrezco = listing.tipo === 'ofrezco';
  const location = listing.barrio ? `${listing.zona} · ${listing.barrio}` : listing.zona;

  return (
    <div className="w-56 text-slate-100">
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
          isOfrezco
            ? 'bg-solidarity-950 border border-solidarity-500/40 text-emerald-300'
            : 'bg-rose-950 border border-rose-500/40 text-rose-300'
        }`}
      >
        <Sparkles className="w-3 h-3" />
        {isOfrezco ? 'Ofrezco' : 'Necesito'}
      </span>
      <p className="text-xs font-semibold text-slate-100">{location}</p>
      <p className="text-xs text-slate-300 mt-1 line-clamp-3">{listing.descripcion}</p>
      <p className="text-xs font-bold text-slate-200 mt-1.5">
        {listing.precio === 0 ? 'Gratis ($0)' : `$${listing.precio.toLocaleString('es-CO')} COP`}
      </p>

      <button
        type="button"
        onClick={handleContactClick}
        disabled={isContacting}
        className="touch-target w-full mt-2 py-2 rounded-lg bg-whatsapp-600 hover:bg-whatsapp-500 disabled:opacity-60 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        {isContacting ? 'Abriendo…' : 'Contactar por WhatsApp'}
      </button>
      {contactError && (
        <p className="text-[10px] text-rose-400 text-center font-medium mt-1">{contactError}</p>
      )}
    </div>
  );
};
