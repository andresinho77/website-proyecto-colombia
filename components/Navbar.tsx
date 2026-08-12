"use client";

import React from 'react';
import Link from 'next/link';
import { Home, PlusCircle, Search, ShieldAlert, HeartHandshake } from 'lucide-react';

interface NavbarProps {
  onOpenPublish?: (defaultTipo?: 'ofrezco' | 'necesito') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenPublish }) => {
  return (
    <header className="sticky top-0 z-40 glass-nav w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-solidarity-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-solidarity-900/30 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg sm:text-xl tracking-tight text-white flex items-center gap-2">
                Alojamiento Solidario
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                  🇨🇴 Emergencia
                </span>
              </span>
              <span className="text-xs text-slate-400 block hidden sm:block">
                Respuesta Terremoto 10 de Agosto de 2026
              </span>
            </div>
          </Link>

          {/* Persistent Header Navigation (US-1.2) */}
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/#feed"
              className="touch-target px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-1.5 transition-colors"
            >
              <Search className="w-4 h-4 text-emerald-400" />
              <span className="hidden xs:inline">Feed de</span> Alojamientos
            </Link>

            <Link
              href="/terminos-y-privacidad"
              className="touch-target px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-400 hover:text-slate-200 hidden md:flex items-center gap-1 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-slate-400" />
              Habeas Data
            </Link>

            {onOpenPublish && (
              <button
                onClick={() => onOpenPublish('ofrezco')}
                className="touch-target px-4 py-2 rounded-xl bg-solidarity-600 hover:bg-solidarity-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-solidarity-900/40 flex items-center gap-2 transition-all hover:shadow-solidarity-600/30"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publicar Espacio</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
