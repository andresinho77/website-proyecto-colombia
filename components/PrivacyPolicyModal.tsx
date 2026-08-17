"use client";

import React, { useEffect } from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Dismiss on Escape while open.
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md grid place-items-center p-4 py-8 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="glass-card max-w-2xl w-full p-6 sm:p-8 rounded-3xl shadow-lg relative text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-slate-100 flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-solidarity-600/30 border border-solidarity-500/40 flex items-center justify-center text-emerald-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              Política de Tratamiento de Datos Personales
            </h2>
            <p className="text-xs text-slate-400">
              Ley Estatutaria 1581 de 2012 y Decreto 1377 de 2013 de la República de Colombia
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs leading-relaxed text-slate-300 max-h-96 overflow-y-auto pr-2">
          <section>
            <h3 className="font-bold text-slate-100 text-sm mb-1">1. Qué datos recolectamos</h3>
            <p>
              Al publicar, la plataforma pública <strong>Alojamiento Solidario Colombia</strong> recolecta únicamente: número de <strong>Celular/WhatsApp</strong>, <strong>Ciudad</strong>, <strong>Barrio/Sector</strong>, cantidad de personas, fechas de disponibilidad, precio (si aplica), la descripción que escribas y, si decides adjuntarlas, fotos del espacio. No solicitamos ni almacenamos tu nombre, documento de identidad ni dirección exacta.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-100 text-sm mb-1">2. Para qué se usan</h3>
            <p>
              Estos datos se usan con la <strong>única y exclusiva finalidad</strong> de conectar directamente, por WhatsApp, a personas damnificadas por el terremoto del 10 de agosto de 2026 con voluntarios o ciudadanos que ofrecen alojamiento temporal de emergencia. Al publicar, autorizas que tu número y los demás datos de la publicación sean visibles en el feed abierto de la web y accesibles mediante el enlace directo a WhatsApp (`wa.me`).
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-100 text-sm mb-1">3. Cuánto tiempo se conservan</h3>
            <p>
              Vencimiento funcional a los <strong>15 días</strong> de inactividad; los datos de contacto y la descripción se <strong>anonimizan a los 30 días</strong> de que la publicación quede resuelta o vencida; y se <strong>eliminan por completo a los 90 días</strong>, salvo obligación legal de conservarlos.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-100 text-sm mb-1">4. Derechos ARCO y cómo eliminar tus datos</h3>
            <p>
              Conforme a la Ley 1581 de 2012, el titular de los datos tiene derecho a conocer, actualizar, rectificar y suprimir sus datos en cualquier momento. La vía inmediata es marcar la publicación como &ldquo;Resuelta&rdquo; con el PIN de 4 dígitos que recibiste al publicar, lo que la retira del feed público al instante. Para solicitudes formales (por ejemplo, si perdiste el PIN), escribe a{' '}
              <a href="mailto:pendiente-definir@alojamientosolidario.co" className="text-emerald-700 underline">
                pendiente-definir@alojamientosolidario.co
              </a>{' '}
              — canal oficial de solicitudes de datos personales, en proceso de habilitación. Confirmamos la recepción en máximo 24 horas y resolvemos en máximo 5 días hábiles.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-100 text-sm mb-1">5. Seguridad y No Comercialización</h3>
            <p>
              Los datos recolectados no serán bajo ninguna circunstancia cedidos, comercializados ni utilizados para fines publicitarios o lucrativos.
            </p>
          </section>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-solidarity-600 hover:bg-solidarity-500 text-white font-bold text-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
