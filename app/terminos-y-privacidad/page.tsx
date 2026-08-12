import React from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { ShieldCheck, ArrowLeft, Lock, FileCheck } from 'lucide-react';

export default function TerminosYPrivacidadPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>

          <div className="glass-card p-8 rounded-3xl border border-slate-800 shadow-2xl mb-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-solidarity-600/30 border border-solidarity-500/40 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Tratamiento de Datos Personales (Ley 1581 de 2012)
                </h1>
                <p className="text-xs text-slate-400">
                  Cumplimiento Ley Estatutaria de Habeas Data en Colombia
                </p>
              </div>
            </div>

            <div className="space-y-6 text-sm text-slate-300 leading-relaxed font-light">
              <section className="space-y-2">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  1. Marco Legal y Ámbito de Aplicación
                </h2>
                <p>
                  En cumplimiento de la <strong>Ley Estatutaria 1581 de 2012</strong> y el <strong>Decreto Reglamentario 1377 de 2013</strong> de la República de Colombia, la plataforma pública <strong>Alojamiento Solidario Colombia</strong> establece la presente Política de Tratamiento de Información Personal para garantizar la protección de los derechos constitucionales de Habeas Data de los usuarios.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  2. Finalidad Exclusiva del Tratamiento
                </h2>
                <p>
                  Los datos personales de contacto solicitados (Nombre, Celular/WhatsApp, Ciudad y Barrio) son tratados con la <strong>única y exclusiva finalidad</strong> de facilitar la comunicación directa, voluntaria y sin intermediarios entre ciudadanos que ofrecen espacio disponible y personas afectadas por el desastre natural del 10 de agosto de 2026.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  3. Derechos de los Titulares (Derechos ARCO)
                </h2>
                <p>
                  Todo titular de los datos tiene derecho a conocer, actualizar, rectificar y solicitar la supresión de su información. El usuario puede retirar o modificar su publicación en cualquier momento utilizando el PIN de 4 dígitos generado al publicar o mediante el botón directo de marcar como &ldquo;Resuelta&rdquo;.
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
