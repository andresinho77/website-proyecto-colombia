import { Listing } from '../../lib/types';

/**
 * Fixtures deterministas para las suites de render. No se reutilizan los
 * MOCK_LISTINGS de `lib/api.ts` a propósito: esos usan `Date.now()` y son
 * datos de demo que pueden cambiar sin que eso deba romper los tests.
 */
export const listingOfrezco: Listing = {
  id: 'fixture-ofrezco',
  tipo: 'ofrezco',
  ciudad: 'Pereira',
  barrio: 'Circunvalar',
  personas: 4,
  fechaDesde: '2026-08-11',
  fechaHasta: '2026-08-25',
  precio: 0,
  descripcion: 'Habitación amoblada con baño privado para familias.',
  whatsapp: '+573105550123',
  imagenes: [],
  creadoEn: 1_760_000_000_000,
  estado: 'activo',
  reportes: 0,
};

export const listingNecesito: Listing = {
  id: 'fixture-necesito',
  tipo: 'necesito',
  ciudad: 'Quibdó',
  barrio: 'César Conto',
  personas: 1,
  fechaDesde: '2026-08-12',
  fechaHasta: null,
  precio: 200000,
  descripcion: 'Familia damnificada requiere espacio temporal seguro.',
  whatsapp: '+573205559876',
  imagenes: [],
  creadoEn: 1_760_000_100_000,
  estado: 'activo',
  reportes: 0,
};

export const listingsFixture: Listing[] = [listingOfrezco, listingNecesito];
