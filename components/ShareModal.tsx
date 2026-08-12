"use client";

import React from 'react';
import { X, CheckCircle2, MessageSquare, Key, Copy, Share2 } from 'lucide-react';
import { Listing } from '../lib/types';

interface ShareModalProps {
  listing: Listing | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ listing, onClose }) => {
  if (!listing) return null;

  const shareText = encodeURIComponent(
    `🇨🇴 ¡Hola! He publicado un ${
      listing.tipo === 'ofrezco' ? 'oferta de alojamiento' : 'solicitud de refugio'
    } en ${listing.ciudad} (${listing.barrio}) en Alojamiento Solidario Colombia: "${
      listing.descripcion
    }"`
  );
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${shareText}`;

  const copyPinToClipboard = () => {
    if (listing.pin) {
      navigator.clipboard.writeText(listing.pin);
      alert('PIN copiado al portapapeles.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-solidarity-500/40 shadow-2xl text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-full bg-solidarity-500/20 text-emerald-400 border border-solidarity-500/40 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">¡Publicación Exitosa! 🎉</h2>
        <p className="text-xs text-slate-300 mb-6">
          Tu publicación ya está activa y visible en el feed público para ayuda inmediata.
        </p>

        {/* Secret Author PIN Card */}
        {listing.pin && (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 mb-6 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-amber-400" /> Clave de Edición (PIN):
              </span>
              <button
                onClick={copyPinToClipboard}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-mono"
              >
                <Copy className="w-3 h-3" /> Copiar
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
          className="text-xs text-slate-400 hover:text-white font-medium py-2"
        >
          Ir al Feed Principal
        </button>
      </div>
    </div>
  );
};
