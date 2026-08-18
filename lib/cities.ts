import { getPriorityLocations, findLocationByLegacyCity } from './locations';

export interface City {
  name: string;
  slug: string;
  departmentName?: string;
  departmentSlug?: string;
}

export const CITIES: City[] = getPriorityLocations().map((loc) => ({
  name: loc.name,
  slug: loc.slug,
  departmentName: loc.departmentName,
  departmentSlug: loc.departmentSlug,
}));

export const DEFAULT_CITY: City = CITIES[0] || {
  name: 'Pereira',
  slug: 'pereira',
  departmentName: 'Risaralda',
  departmentSlug: 'risaralda',
};

export const getCityBySlug = (slug: string): City | undefined => {
  const found = findLocationByLegacyCity(slug);
  if (!found) return undefined;
  return {
    name: found.name,
    slug: found.slug,
    departmentName: found.departmentName,
    departmentSlug: found.departmentSlug,
  };
};

export const PREFERRED_CITY_STORAGE_KEY = 'preferredCitySlug';
