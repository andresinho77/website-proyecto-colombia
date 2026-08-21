"use client";

import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { Listing } from '../lib/types';
import { getListingCoordinates, getCityCenter } from '../lib/zoneCoordinates';
import { MapPopupCard } from './MapPopupCard';

interface MapViewProps {
  listings: Listing[];
  /** Set only on a single-city page — pins the initial view tight on that
   * city (zoom 13). Omit for department/national feeds, where listings span
   * multiple cities and the view instead fits to whatever pins resolve
   * (see the bounds branch below). */
  citySlug?: string;
  turnstileToken?: string | null;
  onTurnstileConsumed?: () => void;
}

// Custom colored pins instead of Leaflet's default marker image — sidesteps
// the well-known Next.js/webpack "default marker icon 404s" issue entirely
// (no image asset path resolution needed) and matches the app's existing
// rose=necesito / emerald=ofrezco journey colors instead of a generic blue
// pin. `divIcon` renders arbitrary HTML, so this is just an inline SVG pin.
function buildPinIcon(color: 'rose' | 'emerald'): L.DivIcon {
  const hex = color === 'rose' ? '#be123c' : '#047857'; // rose-700 / emerald-700
  return L.divIcon({
    className: '', // no default Leaflet marker styling to override
    html: `<svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 24 14 24s14-13.5 14-24c0-7.73-6.27-14-14-14z" fill="${hex}" stroke="white" stroke-width="1.5"/>
      <circle cx="14" cy="14" r="5.5" fill="white"/>
    </svg>`,
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    popupAnchor: [0, -36],
  });
}

const PIN_ICONS = {
  rose: buildPinIcon('rose'),
  emerald: buildPinIcon('emerald'),
};

// Rough Colombia-wide fallback when zero pins can be resolved (e.g. a
// department/national feed whose current results are all outside the 7
// priority cities) — better than an empty white rectangle at (0,0).
const COLOMBIA_CENTER: [number, number] = [4.5, -74];
const COLOMBIA_ZOOM = 6;

/**
 * US-4.3: pin map of the current feed, positioned by zona centroid (see
 * lib/zoneCoordinates.ts for why — Listing has no real coordinates).
 * Dynamically imported with ssr:false from CityFeedPage (Leaflet touches
 * `window` at import time, so it can never run during SSR/static export).
 *
 * Each pin is resolved from the LISTING's own ciudadSlug, not a single
 * page-level city — this is what lets the same component serve city,
 * department, and national feeds (2026-08-21): a department/national page's
 * listings span multiple cities, and only those matching one of the 7
 * priority cities in lib/zoneCoordinates.ts get a pin; the rest are simply
 * absent from the map (no crash, no guess at their location).
 */
export default function MapView({
  listings,
  citySlug,
  turnstileToken,
  onTurnstileConsumed,
}: MapViewProps) {
  const pins = useMemo(
    () =>
      listings
        .map((listing) => ({
          listing,
          coords: getListingCoordinates(listing.ciudadSlug || listing.ciudad, listing.zona, listing.id),
        }))
        .filter((p): p is { listing: Listing; coords: NonNullable<ReturnType<typeof getListingCoordinates>> } =>
          Boolean(p.coords)
        ),
    [listings]
  );

  // Single-city page with curated coordinates: tight, fixed view on that
  // city. Otherwise (department/national, or a city outside the priority
  // list): fit to whatever pins actually resolved, or fall back to a
  // Colombia-wide view if there are none yet.
  const cityCenter = citySlug ? getCityCenter(citySlug) : undefined;
  const bounds = useMemo(() => {
    if (cityCenter || pins.length === 0) return undefined;
    return L.latLngBounds(pins.map((p) => [p.coords.lat, p.coords.lng] as [number, number]));
  }, [cityCenter, pins]);

  return (
    // `isolate` creates a new stacking context for this box — without it,
    // Leaflet's internal panes/zoom-controls (z-index up to ~1000, per
    // leaflet.css) compare directly against the page's sticky chrome
    // (IntentNavBar is only z-30), so scrolling the map under the sticky
    // navbar/tabs made the map render ON TOP of them instead of behind
    // (2026-08-21 mobile feedback). `isolate` caps everything inside at
    // this element's own z-index, regardless of Leaflet's internal values.
    <div className="isolate rounded-2xl overflow-hidden border border-slate-800 shadow-sm relative" style={{ height: 520 }}>
      <MapContainer
        {...(cityCenter
          ? { center: [cityCenter.lat, cityCenter.lng] as [number, number], zoom: 13 }
          : bounds
          ? { bounds, boundsOptions: { padding: [40, 40] as [number, number] } }
          : { center: COLOMBIA_CENTER, zoom: COLOMBIA_ZOOM })}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pins.map(({ listing, coords }) => (
          <Marker
            key={listing.id}
            position={[coords.lat, coords.lng]}
            icon={listing.tipo === 'ofrezco' ? PIN_ICONS.emerald : PIN_ICONS.rose}
          >
            <Popup>
              <MapPopupCard
                listing={listing}
                turnstileToken={turnstileToken}
                onTurnstileConsumed={onTurnstileConsumed}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {pins.length === 0 && (
        <div className="absolute inset-x-4 top-4 z-[1000] glass-card rounded-xl px-4 py-3 flex items-center gap-2 text-xs text-slate-300 shadow-lg">
          <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
          Ninguna publicación actual tiene ubicación de mapa disponible todavía
          (el mapa cubre Chocó, Valle del Cauca, Risaralda, Caldas y Quindío).
        </div>
      )}
    </div>
  );
}
