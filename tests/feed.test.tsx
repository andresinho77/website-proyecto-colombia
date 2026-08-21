import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListingGrid } from '../components/ListingGrid';
import { listingsFixture, listingOfrezco, listingNecesito } from './fixtures/listings';

// US-6.5: ListingCard's "Contactar" button calls getContactLink instead of
// building a static wa.me href — mocked so these tests don't depend on the
// real fetch/offline-fallback behavior (that's covered in api-contact.test.ts).
const getContactLink = vi.hoisted(() => vi.fn());
vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api')>();
  return { ...actual, getContactLink };
});

describe('ListingGrid (feed)', () => {
  it('renderiza una tarjeta por publicación con ciudad, zona/barrio y tipo', () => {
    render(<ListingGrid listings={listingsFixture} />);

    expect(screen.getByText(/OFREZCO ALOJAMIENTO/i)).toBeInTheDocument();
    expect(screen.getByText(/NECESITO ALOJAMIENTO/i)).toBeInTheDocument();

    // La tarjeta combina zona + barrio como "Zona · Barrio" cuando hay barrio (US-4.4).
    expect(
      screen.getByText(`${listingOfrezco.zona} · ${listingOfrezco.barrio}`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${listingNecesito.zona} · ${listingNecesito.barrio}`)
    ).toBeInTheDocument();
    // `exact: false`: la tarjeta envuelve la descripción en comillas tipográficas.
    expect(screen.getByText(listingOfrezco.descripcion, { exact: false })).toBeInTheDocument();
  });

  it('muestra "Gratis ($0)" cuando el precio es cero y el monto en COP cuando no', () => {
    render(<ListingGrid listings={listingsFixture} />);

    expect(screen.getByText('Gratis ($0)')).toBeInTheDocument();
    expect(screen.getByText('$200.000 COP')).toBeInTheDocument();
  });

  it('muestra el estado vacío con CTAs de publicación cuando no hay resultados', async () => {
    const onOpenPublish = vi.fn();
    render(<ListingGrid listings={[]} onOpenPublish={onOpenPublish} />);

    expect(screen.getByText('No se encontraron publicaciones')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Publicar Necesidad/i }));
    expect(onOpenPublish).toHaveBeenCalledWith('necesito');

    await userEvent.click(screen.getByRole('button', { name: /Ofrecer Espacio/i }));
    expect(onOpenPublish).toHaveBeenCalledWith('ofrezco');
  });

  it('muestra el skeleton de carga solo quando no hay tarjetas todavía (primera carga)', () => {
    const { container } = render(<ListingGrid listings={[]} isLoading />);

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(6);
    expect(screen.queryByText(listingOfrezco.descripcion, { exact: false })).not.toBeInTheDocument();
  });

  it('bug fix (2026-08-21): con tarjetas ya en pantalla, un refetch (isLoading) las atenúa en vez de reemplazarlas por el skeleton', () => {
    const { container } = render(<ListingGrid listings={listingsFixture} isLoading />);

    // Nada de skeleton — las tarjetas existentes siguen ahí, solo atenuadas.
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(0);
    expect(screen.getByText(listingOfrezco.descripcion, { exact: false })).toBeInTheDocument();

    const grid = container.querySelector('[aria-busy="true"]');
    expect(grid).not.toBeNull();
    expect(grid).toHaveClass('opacity-50');
  });

  it('muestra el botón "Cargar más publicaciones" cuando hasMore es true y llama onLoadMore al hacer clic', async () => {
    const onLoadMore = vi.fn();
    render(<ListingGrid listings={listingsFixture} hasMore={true} onLoadMore={onLoadMore} />);

    const loadMoreBtn = screen.getByRole('button', { name: /Cargar más publicaciones/i });
    expect(loadMoreBtn).toBeInTheDocument();

    await userEvent.click(loadMoreBtn);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });
});

describe('ListingCard contact reveal (US-6.5)', () => {
  let openSpy: ReturnType<typeof vi.spyOn>;
  let fakeTab: { location: { href: string }; close: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    getContactLink.mockReset();
    fakeTab = { location: { href: '' }, close: vi.fn() };
    // window.open must be called synchronously inside the click handler
    // (before any `await`) so the tab it opens survives popup blockers —
    // asserting the call happened at all guards against a regression back
    // to opening it after the async getContactLink() resolves.
    openSpy = vi.spyOn(window, 'open').mockReturnValue(fakeTab as unknown as Window);
  });

  it('abre una pestaña en blanco de inmediato y la redirige a wa.me al resolver el número', async () => {
    getContactLink.mockResolvedValue({ success: true, whatsapp: listingOfrezco.whatsapp });
    render(<ListingGrid listings={[listingOfrezco]} />);

    await userEvent.click(screen.getByRole('button', { name: /Contactar por WhatsApp/i }));

    // Pestaña abierta ya, antes de que getContactLink haya resuelto. Sin
    // 'noopener'/'noreferrer': con cualquiera de los dos el navegador
    // devuelve null en vez de la referencia que se necesita para redirigir
    // la pestaña más abajo.
    expect(openSpy).toHaveBeenCalledWith('', '_blank');
    await waitFor(() => expect(getContactLink).toHaveBeenCalledWith(listingOfrezco.id, undefined));
    await waitFor(() => expect(fakeTab.location.href).toContain('wa.me'));
    expect(fakeTab.location.href).toContain(listingOfrezco.whatsapp.replace(/\D/g, ''));
  });

  it('muestra el error y cierra la pestaña pendiente si getContactLink falla', async () => {
    getContactLink.mockResolvedValue({ success: false, error: 'Demasiadas solicitudes.' });
    render(<ListingGrid listings={[listingOfrezco]} />);

    await userEvent.click(screen.getByRole('button', { name: /Contactar por WhatsApp/i }));

    expect(await screen.findByText('Demasiadas solicitudes.')).toBeInTheDocument();
    expect(fakeTab.close).toHaveBeenCalled();
    expect(fakeTab.location.href).toBe('');
  });
});
