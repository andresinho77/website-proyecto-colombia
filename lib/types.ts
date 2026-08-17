export type ListingType = 'ofrezco' | 'necesito';
export type ListingStatus = 'activo' | 'resuelto' | 'reportado' | 'eliminado';

export interface Listing {
  id: string;
  tipo: ListingType;
  ciudad: string;
  /** Macro-zone within the city (US-4.4), e.g. "Norte"/"Ladera"/a named comuna — drives fast filtering. */
  zona: string;
  /** Free-text specific neighborhood/sector, optional — for search, not filtering (see US-4.4 in ROADMAP.md). */
  barrio: string;
  personas: number;
  fechaDesde: string;
  fechaHasta: string | null;
  precio: number;
  descripcion: string;
  whatsapp: string;
  imagenes?: string[];
  pin?: string;
  creadoEn: number;
  estado: ListingStatus;
  reportes: number;
}

export interface FilterState {
  ciudad: string;
  tipo: string;
  zona: string;
  barrio: string;
  maxPrecio: string;
}

export interface CreateListingInput {
  tipo: ListingType;
  ciudad: string;
  zona: string;
  barrio: string;
  personas: number;
  fechaDesde: string;
  fechaHasta: string | null;
  precio: number;
  descripcion: string;
  whatsapp: string;
  imagenes: string[];
  habeasData: boolean;
  b_hp_fax?: string; // Honeypot field
  turnstileToken?: string;
}
