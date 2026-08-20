"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { DEFAULT_CITY, PREFERRED_CITY_STORAGE_KEY, getCityBySlug } from '../../lib/cities';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function TerminosYPrivacidadPage() {
  const router = useRouter();

  // Bug fix (2026-08-21): this page always sent "Volver al Inicio" (and the
  // Navbar's city chip) to DEFAULT_CITY, regardless of which city/department
  // the user was actually browsing before clicking here — e.g. arriving from
  // Medellín's feed still landed you back on Pereira/whatever DEFAULT_CITY
  // is. Fall back to the last city remembered by CitySwitcher
  // (PREFERRED_CITY_STORAGE_KEY) instead of a hardcoded default; read after
  // mount since localStorage isn't available during SSR.
  const [homeCitySlug, setHomeCitySlug] = useState(DEFAULT_CITY.slug);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PREFERRED_CITY_STORAGE_KEY);
      if (saved && getCityBySlug(saved)) setHomeCitySlug(saved);
    } catch {
      // ignore — keep DEFAULT_CITY fallback
    }
  }, []);

  // Prefer real browser back navigation (returns to the exact previous page —
  // including a department/national feed, which the remembered city slug
  // can't represent) when this tab actually has history to go back to;
  // otherwise fall back to the remembered city's feed. The <Link href> below
  // still points at that same fallback for no-JS/middle-click.
  const handleBack = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar currentCitySlug={homeCitySlug} />

        <main className="max-w-4xl mx-auto px-4 py-12">
          <Link
            href={`/${homeCitySlug}/`}
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>

          <div className="glass-card p-8 rounded-3xl shadow-lg mb-8">
            <div className="mb-6 pb-4 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-solidarity-600/30 border border-solidarity-500/40 flex items-center justify-center text-emerald-700 float-left mr-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-slate-100">
                Ley <span className="hidden sm:inline">estatutaria</span> 1581 de 2012
              </h1>
              <br/>
              <h2 className="text-xl font-bold text-slate-100">
                Tratamiento de Datos Personales y Habeas Data
              </h2>
              <p className="text-xs text-slate-400 clear-left pt-1">
                Cumplimiento Ley Estatutaria de Habeas Data en Colombia
              </p>
            </div>

            <div className="space-y-6 text-sm text-slate-300 leading-relaxed font-light">
              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-100">
                  1. Marco Legal y Ámbito de Aplicación
                </h2>
                <p>
                  En cumplimiento de la <strong>Ley Estatutaria 1581 de 2012</strong> y el <strong>Decreto Reglamentario 1377 de 2013</strong> de la República de Colombia, la plataforma pública <strong>Alojamiento Solidario Colombia</strong> establece la presente Política de Tratamiento de Información Personal para garantizar la protección de los derechos constitucionales de Habeas Data de los usuarios.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-100">
                  2. Qué Datos Recolectamos y Para Qué
                </h2>
                <p>
                  Al publicar, recolectamos únicamente: número de <strong>Celular/WhatsApp</strong>, <strong>Ciudad</strong>, <strong>Barrio/Sector</strong>, cantidad de personas, fechas de disponibilidad, precio (si aplica), la descripción que escribas y, si decides adjuntarlas, fotos del espacio. No solicitamos ni almacenamos tu nombre, documento de identidad ni dirección exacta. Estos datos se tratan con la <strong>única y exclusiva finalidad</strong> de facilitar la comunicación directa, voluntaria y sin intermediarios entre ciudadanos que ofrecen espacio disponible y personas afectadas por el desastre natural del 10 de agosto de 2026, a través de un enlace directo a WhatsApp (`wa.me`).
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-100">
                  3. Tiempo de Conservación (Retención)
                </h2>
                <p>
                  Vencimiento funcional a los <strong>15 días</strong> de inactividad; los datos de contacto y la descripción se <strong>anonimizan a los 30 días</strong> de que la publicación quede resuelta o vencida; y se <strong>eliminan por completo a los 90 días</strong>, salvo obligación legal de conservarlos.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-100">
                  4. Derechos de los Titulares (Derechos ARCO) y Cómo Solicitar la Eliminación
                </h2>
                <p>
                  Todo titular de los datos tiene derecho a conocer, actualizar, rectificar y solicitar la supresión de su información. La vía inmediata es marcar la publicación como &ldquo;Resuelta&rdquo; con el PIN de 4 dígitos generado al publicar, lo que la retira del feed público al instante. Para solicitudes formales (por ejemplo, si perdiste el PIN), escribe a{' '}
                  <a href="mailto:pendiente-definir@alojamientosolidario.co" className="text-emerald-700 underline">
                    pendiente-definir@alojamientosolidario.co
                  </a>{' '}
                  — canal oficial de solicitudes de datos personales, en proceso de habilitación. Confirmamos la recepción en máximo 24 horas y resolvemos en máximo 5 días hábiles.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-100">
                  5. Seguridad y No Comercialización
                </h2>
                <p>
                  Los datos recolectados no serán bajo ninguna circunstancia cedidos, comercializados ni utilizados para fines publicitarios o lucrativos.
                </p>
              </section>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
