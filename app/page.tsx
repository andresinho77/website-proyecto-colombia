"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { HeroButtons } from '../components/HeroButtons';
import { SearchFilters } from '../components/SearchFilters';
import { ListingGrid } from '../components/ListingGrid';
import { PublishModal } from '../components/PublishModal';
import { ShareModal } from '../components/ShareModal';
import { PrivacyPolicyModal } from '../components/PrivacyPolicyModal';
import { Footer } from '../components/Footer';
import { Listing, FilterState, ListingType } from '../lib/types';
import { fetchListings } from '../lib/api';

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter State (US-4.1, US-4.2)
  const [filters, setFilters] = useState<FilterState>({
    ciudad: '',
    tipo: 'todos',
    barrio: '',
    maxPrecio: '',
  });

  // Modal States
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [publishDefaultTipo, setPublishDefaultTipo] = useState<ListingType>('ofrezco');
  const [newlyCreatedListing, setNewlyCreatedListing] = useState<Listing | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const loadListings = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchListings(filters);
    setListings(data);
    setIsLoading(false);
  }, [filters]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const handleOpenPublish = (defaultTipo: ListingType = 'ofrezco') => {
    setPublishDefaultTipo(defaultTipo);
    setIsPublishOpen(true);
  };

  const handleSelectHeroTipo = (tipo: ListingType) => {
    // Also filter the feed to match selected choice or open publish modal
    setFilters((prev) => ({ ...prev, tipo }));
    handleOpenPublish(tipo);
  };

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      ciudad: '',
      tipo: 'todos',
      barrio: '',
      maxPrecio: '',
    });
  };

  const handleSuccessPublished = (listing: Listing) => {
    setNewlyCreatedListing(listing);
    loadListings();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-solidarity-500 selection:text-white">
      <div>
        {/* Top Emergency Lines Banner */}
        <EmergencyBanner />

        {/* Header / Navbar (US-1.2) */}
        <Navbar onOpenPublish={handleOpenPublish} />

        {/* Main Hero Section (US-1.1: 2 large buttons <2s load) */}
        <HeroButtons onSelectTipo={handleSelectHeroTipo} />

        {/* Listings Feed Section */}
        <main id="feed" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Feed de Alojamientos Solidarios
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-light mt-1">
                Publicaciones activas más recientes. Contacta directamente por WhatsApp en 1-clic.
              </p>
            </div>
          </div>

          {/* Search & Filter Component (US-4.1, US-4.2) */}
          <SearchFilters
            filters={filters}
            onChangeFilter={handleFilterChange}
            onReset={handleResetFilters}
            totalResults={listings.length}
          />

          {/* Listing Grid */}
          <ListingGrid
            listings={listings}
            isLoading={isLoading}
            onShareWhatsApp={(item) => setNewlyCreatedListing(item)}
            onRefresh={loadListings}
            onOpenPublish={handleOpenPublish}
          />
        </main>
      </div>

      {/* Footer */}
      <Footer onOpenPrivacy={() => setIsPrivacyOpen(true)} />

      {/* Publish Modal (<60s Flow - US-2.1 & US-3.1) */}
      <PublishModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        defaultTipo={publishDefaultTipo}
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
