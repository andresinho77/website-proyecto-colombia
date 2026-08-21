import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CityFeedPage from '../components/CityFeedPage';
import { listingsFixture } from './fixtures/listings';

// US-1.5: dismissing the emergency banner is remembered (localStorage) and
// reopening it is one click away via a phone icon next to Habeas Data.
const fetchListings = vi.hoisted(() => vi.fn());
vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api')>();
  return { ...actual, fetchListings };
});

describe('EmergencyBanner dismiss/reopen (US-1.5)', () => {
  beforeEach(() => {
    fetchListings.mockResolvedValue({ items: listingsFixture, totalCount: 2 });
    window.localStorage.clear();
  });

  it('se muestra por defecto para un visitante nuevo', async () => {
    render(<CityFeedPage cityName="Pereira" citySlug="pereira" />);
    expect(await screen.findByText(/Líneas de atención nacional de emergencia/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Mostrar líneas de atención de emergencia/i)).not.toBeInTheDocument();
  });

  it('al cerrar con el botón "×", desaparece y se recuerda en localStorage', async () => {
    render(<CityFeedPage cityName="Pereira" citySlug="pereira" />);
    await screen.findByText(/Líneas de atención nacional de emergencia/i);

    await userEvent.click(screen.getByLabelText(/Cerrar aviso de líneas de emergencia/i));

    expect(screen.queryByText(/Líneas de atención nacional de emergencia/i)).not.toBeInTheDocument();
    expect(window.localStorage.getItem('alojamiento_solidario_emergency_banner_dismissed')).toBe('true');
    // El ícono de reapertura aparece en el Navbar tras cerrar.
    expect(screen.getByLabelText(/Mostrar líneas de atención de emergencia/i)).toBeInTheDocument();
  });

  it('no se muestra en un render nuevo si ya estaba cerrado en localStorage', async () => {
    window.localStorage.setItem('alojamiento_solidario_emergency_banner_dismissed', 'true');
    render(<CityFeedPage cityName="Pereira" citySlug="pereira" />);

    await waitFor(() =>
      expect(screen.getByLabelText(/Mostrar líneas de atención de emergencia/i)).toBeInTheDocument()
    );
    expect(screen.queryByText(/Líneas de atención nacional de emergencia/i)).not.toBeInTheDocument();
  });

  it('el ícono de teléfono del Navbar reabre el banner y limpia localStorage', async () => {
    window.localStorage.setItem('alojamiento_solidario_emergency_banner_dismissed', 'true');
    render(<CityFeedPage cityName="Pereira" citySlug="pereira" />);

    const reopenBtn = await screen.findByLabelText(/Mostrar líneas de atención de emergencia/i);
    await userEvent.click(reopenBtn);

    expect(await screen.findByText(/Líneas de atención nacional de emergencia/i)).toBeInTheDocument();
    expect(window.localStorage.getItem('alojamiento_solidario_emergency_banner_dismissed')).toBeNull();
  });
});
