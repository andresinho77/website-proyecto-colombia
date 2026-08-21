import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CityFeedPage from '../components/CityFeedPage';
import { listingsFixture } from './fixtures/listings';

// US-4.3: the Lista/Mapa toggle appears for city-scoped feeds only when
// that city is one of the 7 priority cities with curated zone coordinates
// (lib/zoneCoordinates.ts), and unconditionally for department/national
// feeds (2026-08-21 — MapView places each listing by its own city, so a
// department/national map is meaningful even if only some results have a
// priority-city match). MapView itself (react-leaflet) needs real DOM
// measurement Leaflet doesn't get reliably from jsdom, so it's mocked here
// — this suite only covers the toggle's visibility/switching, not Leaflet's
// own rendering.
const fetchListings = vi.hoisted(() => vi.fn());
vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api')>();
  return { ...actual, fetchListings };
});

vi.mock('../components/MapView', () => ({
  default: ({ citySlug }: { citySlug: string }) => <div data-testid="map-view-stub">Mapa de {citySlug}</div>,
}));

describe('CityFeedPage — toggle Lista/Mapa (US-4.3)', () => {
  beforeEach(() => {
    fetchListings.mockResolvedValue({ items: listingsFixture, totalCount: 2 });
  });

  it('se muestra para una ciudad prioritaria (Pereira) y cambia a la vista de mapa al hacer clic', async () => {
    render(<CityFeedPage cityName="Pereira" citySlug="pereira" />);
    await screen.findByText(listingsFixture[0].descripcion, { exact: false });

    const mapTab = screen.getByRole('tab', { name: /Mapa/i });
    expect(mapTab).toBeInTheDocument();
    expect(screen.queryByTestId('map-view-stub')).not.toBeInTheDocument();

    await userEvent.click(mapTab);
    expect(await screen.findByTestId('map-view-stub')).toHaveTextContent('Mapa de pereira');
  });

  it('no se muestra para una ciudad sin coordenadas curadas', async () => {
    render(<CityFeedPage cityName="Leticia" citySlug="leticia" />);
    await screen.findByText(listingsFixture[0].descripcion, { exact: false });

    expect(screen.queryByRole('tab', { name: /Mapa/i })).not.toBeInTheDocument();
  });

  it('se muestra para el feed nacional, sin fijar citySlug (MapView decide el centro por listing)', async () => {
    render(<CityFeedPage cityName="Colombia" isNationalFeed />);
    await screen.findByText(listingsFixture[0].descripcion, { exact: false });

    const mapTab = screen.getByRole('tab', { name: /Mapa/i });
    await userEvent.click(mapTab);
    expect(await screen.findByTestId('map-view-stub')).toHaveTextContent('Mapa de'); // sin ciudad después
  });

  it('se muestra para un feed de departamento', async () => {
    render(<CityFeedPage cityName="Risaralda" isDepartmentFeed departmentName="Risaralda" departmentSlug="risaralda" />);
    await screen.findByText(listingsFixture[0].descripcion, { exact: false });

    expect(screen.getByRole('tab', { name: /Mapa/i })).toBeInTheDocument();
  });
});
