/**
 * US-4.3 (map view): approximate lat/lng centroid per macro-zone, for the 7
 * priority crisis cities that already have a curated zone list in
 * `lib/zones.ts` (ZONES_BY_CITY_SLUG). `Listing` has NO coordinates at all
 * on the backend (only ciudad/zona/barrio text) — adding real per-listing
 * geocoding is a backend schema change out of scope for this pass (see
 * ROADMAP.md US-4.3 decision note). This is a deliberate approximation: a
 * pin lands "somewhere in this zona," not at the listing's real address —
 * consistent with zona itself being a macro-area, not a precise location.
 *
 * Cardinal-named zones (Pereira/Cali/Quibdó) are offset from the city
 * center in their named direction. Comuna-named zones with no cardinal
 * correspondence (Manizales/Armenia) don't have known individual
 * coordinates here, so they're distributed evenly around the city center
 * in a circle — visually separates the pins without claiming a precision
 * that doesn't exist. Small towns (Condoto/Istmina) just get "Centro" at
 * the city center and "Zona Rural" offset outward.
 *
 * NOT validated against real GIS data — same caveat as ZONES_BY_CITY_SLUG
 * itself (see that file's header). Good enough for "which side of town,"
 * wrong if used for anything requiring real precision.
 */

import { normalizeSlug } from './locations';

export interface LatLng {
  lat: number;
  lng: number;
}

export const CITY_CENTERS: Record<string, LatLng> = {
  pereira: { lat: 4.8087, lng: -75.6906 },
  cali: { lat: 3.4516, lng: -76.532 },
  quibdo: { lat: 5.6947, lng: -76.6611 },
  manizales: { lat: 5.0703, lng: -75.5138 },
  armenia: { lat: 4.5339, lng: -75.6811 },
  condoto: { lat: 5.0973, lng: -76.6497 },
  istmina: { lat: 5.1554, lng: -76.6842 },
};

const D = 0.02; // ~2.2km offset per cardinal "hop"

function offset(center: LatLng, dLat: number, dLng: number): LatLng {
  return { lat: center.lat + dLat, lng: center.lng + dLng };
}

/** Evenly distributes N points on a circle around `center` — used where we
 * don't know each zone's real position, just that they're distinct areas. */
function circlePoints(center: LatLng, count: number, radius = D): LatLng[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count;
    return offset(center, radius * Math.sin(angle), radius * Math.cos(angle));
  });
}

function buildCircular(citySlug: keyof typeof CITY_CENTERS, zoneNames: string[]): Record<string, LatLng> {
  const center = CITY_CENTERS[citySlug];
  const points = circlePoints(center, zoneNames.length);
  return Object.fromEntries(zoneNames.map((name, i) => [name, points[i]]));
}

export const ZONE_COORDINATES_BY_CITY_SLUG: Record<string, Record<string, LatLng>> = {
  pereira: {
    Centro: CITY_CENTERS.pereira,
    Norte: offset(CITY_CENTERS.pereira, D, 0),
    Sur: offset(CITY_CENTERS.pereira, -D, 0),
    Oriente: offset(CITY_CENTERS.pereira, 0, D),
    Occidente: offset(CITY_CENTERS.pereira, 0, -D),
  },
  cali: {
    Centro: CITY_CENTERS.cali,
    Norte: offset(CITY_CENTERS.cali, D, 0),
    Oriente: offset(CITY_CENTERS.cali, 0, D),
    Sur: offset(CITY_CENTERS.cali, -D, 0),
    Ladera: offset(CITY_CENTERS.cali, 0, -D * 1.5),
    Oeste: offset(CITY_CENTERS.cali, 0, -D),
  },
  quibdo: {
    'Zona Norte (Comuna 1)': offset(CITY_CENTERS.quibdo, D, 0),
    'Porvenir y Platina (Comuna 2)': offset(CITY_CENTERS.quibdo, 0, D),
    'Anillo Central (Comuna 3)': CITY_CENTERS.quibdo,
    'San Vicente y Niño Jesús (Comuna 4)': offset(CITY_CENTERS.quibdo, 0, -D),
    'Medrano y Zona Sur (Comuna 5)': offset(CITY_CENTERS.quibdo, -D, 0),
    'Jardín (Comuna 6)': offset(CITY_CENTERS.quibdo, D * 0.4, D * 0.4),
  },
  manizales: buildCircular('manizales', [
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
  ]),
  armenia: buildCircular('armenia', [
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
  ]),
  condoto: {
    'Centro / Casco urbano': CITY_CENTERS.condoto,
    'Zona Rural / Veredal': offset(CITY_CENTERS.condoto, D, D),
  },
  istmina: {
    'Centro / Casco urbano': CITY_CENTERS.istmina,
    'Zona Rural / Veredal': offset(CITY_CENTERS.istmina, D, D),
  },
};

/** True only for the priority cities with a curated zone+coordinate map —
 * MapView / the "Mapa" toggle only renders when this is true. */
export function cityHasMapCoordinates(citySlug: string): boolean {
  return normalizeSlug(citySlug) in ZONE_COORDINATES_BY_CITY_SLUG;
}

export function getCityCenter(citySlug: string): LatLng | undefined {
  return CITY_CENTERS[normalizeSlug(citySlug)];
}

/** Resolves a pin position for a listing's (citySlug, zona), with a small
 * deterministic jitter (seeded by listing id, not random per render) so
 * multiple listings in the same zona don't stack exactly on one pixel.
 * `citySlug` is normalized (accents/spaces stripped) so it works whether
 * called with a real slug ("quibdo") or a display name ("Quibdó") — the
 * latter happens when a listing is missing `ciudadSlug` and MapView falls
 * back to its `ciudad` text (2026-08-21, department/national map support). */
export function getListingCoordinates(
  citySlug: string,
  zona: string,
  listingId: string
): LatLng | undefined {
  const cityZones = ZONE_COORDINATES_BY_CITY_SLUG[normalizeSlug(citySlug)];
  const base = cityZones?.[zona];
  if (!base) return undefined;

  // Deterministic jitter from the listing id, up to ~150m in each axis —
  // enough to separate overlapping pins, not enough to leave the zona.
  let hash = 0;
  for (let i = 0; i < listingId.length; i++) {
    hash = (hash * 31 + listingId.charCodeAt(i)) | 0;
  }
  const jitterLat = ((hash % 1000) / 1000 - 0.5) * 0.003;
  const jitterLng = (((hash >> 10) % 1000) / 1000 - 0.5) * 0.003;
  return { lat: base.lat + jitterLat, lng: base.lng + jitterLng };
}
