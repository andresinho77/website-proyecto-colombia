"use client";

import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl relative my-8 text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-solidarity-600/30 border border-solidarity-500/40 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Política de Tratamiento de Datos Personales
            </h2>
            <p className="text-xs text-slate-400">
              Ley Estatutaria 1581 de 2012 y Decreto 1377 de 2013 de la República de Colombia
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs leading-relaxed text-slate-300 max-h-96 overflow-y-auto pr-2">
          <section>
            <h3 className="font-bold text-white text-sm mb-1">1. Objeto y Finalidad</h3>
            <p>
              La plataforma pública <strong>Alojamiento Solidario Colombia</strong> recolecta y trata datos personales de contacto (Nombre, Celular/WhatsApp, Ciudad y Barrio) con la <strong>única y exclusiva finalidad</strong> de conectar a personas damnificadas por el terremoto del 10 de agosto de 2026 con voluntarios o ciudadanos que ofrecen alojamiento temporal de emergencia.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-white text-sm mb-1">2. Consentimiento Informado</h3>
            <p>
              Al publicar en la plataforma, el usuario otorga su autorización previa, expresa e informada para que sus datos de contacto sean publicados en el feed abierto de la web y accesibles mediante enlaces directos a WhatsApp (`wa.me`).
            </p>
          </section>

          <section>
            <h3 className="font-bold text-white text-sm mb-1">3. Derechos ARCO</h3>
            <p>
              Conforme a la Ley 1581 de 2012, el titular de los datos tiene derecho a conocer, actualizar, rectificar y suprimir sus datos en cualquier momento. El autor puede suprimir o marcar como &ldquo;Resuelta&rdquo; su publicación de forma inmediata utilizando el PIN de 4 dígitos generado o el botón de supresión directa.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-white text-sm mb-1">4. Seguridad y No Comercialización</h3>
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
            Entendido y Acepto
          </button>
        </div>
      </div>
    </div>
  );
};
