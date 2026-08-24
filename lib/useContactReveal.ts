"use client";

import { useState } from 'react';
import { Listing } from './types';
import { getContactLink } from './api';
import { getListingUrl } from './listingUrl';

/**
 * US-5.1 + US-6.5's "reveal WhatsApp on click" flow, extracted out of
 * ListingCard.tsx (US-4.3) so the map view's popup can offer the same
 * "Contactar por WhatsApp" action without re-deriving the popup-blocker
 * timing fix or the offline fallback behavior — both already covered by
 * `tests/feed.test.tsx`'s "ListingCard contact reveal" suite, which this
 * hook must keep passing unchanged.
 */
export function useContactReveal(
  listing: Listing,
  turnstileToken?: string | null,
  onTurnstileConsumed?: () => void
) {
  const [isContacting, setIsContacting] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const isOfrezco = listing.tipo === 'ofrezco';
  const location = listing.barrio ? `${listing.zona} · ${listing.barrio}` : listing.zona;

  const buildWhatsAppUrl = (whatsapp: string) => {
    const cleanPhone = whatsapp.replace(/\D/g, '');
    const postUrl = getListingUrl(listing);

    const text = encodeURIComponent(
      `Hola, vi tu publicación en Alojamiento Solidario Colombia (${
        isOfrezco ? 'Ofrezco' : 'Necesito'
      } en ${listing.ciudad}, ${location}) [Ref: ${listing.id.substring(
        0,
        6
      )}]. ¿Podemos hablar? Ver publicación: ${postUrl}`
    );
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  const handleContactClick = async () => {
    setContactError(null);
    setIsContacting(true);

    // Open the tab synchronously, inside the click handler's own call stack
    // — once we `await` below we're no longer in the original user gesture,
    // and Safari (reliably) and Chrome (in some conditions) silently block
    // a `window.open()` issued after that point, treating it as an
    // unrequested popup rather than a user-initiated navigation. Opening a
    // blank tab now and redirecting it once the number resolves keeps this
    // tied to the gesture either way.
    //
    // Deliberately NOT passing 'noopener'/'noreferrer' here: either one
    // makes the browser return `null` instead of a window reference (spec
    // behavior — noreferrer implies noopener), which is exactly the
    // reference this code needs to redirect the tab once the number
    // resolves. Safe to omit because we set this tab's location ourselves,
    // right below, to a URL we build (wa.me + our own sanitized text) — the
    // opened page never runs attacker-controlled content that could abuse
    // `window.opener`.
    const pendingTab = window.open('', '_blank');

    const res = await getContactLink(listing.id, turnstileToken);
    setIsContacting(false);
    onTurnstileConsumed?.();

    if (!res.success || !res.whatsapp) {
      pendingTab?.close();
      setContactError(res.error || 'No se pudo obtener el contacto. Intenta de nuevo.');
      return;
    }
    if (pendingTab) {
      pendingTab.location.href = buildWhatsAppUrl(res.whatsapp);
    } else {
      // Popup was blocked even for the synchronous open (e.g. browser
      // setting disabling new tabs outright) — fall back to same-tab nav
      // rather than silently doing nothing.
      window.location.href = buildWhatsAppUrl(res.whatsapp);
    }
  };

  return { isContacting, contactError, handleContactClick };
}
