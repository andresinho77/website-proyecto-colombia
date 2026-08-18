"use client";

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Users,
  Calendar,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { Listing } from '../lib/types';
import { reportListing, resolveListing, getContactLink } from '../lib/api';
import { getMyListings } from '../lib/localStorage';

interface ListingCardProps {
  listing: Listing;
  onShareWhatsApp?: (listing: Listing) => void;
  onRefresh?: () => void;
  /** US-6.5: invisible Turnstile token from the feed page, sent along with
   * the contact-reveal request. `null`/`undefined` (widget not loaded yet,
   * blocked, or no site key configured) is a valid state — the reveal call
   * still goes through, just without anti-scraping backing for this click. */
  turnstileToken?: string | null;
  /** Called after a reveal attempt so the feed page can refresh the token
   * (tokens are meant to be single-use once the backend validates them). */
  onTurnstileConsumed?: () => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onShareWhatsApp,
  onRefresh,
  turnstileToken,
  onTurnstileConsumed,
}) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isReporting, setIsReporting] = useState(false);
  const [reportedMsg, setReportedMsg] = useState<string | null>(null);
  const [isContacting, setIsContacting] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // Author PIN resolution modal state
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [inputPin, setInputPin] = useState('');
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  // Dismiss the resolve modal on Escape while open.
  useEffect(() => {
    if (!showResolveModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowResolveModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResolveModal]);

  const isOfrezco = listing.tipo === 'ofrezco';
  const hasImages = listing.imagenes && listing.imagenes.length > 0;
  // Zona (US-4.4) is the required, filterable location; barrio is optional
  // free text the author can add for extra precision — shown alongside when present.
  const location = listing.barrio ? `${listing.zona} · ${listing.barrio}` : listing.zona;

  // Check if current user is the author via localStorage
  const myListings = getMyListings();
  const myListingLocal = myListings.find((l) => l.id === listing.id);
  const isAuthor = !!myListingLocal;

  // US-5.1 + US-6.5: the number is no longer read directly off `listing` —
  // it's fetched on demand via getContactLink so a real backend can
  // rate-limit/Turnstile-gate the reveal per click instead of handing every
  // number to anyone who scripts a request against the public feed.
  const buildWhatsAppUrl = (whatsapp: string) => {
    const cleanPhone = whatsapp.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Hola, vi tu publicación en Alojamiento Solidario Colombia (${
        isOfrezco ? 'Ofrezco' : 'Necesito'
      } en ${listing.ciudad}, ${location}) [Ref: ${listing.id.substring(
        0,
        6
      )}]. ¿Podemos hablar?`
    );
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  const handleContactClick = async () => {
    setContactError(null);
    setIsContacting(true);

    // Open the tab synchronously, inside the click handler's own call stack
    // — once we `await` below we're no longer in the original user gesture,
    // and Safari (reliably) and Chrome (in some conditions) silently block
    // a `window.open()` issued after that point, treating it as an
    // unrequested popup rather than a user-initiated navigation. Opening a
    // blank tab now and redirecting it once the number resolves keeps this
    // tied to the gesture either way.
    //
    // Deliberately NOT passing 'noopener'/'noreferrer' here: either one
    // makes the browser return `null` instead of a window reference (spec
    // behavior — noreferrer implies noopener), which is exactly the
    // reference this code needs to redirect the tab once the number
    // resolves. Safe to omit because we set this tab's location ourselves,
    // right below, to a URL we build (wa.me + our own sanitized text) — the
    // opened page never runs attacker-controlled content that could abuse
    // `window.opener`.
    const pendingTab = window.open('', '_blank');

    const res = await getContactLink(listing.id, turnstileToken);
    setIsContacting(false);
    onTurnstileConsumed?.();

    if (!res.success || !res.whatsapp) {
      pendingTab?.close();
      setContactError(res.error || 'No se pudo obtener el contacto. Intenta de nuevo.');
      return;
    }
    if (pendingTab) {
      pendingTab.location.href = buildWhatsAppUrl(res.whatsapp);
    } else {
      // Popup was blocked even for the synchronous open (e.g. browser
      // setting disabling new tabs outright) — fall back to same-tab nav
      // rather than silently doing nothing.
      window.location.href = buildWhatsAppUrl(res.whatsapp);
    }
  };

  // US-6.1: Report listing handler
  const handleReport = async () => {
    if (!confirm('¿Desea reportar esta publicación como sospechosa o inapropiada?')) return;
    setIsReporting(true);
    const res = await reportListing(listing.id);
    setIsReporting(false);
    if (res.success) {
      setReportedMsg('Gracias. Reporte enviado a moderación.');
      if (onRefresh) onRefresh();
    }
  };

  // US-6.3: Author resolve handler
  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResolveError(null);
    setIsResolving(true);

    const pinToSubmit = inputPin.trim() || myListingLocal?.pin || '';
    const res = await resolveListing(listing.id, pinToSubmit);

    setIsResolving(false);
    if (res.success) {
      setShowResolveModal(false);
      if (onRefresh) onRefresh();
    } else {
      setResolveError(res.error || 'PIN incorrecto.');
    }
  };

  return (
    <div className="glass-card glass-card-hover rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
      <div>
        {/* Header & Badges */}
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isOfrezco
                  ? 'bg-solidarity-950 border border-solidarity-500/40 text-emerald-300'
                  : 'bg-rose-950 border border-rose-500/40 text-rose-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isOfrezco ? 'OFREZCO ALOJAMIENTO' : 'NECESITO ALOJAMIENTO'}
            </span>

            <span className="text-xs font-bold text-slate-300 bg-slate-900/90 border border-slate-700/60 px-2.5 py-1 rounded-lg">
              {listing.precio === 0 ? (
                <span className="text-emerald-700">Gratis ($0)</span>
              ) : (
                `$${listing.precio.toLocaleString('es-CO')} COP`
              )}
            </span>
          </div>

          {/* Location & Barrio */}
          <h3 className="font-display text-lg font-semibold text-slate-100 mb-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            {listing.ciudad},{' '}
            <span className="font-semibold text-slate-300">{location}</span>
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2 font-medium">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              {listing.personas} {listing.personas === 1 ? 'persona' : 'personas'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Desde: {listing.fechaDesde}
              {listing.fechaHasta ? ` hasta ${listing.fechaHasta}` : ' (Indefinido)'}
            </span>
          </div>
        </div>

        {/* Image Carousel (if photos uploaded via S3 pre-signed URL) */}
        {hasImages && (
          <div className="relative w-full h-48 bg-slate-900 overflow-hidden my-2 border-y border-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={listing.imagenes![currentImgIndex]}
              alt={`Foto de espacio en ${location}`}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />

            {listing.imagenes!.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImgIndex((prev) =>
                      prev === 0 ? listing.imagenes!.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setCurrentImgIndex((prev) =>
                      prev === listing.imagenes!.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/60 text-[10px] text-white">
                  {currentImgIndex + 1} / {listing.imagenes!.length}
                </div>
              </>
            )}
          </div>
        )}

        {/* Description (max 280 chars) */}
        <div className="px-5 py-2">
          <p className="text-slate-300 text-sm leading-relaxed font-normal bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
            &ldquo;{listing.descripcion}&rdquo;
          </p>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-5 pt-3 border-t border-slate-800/80 space-y-3">
        {/* US-5.1 + US-6.5: reveal-on-click instead of a static href — the
            number is fetched (and, once backend ships it, rate-limited)
            per click rather than baked into the page. */}
        <button
          onClick={handleContactClick}
          disabled={isContacting}
          className="touch-target w-full py-2.5 rounded-xl bg-solidarity-600 hover:bg-solidarity-500 disabled:opacity-60 text-white font-bold text-sm shadow-md shadow-solidarity-950/50 flex items-center justify-center gap-2 transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          {isContacting ? 'Abriendo WhatsApp…' : 'Contactar por WhatsApp (+57)'}
        </button>
        {contactError && (
          <p className="text-[11px] text-rose-400 text-center font-medium">{contactError}</p>
        )}
        <p className="flex items-center justify-center gap-1 text-[10px] text-slate-500">
          <ShieldAlert className="w-3 h-3 text-amber-500 flex-shrink-0" />
          Nunca compartas datos bancarios ni pagues por adelantado.
        </p>

        {/* Secondary Utility Buttons */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* US-2.2: Share Button */}
          {onShareWhatsApp && (
            <button
              onClick={() => onShareWhatsApp(listing)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors py-1"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-700" />
              Compartir
            </button>
          )}

          {/* US-6.3: Author Mark as Resolved */}
          <button
            onClick={() => setShowResolveModal(true)}
            className={`text-xs flex items-center gap-1 font-medium transition-colors py-1 ${
              isAuthor ? 'text-amber-400 hover:text-amber-300' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Marcar resuelta
          </button>

          {/* US-6.1: Report Button */}
          <button
            onClick={handleReport}
            disabled={isReporting}
            className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors py-1"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Reportar
          </button>
        </div>

        {reportedMsg && (
          <p className="text-[11px] text-amber-400 text-center font-medium">{reportedMsg}</p>
        )}
      </div>

      {/* Resolve PIN Modal */}
      {showResolveModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-4 py-8 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowResolveModal(false);
          }}
        >
          <div className="glass-card max-w-sm w-full p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-2 text-amber-400 mb-3">
              <Lock className="w-5 h-5" />
              <h3 className="font-display font-semibold text-slate-100 text-base">Marcar como resuelta</h3>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Si esta publicación ya fue atendida, ingresa el PIN de 4 dígitos generado al publicar para retirarla del feed público.
            </p>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  PIN de 4 dígitos
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder={myListingLocal?.pin || 'Ej: 1234'}
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-center text-lg tracking-widest font-mono focus:border-amber-400 focus:outline-none"
                />
                {myListingLocal && (
                  <p className="text-[11px] text-emerald-700 mt-1">
                    ✓ PIN detectado automáticamente en este dispositivo.
                  </p>
                )}
              </div>

              {resolveError && (
                <p className="text-xs text-rose-400 font-semibold">{resolveError}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isResolving}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
                >
                  {isResolving ? 'Procesando...' : 'Confirmar Resuelta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
