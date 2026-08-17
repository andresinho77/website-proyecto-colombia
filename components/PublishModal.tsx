"use client";

import React, { useState, useEffect } from 'react';
import { X, Send, ShieldAlert, AlertCircle, Home, Heart } from 'lucide-react';
import { ListingType, Listing } from '../lib/types';
import { createListing } from '../lib/api';
import { saveMyListing } from '../lib/localStorage';
import { ImageUploader } from './ImageUploader';
import { CITIES } from '../lib/cities';
import { getZonesForCityName } from '../lib/zones';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTipo?: ListingType;
  /** City the modal was opened from (route-scoped). Preselected but still
   * editable, since a listing's city doesn't have to match the page it was
   * published from. */
  defaultCiudad?: string;
  onSuccessPublished: (listing: Listing) => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  defaultTipo = 'ofrezco',
  defaultCiudad,
  onSuccessPublished,
}) => {
  const [tipo, setTipo] = useState<ListingType>(defaultTipo);
  const [ciudad, setCiudad] = useState(defaultCiudad || CITIES[0].name);
  const [zona, setZona] = useState('');
  const [barrio, setBarrio] = useState('');
  const [personas, setPersonas] = useState(2);
  const [fechaDesde, setFechaDesde] = useState(new Date().toISOString().split('T')[0]);
  const [isIndefinido, setIsIndefinido] = useState(true);
  const [fechaHasta, setFechaHasta] = useState('');
  const [isGratis, setIsGratis] = useState(true);
  const [precio, setPrecio] = useState(0);
  const [descripcion, setDescripcion] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [habeasData, setHabeasData] = useState(true);
  const [honeypot, setHoneypot] = useState(''); // Anti-bot trap

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // The modal never unmounts (parent toggles `isOpen`), so state persists across
  // opens. Reset the whole form on every open: `defaultTipo` must win each time
  // (e.g. hero "Necesito" then "Ofrezco"), and stale data from a closed/cancelled
  // draft must not leak into the next publish flow.
  useEffect(() => {
    if (!isOpen) return;
    setTipo(defaultTipo);
    setCiudad(defaultCiudad || CITIES[0].name);
    setZona('');
    setBarrio('');
    setPersonas(2);
    setFechaDesde(new Date().toISOString().split('T')[0]);
    setIsIndefinido(true);
    setFechaHasta('');
    setIsGratis(true);
    setPrecio(0);
    setDescripcion('');
    setWhatsapp('');
    setImagenes([]);
    setHabeasData(true);
    setHoneypot('');
    setFormError(null);
  }, [isOpen, defaultTipo, defaultCiudad]);

  // The zone list is per-city (US-4.4) — a zone picked for one city (e.g.
  // "Ladera", Cali-only) isn't valid once the user switches to another, so
  // clear the selection whenever the city changes mid-session. `barrio` is
  // free text and stays untouched — it's not tied to the zone catalog.
  useEffect(() => {
    setZona('');
  }, [ciudad]);

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

  // Formatting WhatsApp to Colombian E.164 (+573XXXXXXXXX)
  const handlePhoneChange = (val: string) => {
    let digits = val.replace(/\D/g, '');
    if (digits.startsWith('57')) {
      digits = digits.substring(2);
    }
    if (digits.length > 10) digits = digits.substring(0, 10);
    setWhatsapp(digits ? `+57${digits}` : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!zona.trim()) {
      setFormError('Indique la zona.');
      return;
    }
    if (!descripcion.trim()) {
      setFormError('La descripción es obligatoria.');
      return;
    }
    if (descripcion.length > 280) {
      setFormError('La descripción supera los 280 caracteres.');
      return;
    }
    if (!whatsapp || !/^\+573[0-9]{9}$/.test(whatsapp)) {
      setFormError('Ingrese un celular colombiano válido de 10 dígitos (Ej: +573105550123).');
      return;
    }
    if (!habeasData) {
      setFormError('Debe aceptar el Tratamiento de Datos Personales (Ley 1581 de 2012).');
      return;
    }

    setIsSubmitting(true);

    const res = await createListing({
      tipo,
      ciudad,
      zona,
      barrio: barrio.trim(),
      personas: Number(personas) || 1,
      fechaDesde,
      fechaHasta: isIndefinido ? null : fechaHasta || null,
      precio: isGratis ? 0 : Number(precio) || 0,
      descripcion: descripcion.trim(),
      whatsapp,
      imagenes,
      habeasData,
      b_hp_fax: honeypot, // Honeypot field
    });

    setIsSubmitting(false);

    if (res.success && res.listing) {
      // Save author PIN to localStorage for 1-click resolution
      saveMyListing({
        id: res.listing.id,
        pin: res.listing.pin || '1234',
        creadoEn: res.listing.creadoEn,
        tipo: res.listing.tipo,
        ciudad: res.listing.ciudad,
      });

      onSuccessPublished(res.listing);
      onClose();
    } else {
      setFormError(res.error || 'Error al guardar la publicación.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md grid place-items-center p-4 py-8 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="glass-card max-w-lg w-full p-6 rounded-3xl shadow-lg relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-slate-100 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2 className="font-display text-2xl font-semibold text-slate-100">
            {tipo === 'ofrezco' ? 'Ofrecer alojamiento' : 'Solicitar alojamiento'}
          </h2>
        </div>

        {/* Mandatory anti-fraud warning (docs/SAFETY.md) */}
        <div className="mb-4 p-3 rounded-xl bg-amber-950/60 border border-amber-700/60 text-amber-200 text-xs flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
          <span>
            <strong>Advertencia de seguridad:</strong> Nunca compartas datos bancarios ni realices pagos por adelantado a través de este sitio.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Honeypot Bot Trap Field (Hidden) */}
          <input
            type="text"
            name="b_hp_fax"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="hidden absolute -left-[9999px]"
          />

          {/* Tipo Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setTipo('ofrezco')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                tipo === 'ofrezco'
                  ? 'bg-solidarity-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <Home className="w-4 h-4" /> Ofrezco Espacio
            </button>

            <button
              type="button"
              onClick={() => setTipo('necesito')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                tipo === 'necesito'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <Heart className="w-4 h-4" /> Necesito Techo
            </button>
          </div>

          {/* Ciudad, Zona & Barrio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ciudad *
              </label>
              <select
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                {CITIES.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Zona *
              </label>
              <select
                required
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="" disabled>
                  Seleccione una zona
                </option>
                {getZonesForCityName(ciudad).map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Barrio / Sector (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Circunvalar, Cuba... (ayuda a que te encuentren con más precisión)"
              value={barrio}
              onChange={(e) => setBarrio(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none placeholder-slate-500"
            />
          </div>

          {/* Personas & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Capacidad (# Personas)
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={personas}
                onChange={(e) => setPersonas(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Modalidad de Precio
              </label>
              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGratis}
                    onChange={(e) => {
                      setIsGratis(e.target.checked);
                      if (e.target.checked) setPrecio(0);
                    }}
                    className="accent-emerald-500 w-4 h-4 rounded"
                  />
                  Gratis ($0)
                </label>

                {!isGratis && (
                  <input
                    type="number"
                    placeholder="Valor COP"
                    value={precio}
                    onChange={(e) => setPrecio(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-2 py-1 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Description (max 280 chars) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Descripción Breve (Máx 280 caracteres) *
              </label>
              <span
                className={`text-[11px] font-mono ${
                  descripcion.length > 280 ? 'text-rose-400 font-bold' : 'text-slate-400'
                }`}
              >
                {descripcion.length} / 280
              </span>
            </div>
            <textarea
              required
              maxLength={280}
              rows={3}
              placeholder="Describa brevemente el espacio, servicios (baño, luz, WiFi) o necesidad urgente..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl p-3 text-sm focus:border-emerald-500 focus:outline-none placeholder-slate-500"
            />
          </div>

          {/* WhatsApp E.164 (+57...) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Celular WhatsApp (+57) *
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                placeholder="+573105550123"
                value={whatsapp}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Formato celular colombiano (10 dígitos). El contacto ocurrirá directo por WhatsApp.
            </p>
          </div>

          {/* Photo Uploader Component (S3 direct upload) */}
          <ImageUploader images={imagenes} onChangeImages={setImagenes} />

          {/* Ley 1581 Habeas Data Consent Checkbox */}
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={habeasData}
                onChange={(e) => setHabeasData(e.target.checked)}
                className="accent-emerald-500 w-4 h-4 rounded mt-0.5"
              />
              <span className="text-[11px] text-slate-300 leading-snug">
                Autorizo el tratamiento de mis datos de contacto para la finalidad de alojamiento temporal de emergencia, conforme a la{' '}
                <strong className="text-slate-100">Ley 1581 de 2012 de Colombia</strong>.
              </span>
            </label>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="touch-target w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-base shadow-sm flex items-center justify-center gap-2 transition-colors mt-4"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Publicando en &lt;60s...' : 'Publicar Ahora'}
          </button>
        </form>
      </div>
    </div>
  );
};
