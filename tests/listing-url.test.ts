import { describe, it, expect } from 'vitest';
import { getListingUrl } from '../lib/listingUrl';
import { listingOfrezco } from './fixtures/listings';
import { Listing } from '../lib/types';

/**
 * El enlace profundo que viaja en los mensajes de WhatsApp (botón
 * "Contactar" y ShareModal) tiene que aterrizar en una ruta que el export
 * estático realmente publica; si no, el receptor abre app/not-found.tsx.
 */
describe('getListingUrl (lib/listingUrl.ts)', () => {
  it('usa la barra final que exige trailingSlash y ancla la tarjeta por id', () => {
    // jsdom sirve el origen http://localhost:3000
    expect(getListingUrl(listingOfrezco)).toBe(
      `${window.location.origin}/pereira/#listing-${listingOfrezco.id}`
    );
  });

  it('prefiere ciudadSlug del backend sobre el slug derivado del nombre', () => {
    const listing: Listing = { ...listingOfrezco, ciudad: 'Quibdó', ciudadSlug: 'quibdo' };
    expect(getListingUrl(listing)).toContain('/quibdo/#listing-');
  });

  it('cae al feed nacional cuando el slug de ciudad no corresponde a una ruta', () => {
    // "Bogotá D.C." se normaliza a "bogota-d-c", que no es una ciudad del
    // dataset y por tanto no tiene página generada.
    const listing: Listing = { ...listingOfrezco, ciudad: 'Bogotá D.C.', ciudadSlug: undefined };
    expect(getListingUrl(listing)).toBe(
      `${window.location.origin}/#listing-${listingOfrezco.id}`
    );
  });

  it('cae al feed nacional cuando la publicación no trae ciudad', () => {
    const listing: Listing = { ...listingOfrezco, ciudad: '', ciudadSlug: undefined };
    expect(getListingUrl(listing)).toBe(
      `${window.location.origin}/#listing-${listingOfrezco.id}`
    );
  });
});
