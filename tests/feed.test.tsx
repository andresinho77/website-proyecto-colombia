import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ListingGrid } from '../components/ListingGrid';
import { listingsFixture, listingOfrezco, listingNecesito } from './fixtures/listings';

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

  it('muestra el skeleton de carga y ninguna tarjeta mientras isLoading es true', () => {
    const { container } = render(<ListingGrid listings={listingsFixture} isLoading />);

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(6);
    expect(screen.queryByText(listingOfrezco.descripcion, { exact: false })).not.toBeInTheDocument();
  });
});
