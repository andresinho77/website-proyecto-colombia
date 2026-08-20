"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
        {/* Top Emergency Lines Banner */}
        <EmergencyBanner />

        {/* Header / Navbar (US-1.2) */}
        <Navbar
          currentCitySlug={citySlug || 'pereira'}
          currentDeptSlug={departmentSlug}
          isDepartmentFeed={isDepartmentFeed}
          isNationalFeed={isNationalFeed}
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
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-100 tracking-tight">
                {titleText}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {subtitleText}
              </p>
            </div>
          </div>

          {/* Search & Filter Component (US-4.1, US-4.2, US-4.7) */}
          <SearchFilters
            filters={filters}
            onChangeFilter={handleFilterChange}
            onReset={handleResetFilters}
            totalResults={totalCount ?? listings.length}
            hideTipoFilter={!!intentTipo}
          />

          {/* Listing Grid */}
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
    </div>
  );
}
