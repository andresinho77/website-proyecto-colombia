"use client";

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { useHomeHref } from '../../lib/useHomeHref';
import { renewListing } from '../../lib/api';

// US-7.3: confirms a listing that's about to hit the 60-day auto-delete
// window is still real. Query-param based (`?id=&pin=`, not a `/[id]/`
// dynamic segment) because this is a static export (`output: 'export'`) —
// there's no server to resolve an unbounded set of listing ids at request
// time, and every real listing id only exists after build. Same no-login
// trust model as the existing PIN-based resolve flow.
function RenewalConfirmation() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const pin = searchParams.get('pin') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!id || !pin) {
      setStatus('error');
      setErrorMessage('Enlace de renovación inválido o incompleto.');
      return;
    }

    let cancelled = false;
    renewListing(id, pin).then((res) => {
      if (cancelled) return;
      if (res.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(res.error || 'No pudimos renovar la publicación.');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [id, pin]);

  return (
    <main className="max-w-lg mx-auto px-4 py-20 text-center">
      {status === 'loading' && (
        <>
          <Loader2 className="w-10 h-10 mx-auto mb-4 text-slate-400 animate-spin" />
          <p className="text-slate-300 text-sm">Confirmando tu publicación…</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-100 mb-3">
            ¡Listo! Tu publicación sigue activa
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Gracias por confirmar. Te avisaremos de nuevo si vuelve a pasar mucho tiempo sin actividad.
          </p>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-rose-900/40 border border-rose-700/40 flex items-center justify-center text-rose-500">
            <XCircle className="w-8 h-8" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-100 mb-3">
            No pudimos confirmar tu publicación
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">{errorMessage}</p>
        </>
      )}
    </main>
  );
}

export default function RenovarPage() {
  const { citySlug: homeCitySlug } = useHomeHref();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar currentCitySlug={homeCitySlug} />
        <Suspense
          fallback={
            <main className="max-w-lg mx-auto px-4 py-20 text-center">
              <Loader2 className="w-10 h-10 mx-auto mb-4 text-slate-400 animate-spin" />
            </main>
          }
        >
          <RenewalConfirmation />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
