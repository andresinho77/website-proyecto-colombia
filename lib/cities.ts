export interface City {
  name: string;
  slug: string;
}

// Single source of truth for supported cities. The slug drives the route
// (/pereira/, /cali/, /quibdo/...) and must stay URL-safe (no accents/ñ).
export const CITIES: City[] = [
  { name: 'Pereira', slug: 'pereira' },
  { name: 'Cali', slug: 'cali' },
  { name: 'Quibdó', slug: 'quibdo' },
  { name: 'Manizales', slug: 'manizales' },
  { name: 'Armenia', slug: 'armenia' },
  { name: 'Condoto', slug: 'condoto' },
  { name: 'Istmina', slug: 'istmina' },
];

export const DEFAULT_CITY = CITIES[0];

export const getCityBySlug = (slug: string): City | undefined =>
  CITIES.find((c) => c.slug === slug);

export const PREFERRED_CITY_STORAGE_KEY = 'preferredCitySlug';
