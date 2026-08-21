import { Listing } from './types';
import { getCityBySlug } from './cities';
import { normalizeSlug } from './locations';

/**
 * Canonical origin (see infra-proyecto-colombia/variables.tf `domain_name`),
 * used only when there's no browser origin to read — SSR and the static
 * prerender pass. In the browser we always prefer window.location.origin so
 * a link shared from a preview/local build points back at that same host.
 */
const SITE_ORIGIN = 'https://alojamientosolidario.co';

/**
 * Absolute, shareable deep link to a single listing: the city feed plus the
 * `#listing-<id>` anchor that ListingCard renders as its element id.
 *
 * Two details this must not get wrong, both of which produce a 404 page:
 *
 *  - The trailing slash. next.config.mjs sets `trailingSlash: true`, so the
 *    real route is `/pereira/`, matching CitySwitcher's `router.push`.
 *  - The slug has to be a city that actually exists. The site is a static
 *    export whose /[ciudad] pages come from generateStaticParams(), so an
 *    unknown slug renders app/not-found.tsx instead of a feed. Listings
 *    from the backend don't always carry `ciudadSlug`, and slugifying the
 *    display name is only a guess ("Bogotá D.C." -> "bogota-d-c", which is
 *    not a route). When the guess doesn't resolve we link to the national
 *    feed at `/`, where the listing still appears.
 */
export function getListingUrl(listing: Listing): string {
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : SITE_ORIGIN;

  const citySlug = listing.ciudadSlug || normalizeSlug(listing.ciudad || '');
  const path = citySlug && getCityBySlug(citySlug) ? `/${citySlug}/` : '/';

  return `${origin}${path}#listing-${listing.id}`;
}
