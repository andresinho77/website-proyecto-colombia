/**
 * Temporary frontend-only macro-zone catalog (US-4.4).
 *
 * This is a stand-in for the real catalog that will eventually come from
 * the backend (see ROADMAP.md US-4.4 — "Api listo" conversation with infra
 * 2026-08-17: the catalog is expected to be exposed via the API once the
 * contract is confirmed). Until then, this file lets the product be
 * developed and demoed against a short, sane list of areas per city
 * instead of free text — deliberately **macro-zones** (Norte/Sur/Centro/...
 * or a handful of named districts), not individual barrios: a real barrio
 * list would run into the hundreds per city (Pereira alone has ~419 across
 * 19 comunas, Cali ~335 across 22) and stop being a usable filter.
 *
 * Colombian cities do NOT share one classification scheme, so each city
 * below uses whatever real system its own planning office/community
 * actually uses instead of forcing a uniform Norte/Sur/Centro grid:
 *
 * - **Cali**: official geographic zones from the Alcaldía's IDESC map
 *   (Planeación Municipal — "Mapa de Zonas Geográficas"), 6 zones: Norte,
 *   Oriente, Sur, Centro, Ladera, Oeste. This grouping is explicitly
 *   informal per the source itself ("no está respaldada por documento
 *   normativo alguno") but is the one the city and its citizens actually
 *   use day to day.
 * - **Manizales** and **Armenia**: no informal cardinal grouping in common
 *   use — their real subdivision is a small number of *named* comunas
 *   (11 and 10 respectively, fixed by municipal acuerdo/decreto), so those
 *   comuna names are used directly as the "zona" options.
 * - **Quibdó**: 6 official comunas, each already named with a cardinal or
 *   descriptive label (Comuna 1 = "Zona Norte", Comuna 5 = "Medrano y Zona
 *   Sur", etc.) — used as-is.
 * - **Pereira**: no single official geographic-zone map was found (its 19
 *   comunas don't carry cardinal names); Norte/Sur/Centro/Oriente/Occidente
 *   here reflect the informal grouping real-estate sites and residents use
 *   in practice (Cuba/Kennedy → sur, Pinares/Circunvalar → oriente,
 *   Cerritos/vía a Cartago → occidente, Boston/Centro → centro), not a
 *   government-published map.
 * - **Condoto** and **Istmina**: small towns without meaningful sub-city
 *   zoning at all — a single "Centro / Casco urbano" option.
 *
 * IMPORTANT: like any AI-assisted catalog, this needs a manual pass by
 * someone from each city before it's treated as authoritative — see
 * US-4.4's acceptance criteria in ROADMAP.md. Pereira's and Cali's "Ladera"
 * groupings in particular are approximate.
 */

import { CITIES } from './cities';

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
  condoto: ['Centro / Casco urbano'],
  istmina: ['Centro / Casco urbano'],
};

/** Zones for a city, looked up by its display name (matches `Listing.ciudad`/`FilterState.ciudad`). */
export function getZonesForCityName(cityName: string): string[] {
  const city = CITIES.find((c) => c.name === cityName);
  if (!city) return [];
  return ZONES_BY_CITY_SLUG[city.slug] ?? [];
}
