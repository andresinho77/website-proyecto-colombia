import { normalizeSlug } from './locations';

export const ZONES_BY_CITY_SLUG: Record<string, string[]> = {
  pereira: ['Centro', 'Norte', 'Sur', 'Oriente', 'Occidente'],
  cali: ['Centro', 'Norte', 'Oriente', 'Sur', 'Ladera', 'Oeste'],
  quibdo: [
    'Zona Norte (Comuna 1)',
    'Porvenir y Platina (Comuna 2)',
    'Anillo Central (Comuna 3)',
    'San Vicente y Niño Jesús (Comuna 4)',
    'Medrano y Zona Sur (Comuna 5)',
    'Jardín (Comuna 6)',
  ],
  manizales: [
    'Atardeceres',
    'San José',
    'Cumanday',
    'La Estación',
    'Ciudadela del Norte',
    'Ecoturístico Cerro de Oro',
    'Tesorito',
    'Palogrande',
    'Universitaria',
    'La Fuente',
    'La Macarena',
  ],
  armenia: [
    'Centenario',
    'Rufino José Cuervo Sur',
    'Alfonso López',
    'Francisco de Paula Santander',
    'El Bosque',
    'San José',
    'El Cafetero',
    'Libertadores',
    'Los Fundadores',
    'Quimbaya',
  ],
  bogota: [
    'Usaquén',
    'Chapinero',
    'Santa Fe',
    'San Cristóbal',
    'Usme',
    'Tunjuelito',
    'Bosa',
    'Kennedy',
    'Fontibón',
    'Engativá',
    'Suba',
    'Barrios Unidos',
    'Teusaquillo',
    'Los Mártires',
    'Antonio Nariño',
    'Puente Aranda',
    'La Candelaria',
    'Rafael Uribe Uribe',
    'Ciudad Bolívar',
    'Sumapaz',
  ],
  medellin: [
    'Popular',
    'Santa Cruz',
    'Manrique',
    'Aranjuez',
    'Castilla',
    'Doce de Octubre',
    'Robledo',
    'Villa Hermosa',
    'Buenos Aires',
    'La Candelaria (Centro)',
    'Laureles-Estadio',
    'La América',
    'San Javier',
    'El Poblado',
    'Guayabal',
    'Belén',
  ],
  condoto: ['Centro / Casco urbano', 'Zona Rural / Veredal'],
  istmina: ['Centro / Casco urbano', 'Zona Rural / Veredal'],
};

export const DEFAULT_FALLBACK_ZONES = [
  'Centro / Casco urbano',
  'Zona Norte',
  'Zona Sur',
  'Zona Oriente',
  'Zona Occidente',
  'Zona Rural / Vereda',
];

/** Zones for a city, looked up by its display name or slug */
export function getZonesForCityName(cityName: string): string[] {
  const norm = normalizeSlug(cityName || '');
  const tailored = ZONES_BY_CITY_SLUG[norm];
  if (tailored && tailored.length > 0) return tailored;
  return DEFAULT_FALLBACK_ZONES;
}
