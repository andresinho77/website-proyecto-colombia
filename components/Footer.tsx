"use client";

import React from 'react';
import Link from 'next/link';
import { HeartHandshake, ShieldCheck, ExternalLink } from 'lucide-react';

const OFFICIAL_CHANNELS = [
  { label: 'Cruz Roja Colombiana', href: 'https://www.cruzrojacolombiana.org/' },
  { label: 'UNGRD', href: 'https://www.gestiondelriesgo.gov.co/' },
  { label: 'Canales oficiales de alcaldías (gov.co)', href: 'https://www.gov.co/' },
];

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-footer py-10 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-end justify-between gap-6">

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/50 border border-emerald-700/40 flex items-center justify-center text-emerald-700">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-semibold text-slate-100 text-sm block">
                Alojamiento Solidario Colombia
              </span>
              <span className="text-slate-500 text-[11px]">
                Iniciativa ciudadana de ayuda humanitaria para la emergencia telúrica de 2026.
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-300 font-medium">
            {/* "Ver Feed Publicaciones" removed (2026-08-21): redundant with
                IntentNavBar, whose tabs already put the feed one click away
                on every page — same reasoning as dropping it from Navbar. */}

            {/* Single privacy entry point (2026-08-21): this used to sit
                alongside a "Política de Privacidad" button that opened
                PrivacyPolicyModal — a near-duplicate of this same page with
                slightly different wording. The modal is retired; its one
                unique section (§5, security/no-commercialization) was
                merged into this page instead of keeping two surfaces to
                keep aligned. */}
            <Link href="/terminos-y-privacidad" className="hover:text-emerald-700 transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Política de Privacidad / Habeas Data
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-footer-divider">
          <span className="block text-center text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-3">
            Canales oficiales de ayuda
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-slate-300 font-medium">
            {OFFICIAL_CHANNELS.map((channel) => (
              <a
                key={channel.href}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${channel.label} (sitio externo, se abre en una pestaña nueva)`}
                className="hover:text-emerald-700 transition-colors flex items-center gap-1"
              >
                {channel.label}
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-footer-divider text-center text-slate-500 text-[11px] font-light">
          Plataforma 100% gratuita y sin ánimo de lucro. El contacto ocurre fuera de la app directamente entre las partes vía WhatsApp.
        </div>
      </div>
    </footer>
  );
};
