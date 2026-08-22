"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { List, Map as MapIcon } from 'lucide-react';
import { Navbar } from './Navbar';
import { EmergencyBanner } from './EmergencyBanner';
import { IntentNavBar } from './IntentNavBar';
import { SearchFilters } from './SearchFilters';
import { ListingGrid } from './ListingGrid';
import { PublishModal } from './PublishModal';
import { ShareModal } from './ShareModal';
import { Footer } from './Footer';
import { useInvisibleTurnstile, TurnstileContainer } from './Turnstile';
import { Listing, FilterState, ListingType } from '../lib/types';
import { fetchListings } from '../lib/api';
import {
  isDataPolicyAccepted,
  isEmergencyBannerDismissed,
  setDataPolicyAccepted,
  setEmergencyBannerDismissed,
} from '../lib/localStorage';
import { cityHasMapCoordinates } from '../lib/zoneCoordinates';

// US-4.3: Leaflet touches `window` at import time, so this can never run
// during SSR/static export — dynamic + ssr:false loads it client-side only,
// after the map toggle is actually clicked (or on this page's hydration).
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 animate-pulse" style={{ height: 520 }} />
  ),
});

interface CityFeedPageProps {
  cityName?: string;
  citySlug?: string;
  departmentName?: string;
  departmentSlug?: string;
  isDepartmentFeed?: boolean;
  isNationalFeed?: boolean;
  /** US-4.5: fixes the feed to a single intent ("necesito" or "ofrezco") on
   * the dedicated /[ciudad]/necesito and /[ciudad]/ofrezco routes, instead of
   * mixing both under one "Tipo" filter. Undefined keeps today's unified feed. */
  intentTipo?: ListingType;
}

export default function CityFeedPage({
  cityName = '',
  citySlug = '',
  departmentName,
  departmentSlug,
  isDepartmentFeed = false,
  isNationalFeed = false,
  intentTipo,
}: CityFeedPageProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // US-6.5: one invisible Turnstile challenge for the whole feed, reused
  // across "Contactar por WhatsApp" clicks and refreshed after each one.
  const { token: turnstileToken, containerRef: turnstileRef, refresh: refreshTurnstile } =
    useInvisibleTurnstile();
  const [isLoading, setIsLoading] = useState(true);

  // City and department filters
  const [filters, setFilters] = useState<FilterState>({
    ciudad: isDepartmentFeed || isNationalFeed ? '' : cityName,
    ciudadSlug: isDepartmentFeed || isNationalFeed ? '' : citySlug,
    departamento: isNationalFeed ? '' : (departmentName || ''),
    departamentoSlug: isNationalFeed ? '' : (departmentSlug || ''),
    tipo: intentTipo || 'todos',
    zona: '',
    barrio: '',
    maxPrecio: '',
    sortBy: 'recientes',
    limit: 24,
  });

  // Modal States
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [publishDefaultTipo, setPublishDefaultTipo] = useState<ListingType>(intentTipo || 'ofrezco');
  const [newlyCreatedListing, setNewlyCreatedListing] = useState<Listing | null>(null);

  // US-1.5: EmergencyBanner dismiss/reopen. Starts visible (default true) —
  // localStorage isn't available during SSR, so this is corrected right
  // after mount instead of read directly in useState's initializer, which
  // would otherwise cause a hydration mismatch between server and client
  // render for a returning visitor who previously dismissed it.
  const [isEmergencyBannerVisible, setIsEmergencyBannerVisible] = useState(true);
  // US-7.x: non-blocking cookie-consent-style banner (2026-08-22) — was a
  // full-screen blocking dialog with a focus trap; downgraded to a dismissible
  // bottom banner so first-time visitors aren't gated out of the page while
  // they decide. No focus trap needed since the rest of the page stays
  // interactive underneath it.
  const [isPolicyBannerOpen, setIsPolicyBannerOpen] = useState(false);
  useEffect(() => {
    if (isEmergencyBannerDismissed()) setIsEmergencyBannerVisible(false);
    if (!isDataPolicyAccepted()) setIsPolicyBannerOpen(true);
  }, []);
  const handleDismissEmergencyBanner = () => {
    setIsEmergencyBannerVisible(false);
    setEmergencyBannerDismissed(true);
  };
  const handleReopenEmergencyBanner = () => {
    setIsEmergencyBannerVisible(true);
    setEmergencyBannerDismissed(false);
  };

  // US-4.3: on a city page, only offered when that city is one of the 7
  // priority cities with a curated zone-coordinate map
  // (lib/zoneCoordinates.ts) — Listing has no real lat/lng, so a map can't
  // be positioned for a city outside that list. Department/national feeds
  // always offer the toggle (2026-08-21) — MapView places each listing by
  // its OWN city, so a department/national map is meaningful even though
  // only listings from the 7 priority cities will actually get a pin
  // (MapView shows an explanatory note when none of the current results do).
  const showMapToggle = isNationalFeed || isDepartmentFeed || (!!citySlug && cityHasMapCoordinates(citySlug));
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  useEffect(() => {
    if (!showMapToggle) setViewMode('list');
  }, [showMapToggle]);

  const loadListings = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchListings(filters);
    setListings(data.items);
    setNextCursor(data.nextCursor);
    setTotalCount(data.totalCount ?? data.items.length);
    setIsLoading(false);
  }, [filters]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  // Re-scope the feed when navigating to a different slug
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      ciudad: isDepartmentFeed || isNationalFeed ? '' : cityName,
      ciudadSlug: isDepartmentFeed || isNationalFeed ? '' : citySlug,
      departamento: isNationalFeed ? '' : (departmentName || ''),
      departamentoSlug: isNationalFeed ? '' : (departmentSlug || ''),
    }));
  }, [cityName, citySlug, departmentName, departmentSlug, isDepartmentFeed, isNationalFeed]);

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const data = await fetchListings(filters, nextCursor);
      setListings((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch (err) {
      console.error('Error loading more listings:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleOpenPublish = (defaultTipo: ListingType = 'ofrezco') => {
    setPublishDefaultTipo(defaultTipo);
    setIsPublishOpen(true);
  };

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      ciudad: isDepartmentFeed || isNationalFeed ? '' : cityName,
      ciudadSlug: isDepartmentFeed || isNationalFeed ? '' : citySlug,
      departamento: isNationalFeed ? '' : (departmentName || ''),
      departamentoSlug: isNationalFeed ? '' : (departmentSlug || ''),
      tipo: intentTipo || 'todos',
      zona: '',
      barrio: '',
      maxPrecio: '',
      sortBy: 'recientes',
      limit: 24,
    });
  };

  const handleSuccessPublished = (listing: Listing) => {
    setNewlyCreatedListing(listing);
    loadListings();
  };

  // US-4.7: sorts whatever page is currently loaded. Only "recientes" (the
  // backend's own order) is stable across "Cargar más" — the other options
  // re-sort just the items fetched so far, which is a known limitation until
  // the backend accepts a sort param (see ROADMAP US-4.7).
  const sortedListings = useMemo(() => {
    if (!filters.sortBy || filters.sortBy === 'recientes') return listings;
    const sorted = [...listings];
    switch (filters.sortBy) {
      case 'precio_asc':
        sorted.sort((a, b) => a.precio - b.precio);
        break;
      case 'precio_desc':
        sorted.sort((a, b) => b.precio - a.precio);
        break;
      case 'personas_desc':
        sorted.sort((a, b) => b.personas - a.personas);
        break;
    }
    return sorted;
  }, [listings, filters.sortBy]);

  // Shared by IntentNavBar for the Todos/Necesito/Ofrezco tab hrefs.
  const basePath = isNationalFeed
    ? '/'
    : isDepartmentFeed && departmentSlug
    ? `/departamento/${departmentSlug}/`
    : citySlug
    ? `/${citySlug}/`
    : null;

  const placeText = isNationalFeed
    ? 'Colombia'
    : isDepartmentFeed
    ? departmentName || ''
    : `${cityName}${departmentName ? ` (${departmentName})` : ''}`;

  const titleText =
    intentTipo === 'necesito'
      ? `Alojamiento buscado en ${placeText}`
      : intentTipo === 'ofrezco'
      ? `Espacios disponibles en ${placeText}`
      : `Alojamientos solidarios en ${placeText}`;

  const subtitleText =
    intentTipo === 'necesito'
      ? 'Personas y familias que necesitan alojamiento temporal ahora mismo. Contáctalas directo por WhatsApp.'
      : intentTipo === 'ofrezco'
      ? 'Espacios disponibles ofrecidos por la comunidad. Contacta directo por WhatsApp en 1-clic.'
      : isNationalFeed
      ? 'Publicaciones activas en todo el territorio nacional. Contacta directamente por WhatsApp en 1-clic.'
      : isDepartmentFeed
      ? `Publicaciones activas en todos los municipios de ${departmentName}. Contacta directamente por WhatsApp en 1-clic.`
      : 'Publicaciones activas más recientes. Contacta directamente por WhatsApp en 1-clic.';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-solidarity-500 selection:text-white">
      <div>
        {/* Top Emergency Lines Banner (US-1.5: dismissible, remembered) */}
        {isEmergencyBannerVisible && (
          <EmergencyBanner onDismiss={handleDismissEmergencyBanner} />
        )}

        {/* Header / Navbar (US-1.2) */}
        <Navbar
          currentCitySlug={citySlug || 'pereira'}
          currentDeptSlug={departmentSlug}
          isDepartmentFeed={isDepartmentFeed}
          isNationalFeed={isNationalFeed}
          showEmergencyReopen={!isEmergencyBannerVisible}
          onReopenEmergency={handleReopenEmergencyBanner}
        />

        {/* Intent Nav Bar (US-4.5) — replaces the old full-width hero
            (components/HeroButtons.tsx, removed): persistent Todos/Necesito/
            Ofrezco tabs + contextual "+" publish action, first element under
            the Navbar across all three location levels. */}
        {basePath && (
          <IntentNavBar
            basePath={basePath}
            intentTipo={intentTipo}
            onOpenPublish={handleOpenPublish}
          />
        )}

        {/* Listings Feed Section */}
        <main id="feed" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-mt-16 sm:scroll-mt-20">
          {/* items-end (not just sm:items-end): without a cross-axis
              alignment at the base breakpoint, the row's default
              align-items:stretch made the Lista/Mapa pill stretch to match
              the title block's full height whenever the title wrapped to 2
              lines on narrow screens — a tall blob instead of a compact
              pill (2026-08-21 mobile feedback). */}
          <div className="mb-6 flex flex-row items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-100 tracking-tight">
                {titleText}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {subtitleText}
              </p>
            </div>

            {/* Lista/Mapa toggle (US-4.3) — only where a zone-coordinate map
                exists for this city (see showMapToggle above). Placed next
                to the title, above the filters panel, so it's visible
                without scrolling past anything — a neutral pill tucked
                below the filters was too easy to miss (2026-08-21
                feedback: "this should be evident for newcomers"). Brand
                emerald on the active state (not a neutral gray) for extra
                visual weight given this is a whole alternate view of the
                page, not just another filter. */}
            {showMapToggle && (
              <div
                role="tablist"
                aria-label="Vista de resultados"
                className="inline-flex items-center gap-1 bg-slate-900 border border-slate-700 shadow-sm rounded-full p-1 flex-shrink-0"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={viewMode === 'list'}
                  onClick={() => setViewMode('list')}
                  className={`touch-target inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                    viewMode === 'list'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-slate-300 hover:text-slate-50 hover:bg-slate-800'
                  }`}
                >
                  <List className="w-4 h-4" />
                  Lista
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={viewMode === 'map'}
                  onClick={() => setViewMode('map')}
                  className={`touch-target inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                    viewMode === 'map'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-slate-300 hover:text-slate-50 hover:bg-slate-800'
                  }`}
                >
                  <MapIcon className="w-4 h-4" />
                  Mapa
                </button>
              </div>
            )}
          </div>

          {/* Search & Filter Component (US-4.1, US-4.2, US-4.7) */}
          <SearchFilters
            filters={filters}
            onChangeFilter={handleFilterChange}
            onReset={handleResetFilters}
            totalResults={totalCount ?? listings.length}
            hideTipoFilter={!!intentTipo}
          />

          {viewMode === 'map' && showMapToggle ? (
            <MapView
              listings={sortedListings}
              citySlug={!isDepartmentFeed && !isNationalFeed ? citySlug : undefined}
              turnstileToken={turnstileToken}
              onTurnstileConsumed={refreshTurnstile}
            />
          ) : (
            <ListingGrid
              listings={sortedListings}
              isLoading={isLoading}
              hasMore={!!nextCursor}
              isLoadingMore={isLoadingMore}
              onLoadMore={handleLoadMore}
              onShareWhatsApp={(item) => setNewlyCreatedListing(item)}
              onRefresh={loadListings}
              onOpenPublish={handleOpenPublish}
              turnstileToken={turnstileToken}
              onTurnstileConsumed={refreshTurnstile}
            />
          )}
        </main>
      </div>

      {/* US-6.5: invisible, renders nothing visible — see components/Turnstile.tsx */}
      <TurnstileContainer containerRef={turnstileRef} />

      {/* Footer */}
      <Footer />

      {/* Publish Modal (<60s Flow - US-2.1 & US-3.1) */}
      <PublishModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        defaultTipo={publishDefaultTipo}
        defaultCiudad={cityName}
        defaultDepartmentSlug={departmentSlug}
        onSuccessPublished={handleSuccessPublished}
      />

      {/* WhatsApp Share & PIN Confirmation Modal (US-2.2) */}
      <ShareModal
        listing={newlyCreatedListing}
        onClose={() => setNewlyCreatedListing(null)}
      />

      {/* Data policy banner (2026-08-22): cookie-consent style — informational,
          non-blocking, dismissible. Replaced a full-screen modal that gated
          first-time visitors out of the page until they clicked accept. */}
      {isPolicyBannerOpen && (
        <div
          role="region"
          aria-label="Aviso de política de datos"
          className="fixed inset-x-0 bottom-0 z-[90] border-t border-slate-700 bg-slate-900/95 backdrop-blur-sm px-4 py-4 sm:px-6"
        >
          <div className="mx-auto max-w-5xl relative">
            <button
              type="button"
              aria-label="Cerrar aviso"
              onClick={() => {
                setDataPolicyAccepted(true);
                setIsPolicyBannerOpen(false);
              }}
              className="absolute -top-1 right-0 rounded-lg p-1 text-slate-400 transition-colors hover:text-slate-200"
            >
              ×
            </button>
            <p className="pr-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
              En Alojamiento Solidario Colombia usamos el almacenamiento local de tu navegador
              únicamente para recordar preferencias como el idioma de visualización, la ciudad que estás
              consultando y si ya viste este aviso, con el fin de mejorar tu experiencia y evitar
              mostrarte de nuevo esta misma información en cada visita. No usamos cookies de rastreo ni
              compartimos estos datos con terceros ni con fines comerciales o publicitarios. Al continuar
              navegando en la plataforma confirmas que conoces el tratamiento que damos a los datos que
              nos compartes al publicar o contactar por WhatsApp, de acuerdo con la Ley 1581 de 2012.
            </p>
            <div className="mt-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/terminos-y-privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
              >
                Política de privacidad y Habeas Data
              </Link>
              <button
                type="button"
                onClick={() => {
                  setDataPolicyAccepted(true);
                  setIsPolicyBannerOpen(false);
                }}
                className="w-full sm:w-auto shrink-0 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
