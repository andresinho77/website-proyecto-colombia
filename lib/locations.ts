import locationsRaw from './colombia-locations.json';

export interface LocationCity {
  id: string;
  name: string;
  slug: string;
  baseSlug?: string;
  departmentName: string;
  departmentSlug: string;
  isPriority?: boolean;
}

export interface LocationDepartment {
  id: string;
  name: string;
  slug: string;
  isPriority?: boolean;
  cities: LocationCity[];
}

export const COLOMBIA_LOCATIONS: LocationDepartment[] = locationsRaw as LocationDepartment[];

export const normalizeSlug = (str: string): string =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const departmentsBySlug = new Map<string, LocationDepartment>();
const citiesBySlug = new Map<string, LocationCity>();
const allCities: LocationCity[] = [];

for (const dept of COLOMBIA_LOCATIONS) {
  departmentsBySlug.set(dept.slug, dept);
  for (const city of dept.cities) {
    citiesBySlug.set(city.slug, city);
    allCities.push(city);
  }
}

export function getDepartments(): LocationDepartment[] {
  return COLOMBIA_LOCATIONS;
}

export function getDepartmentBySlug(deptSlug: string): LocationDepartment | undefined {
  return departmentsBySlug.get(normalizeSlug(deptSlug));
}

export function getCitiesByDepartment(deptSlug: string): LocationCity[] {
  const dept = getDepartmentBySlug(deptSlug);
  return dept ? dept.cities : [];
}

export function getCityBySlug(citySlug: string): LocationCity | undefined {
  const norm = normalizeSlug(citySlug);
  const direct = citiesBySlug.get(norm);
  if (direct) return direct;

  // Fallback: match by baseSlug or loose name
  const match = allCities.find(
    (c) => c.slug === norm || c.baseSlug === norm || normalizeSlug(c.name) === norm
  );
  return match;
}

export function getAllCities(): LocationCity[] {
  return allCities;
}

export function getPriorityLocations(): LocationCity[] {
  return allCities.filter((c) => c.isPriority);
}

/**
 * Searches departments matching the query
 */
export function searchDepartments(query: string, limit = 10): LocationDepartment[] {
  const clean = normalizeSlug(query);
  if (!clean) return COLOMBIA_LOCATIONS.filter((d) => d.isPriority).slice(0, limit);

  return COLOMBIA_LOCATIONS.filter(
    (d) => d.slug.includes(clean) || normalizeSlug(d.name).includes(clean)
  ).slice(0, limit);
}

/**
 * Searches across all 1,103 Colombian municipalities.
 */
export function searchLocations(query: string, limit = 25): LocationCity[] {
  const clean = normalizeSlug(query);
  if (!clean) return getPriorityLocations().slice(0, limit);

  const exactCityMatches: LocationCity[] = [];
  const prefixCityMatches: LocationCity[] = [];
  const containsCityMatches: LocationCity[] = [];
  const deptMatches: LocationCity[] = [];

  for (const city of allCities) {
    const citySlug = city.slug;
    const baseSlug = city.baseSlug || city.slug;
    const deptSlug = city.departmentSlug;

    if (citySlug === clean || baseSlug === clean) {
      exactCityMatches.push(city);
    } else if (citySlug.startsWith(clean) || baseSlug.startsWith(clean)) {
      prefixCityMatches.push(city);
    } else if (citySlug.includes(clean) || baseSlug.includes(clean)) {
      containsCityMatches.push(city);
    } else if (deptSlug.includes(clean)) {
      deptMatches.push(city);
    }
  }

  const sortByPriority = (a: LocationCity, b: LocationCity) => {
    if (a.isPriority && !b.isPriority) return -1;
    if (!a.isPriority && b.isPriority) return 1;
    return a.name.localeCompare(b.name, 'es');
  };

  prefixCityMatches.sort(sortByPriority);
  containsCityMatches.sort(sortByPriority);
  deptMatches.sort(sortByPriority);

  const isDeptMatch = COLOMBIA_LOCATIONS.some((d) => d.slug === clean || d.slug.startsWith(clean));

  const combined = isDeptMatch
    ? [...exactCityMatches, ...prefixCityMatches, ...deptMatches, ...containsCityMatches]
    : [...exactCityMatches, ...prefixCityMatches, ...containsCityMatches, ...deptMatches];

  const seen = new Set<string>();
  const results: LocationCity[] = [];
  for (const loc of combined) {
    if (!seen.has(loc.slug)) {
      seen.add(loc.slug);
      results.push(loc);
    }
    if (results.length >= limit) break;
  }

  return results;
}

/**
 * Searches both departments and municipalities together
 */
export function searchLocationsAndDepartments(query: string): {
  departments: LocationDepartment[];
  cities: LocationCity[];
} {
  return {
    departments: searchDepartments(query, 5),
    cities: searchLocations(query, 20),
  };
}

/**
 * Resolves a city from a slug or name.
 */
export function findLocationByLegacyCity(cityQuery: string): LocationCity | undefined {
  return getCityBySlug(cityQuery);
}
