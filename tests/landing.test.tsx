import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CityFeedPage from '../components/CityFeedPage';
import { listingsFixture, listingOfrezco } from './fixtures/listings';

// La landing es la única superficie que llama a la API en el primer render.
// Se mockea `fetchListings` para que el smoke test no dependa de red ni del
// fallback silencioso a MOCK_LISTINGS de `lib/api.ts`.
const fetchListings = vi.hoisted(() => vi.fn());

vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api')>();
  return { ...actual, fetchListings };
});

describe('CityFeedPage (components/CityFeedPage.tsx)', () => {
  beforeEach(() => {
    fetchListings.mockResolvedValue({ items: listingsFixture, totalCount: 2 });
  });

  it('renderiza la estructura principal: banner, hero, feed y footer', async () => {
    render(<CityFeedPage cityName="Pereira" citySlug="pereira" />);

    expect(
      screen.getByRole('heading', { name: /Alojamientos solidarios en Pereira/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Filtros de Búsqueda/i })).toBeInTheDocument();
    expect(document.querySelector('main#feed')).not.toBeNull();

    await waitFor(() => expect(fetchListings).toHaveBeenCalled());
  });

  it('pide las publicaciones de la ciudad de la ruta con los filtros por defecto y las pinta en el feed', async () => {
    render(<CityFeedPage cityName="Pereira" citySlug="pereira" />);

    // `exact: false`: la tarjeta envuelve la descripción en comillas tipográficas.
    expect(
      await screen.findByText(listingOfrezco.descripcion, { exact: false })
    ).toBeInTheDocument();

    expect(fetchListings).toHaveBeenCalledWith(
      expect.objectContaining({
        ciudad: 'Pereira',
        ciudadSlug: 'pereira',
        tipo: 'todos',
        zona: '',
        barrio: '',
        maxPrecio: '',
      })
    );
    expect(screen.getByText('2 publicaciones')).toBeInTheDocument();
  });

  it('muestra el estado vacío del feed cuando la API no devuelve publicaciones', async () => {
    fetchListings.mockResolvedValue({ items: [], totalCount: 0 });
    render(<CityFeedPage cityName="Pereira" citySlug="pereira" />);

    expect(await screen.findByText('No se encontraron publicaciones')).toBeInTheDocument();
    expect(screen.getByText('0 publicaciones')).toBeInTheDocument();
  });

  it('mantiene los modales cerrados en el render inicial', async () => {
    render(<CityFeedPage cityName="Pereira" citySlug="pereira" />);
    await waitFor(() => expect(fetchListings).toHaveBeenCalled());

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText(/Marcar como Resuelta/i)).not.toBeInTheDocument();
  });

  it('pide todas las publicaciones a nivel nacional cuando isNationalFeed es true', async () => {
    render(<CityFeedPage cityName="Colombia" isNationalFeed={true} />);

    expect(
      screen.getByRole('heading', { name: /Alojamientos solidarios en Colombia/i })
    ).toBeInTheDocument();

    expect(fetchListings).toHaveBeenCalledWith(
      expect.objectContaining({
        ciudad: '',
        ciudadSlug: '',
        departamento: '',
        departamentoSlug: '',
      })
    );
  });
});
