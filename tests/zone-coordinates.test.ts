import { describe, it, expect } from 'vitest';
import {
  cityHasMapCoordinates,
  getCityCenter,
  getListingCoordinates,
} from '../lib/zoneCoordinates';

// US-4.3: Listing has no real lat/lng, so pins are positioned by a curated
// zona-centroid map for the 7 priority crisis cities only — this suite
// covers that lookup/jitter logic directly (no DOM/Leaflet involved).
describe('lib/zoneCoordinates.ts', () => {
  it('cityHasMapCoordinates es true solo para las ciudades prioritarias curadas', () => {
    expect(cityHasMapCoordinates('pereira')).toBe(true);
    expect(cityHasMapCoordinates('Cali')).toBe(true); // case-insensitive
    expect(cityHasMapCoordinates('quibdo')).toBe(true);
    expect(cityHasMapCoordinates('bogota')).toBe(false); // sin coordenadas curadas
    expect(cityHasMapCoordinates('leticia')).toBe(false);
  });

  it('getCityCenter devuelve coordenadas para ciudades prioritarias y undefined para el resto', () => {
    expect(getCityCenter('pereira')).toEqual({ lat: 4.8087, lng: -75.6906 });
    expect(getCityCenter('medellin')).toBeUndefined();
  });

  it('getListingCoordinates devuelve una posición cerca del centroide de la zona, con jitter determinista', () => {
    const a = getListingCoordinates('pereira', 'Centro', 'listing-a');
    const b = getListingCoordinates('pereira', 'Centro', 'listing-a');
    const c = getListingCoordinates('pereira', 'Centro', 'listing-b');

    expect(a).toBeDefined();
    // Mismo id -> mismo jitter (determinista, no aleatorio por render).
    expect(a).toEqual(b);
    // Distinto id -> normalmente distinto jitter (no es un requisito
    // matemático estricto, pero con estos ids concretos difiere).
    expect(a).not.toEqual(c);

    // El jitter es pequeño (~150m) — la posición final debe seguir muy
    // cerca del centroide real de "Centro".
    expect(Math.abs(a!.lat - 4.8087)).toBeLessThan(0.01);
    expect(Math.abs(a!.lng - -75.6906)).toBeLessThan(0.01);
  });

  it('getListingCoordinates devuelve undefined para una ciudad o zona sin coordenadas', () => {
    expect(getListingCoordinates('bogota', 'Chapinero', 'x')).toBeUndefined();
    expect(getListingCoordinates('pereira', 'Zona Inventada', 'x')).toBeUndefined();
  });
});
