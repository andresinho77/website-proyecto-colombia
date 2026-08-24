"use client";

import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, MessageSquare, Key, Copy, Check, Link2, Share2 } from 'lucide-react';
import { Listing } from '../lib/types';
import { getListingUrl } from '../lib/listingUrl';

/**
 * `published` — the post-publish confirmation (US-2.2): congratulates the
 * author and hands them their secret edit PIN.
 *
 * `share` — the feed card's "Compartir" button. Same sheet, but it's someone
 * passing a listing along, which changes two things that matter: the copy
 * can't claim "tu publicación", and the PIN block must not render at all.
 * The PIN is the author's only credential for marking a listing resolved,
 * and listings reaching this modal from the feed can still carry one (the
 * offline MOCK_LISTINGS fallback in lib/api.ts includes `pin`), so gating
 * it on the variant — not on `listing.pin` being present — is what keeps
 * it from being shown to a stranger.
 */
export type ShareModalVariant = 'published' | 'share';

interface ShareModalProps {
  listing: Listing | null;
  onClose: () => void;
  variant?: ShareModalVariant;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  listing,
  onClose,
  variant = 'published',
}) => {
  const [copied, setCopied] = useState<'link' | 'pin' | null>(null);

  // Dismiss on Escape while open. Runs unconditionally (before the
  // `!listing` early return) so hook order stays stable across renders.
  useEffect(() => {
    if (!listing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [listing, onClose]);

  // Reset the "¡Copiado!" state when the sheet switches listings or closes,
  // so a reopened modal never starts out claiming something was copied.
  useEffect(() => {
    setCopied(null);
  }, [listing]);

  if (!listing) return null;

  const isPublished = variant === 'published';
  const location = listing.barrio ? `${listing.zona} · ${listing.barrio}` : listing.zona;
  const postUrl = getListingUrl(listing);
  const tipoLabel =
    listing.tipo === 'ofrezco' ? 'oferta de alojamiento' : 'solicitud de refugio';

  // El enlace va al final y en su propia línea: WhatsApp solo lo convierte
  // en enlace tocable si queda aislado, y pegado a un signo de puntuación
  // (la comilla de cierre de la descripción) se lo traga como parte de la URL.
  const shareBody = isPublished
    ? `¡Hola! He publicado una ${tipoLabel} en ${listing.ciudad} (${location}) en Alojamiento Solidario Colombia: "${listing.descripcion}"`
    : `Mira esta ${tipoLabel} en ${listing.ciudad} (${location}) en Alojamiento Solidario Colombia: "${listing.descripcion}"`;

  const shareText = encodeURIComponent(`${shareBody}\n\nVer publicación:\n${postUrl}`);
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${shareText}`;

  const copyToClipboard = async (value: string, field: 'link' | 'pin') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(field);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard API is unavailable outside secure contexts (plain http on
      // a phone in the field is a real case here). The link stays selectable
      // in the input below, so there's nothing to recover — just don't crash.
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md grid place-items-center p-4 py-8 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="glass-card max-w-md w-full p-6 rounded-3xl shadow-lg text-center relative">
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-slate-100 flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-full bg-solidarity-500/20 text-emerald-700 border border-solidarity-500/40 flex items-center justify-center mx-auto mb-4">
          {isPublished ? <CheckCircle2 className="w-10 h-10" /> : <Share2 className="w-9 h-9" />}
        </div>

        <h2 className="font-display text-2xl font-semibold text-slate-100 mb-2">
          {isPublished ? 'Publicación exitosa' : 'Compartir publicación'}
        </h2>
        <p className="text-xs text-slate-300 mb-6">
          {isPublished
            ? 'Tu publicación ya está activa y visible en el feed público para ayuda inmediata.'
            : 'Envía el enlace directo a esta publicación. Quien lo abra verá esta tarjeta en el feed.'}
        </p>

        {/* Secret Author PIN Card — solo en el flujo de publicación propia */}
        {isPublished && listing.pin && (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 mb-6 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-amber-400" /> Clave de Edición (PIN):
              </span>
              <button
                onClick={() => copyToClipboard(listing.pin as string, 'pin')}
                className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-mono"
              >
                {copied === 'pin' ? (
                  <>
                    <Check className="w-3 h-3" /> ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copiar
                  </>
                )}
              </button>
            </div>
            <p className="text-2xl font-extrabold text-amber-400 font-mono tracking-widest text-center my-1">
              {listing.pin}
            </p>
            <p className="text-[10px] text-slate-400 text-center">
              Guardado automáticamente en este navegador. Usa este PIN para marcar tu publicación como &ldquo;Resuelta&rdquo;.
            </p>
          </div>
        )}

        {/* Enlace directo a la publicación, visible y copiable */}
        <div className="mb-4 text-left">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-1">
            <Link2 className="w-3.5 h-3.5 text-emerald-700" /> Enlace de la publicación:
          </span>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={postUrl}
              aria-label="Enlace de la publicación"
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-[11px] text-slate-300 font-mono truncate"
            />
            <button
              onClick={() => copyToClipboard(postUrl, 'link')}
              className="touch-target flex-shrink-0 px-3 py-2 rounded-xl border border-slate-700/80 bg-slate-900/90 text-[11px] font-semibold text-slate-200 hover:text-white hover:border-slate-600 flex items-center gap-1 transition-colors"
            >
              {copied === 'link' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" /> ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copiar
                </>
              )}
            </button>
          </div>
        </div>

        {/* US-2.2: Share via WhatsApp Action Button */}
        <a
          href={whatsappShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="touch-target w-full py-3 rounded-xl bg-solidarity-600 hover:bg-solidarity-500 text-white font-bold text-sm shadow-lg shadow-solidarity-950/50 flex items-center justify-center gap-2 transition-all mb-3"
        >
          <MessageSquare className="w-5 h-5" />
          Compartir por WhatsApp 📲
        </a>

        <button
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-slate-100 font-medium py-2"
        >
          {isPublished ? 'Ir al Feed Principal' : 'Cerrar'}
        </button>
      </div>
    </div>
  );
};
