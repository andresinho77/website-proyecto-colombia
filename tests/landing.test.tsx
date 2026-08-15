import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from '../app/page';
import { listingsFixture, listingOfrezco } from './fixtures/listings';

// La landing es la única superficie que llama a la API en el primer render.
// Se mockea `fetchListings` para que el smoke test no dependa de red ni del
// fallback silencioso a MOCK_LISTINGS de `lib/api.ts`.
const fetchListings = vi.hoisted(() => vi.fn());

vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api')>();
  return { ...actual, fetchListings };
});

describe('Landing (app/page.tsx)', () => {
  beforeEach(() => {
    fetchListings.mockResolvedValue(listingsFixture);
  });

  it('renderiza la estructura principal: banner, hero, feed y footer', async () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', { name: /Feed de Alojamientos Solidarios/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Filtros de Búsqueda/i })).toBeInTheDocument();
    expect(document.querySelector('main#feed')).not.toBeNull();

    await waitFor(() => expect(fetchListings).toHaveBeenCalled());
  });

  it('pide las publicaciones con los filtros por defecto y las pinta en el feed', async () => {
    render(<Home />);

    // `exact: false`: la tarjeta envuelve la descripción en comillas tipográficas.
    expect(
      await screen.findByText(listingOfrezco.descripcion, { exact: false })
    ).toBeInTheDocument();

    expect(fetchListings).toHaveBeenCalledWith({
      ciudad: '',
      tipo: 'todos',
      barrio: '',
      maxPrecio: '',
    });
    expect(screen.getByText('2 publicaciones')).toBeInTheDocument();
  });

  it('muestra el estado vacío del feed cuando la API no devuelve publicaciones', async () => {
    fetchListings.mockResolvedValue([]);
    render(<Home />);

    expect(await screen.findByText('No se encontraron publicaciones')).toBeInTheDocument();
    expect(screen.getByText('0 publicaciones')).toBeInTheDocument();
  });

  it('mantiene los modales cerrados en el render inicial', async () => {
    render(<Home />);
    await waitFor(() => expect(fetchListings).toHaveBeenCalled());

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText(/Marcar como Resuelta/i)).not.toBeInTheDocument();
  });
});
