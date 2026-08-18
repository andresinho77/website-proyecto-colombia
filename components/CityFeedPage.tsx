"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './Navbar';
import { EmergencyBanner } from './EmergencyBanner';
import { HeroButtons } from './HeroButtons';
import { SearchFilters } from './SearchFilters';
import { ListingGrid } from './ListingGrid';
import { PublishModal } from './PublishModal';
import { ShareModal } from './ShareModal';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
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
}

export default function CityFeedPage({
  cityName = '',
  citySlug = '',
  departmentName,
  departmentSlug,
  isDepartmentFeed = false,
  isNationalFeed = false,
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
    tipo: 'todos',
    zona: '',
    barrio: '',
    maxPrecio: '',
    limit: 24,
  });

  // Modal States
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [publishDefaultTipo, setPublishDefaultTipo] = useState<ListingType>('ofrezco');
  const [newlyCreatedListing, setNewlyCreatedListing] = useState<Listing | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

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

  const handleSelectHeroTipo = (tipo: ListingType) => {
    setFilters((prev) => ({ ...prev, tipo }));
    handleOpenPublish(tipo);
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
      tipo: 'todos',
      zona: '',
      barrio: '',
      maxPrecio: '',
      limit: 24,
    });
  };

  const handleSuccessPublished = (listing: Listing) => {
    setNewlyCreatedListing(listing);
    loadListings();
  };

  const titleText = isNationalFeed
    ? 'Alojamientos solidarios en Colombia'
    : isDepartmentFeed
    ? `Alojamientos solidarios en ${departmentName}`
    : `Alojamientos solidarios en ${cityName}${departmentName ? ` (${departmentName})` : ''}`;

  const subtitleText = isNationalFeed
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
          onOpenPublish={handleOpenPublish}
        />

        {/* Main Hero Section (US-1.1: 2 large buttons <2s load) */}
        <HeroButtons onSelectTipo={handleSelectHeroTipo} />

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

          {/* Search & Filter Component (US-4.1, US-4.2) */}
          <SearchFilters
            filters={filters}
            onChangeFilter={handleFilterChange}
            onReset={handleResetFilters}
            totalResults={totalCount ?? listings.length}
          />

          {/* Listing Grid */}
          <ListingGrid
            listings={listings}
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
      <Footer onOpenPrivacy={() => setIsPrivacyOpen(true)} />

      {/* Publish Modal (<60s Flow - US-2.1 & US-3.1) */}
      <PublishModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        defaultTipo={publishDefaultTipo}
        defaultCiudad={cityName || (departmentName ? undefined : 'Pereira')}
        onSuccessPublished={handleSuccessPublished}
      />

      {/* WhatsApp Share & PIN Confirmation Modal (US-2.2) */}
      <ShareModal
        listing={newlyCreatedListing}
        onClose={() => setNewlyCreatedListing(null)}
      />

      {/* Privacy Policy / Habeas Data Modal (Ley 1581) */}
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
