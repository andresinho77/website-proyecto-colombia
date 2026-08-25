import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RenovarPage from '../app/renovar/page';

// US-7.3: query-param-based confirm page (`?id=&pin=`), not a `/[id]/`
// dynamic segment — this is a static export, so there's no server to
// resolve an unbounded id space at request time.
const renewListing = vi.hoisted(() => vi.fn());
vi.mock('../lib/api', () => ({ renewListing }));

let searchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useSearchParams: () => searchParams,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

describe('app/renovar/page.tsx', () => {
  beforeEach(() => {
    searchParams = new URLSearchParams();
    renewListing.mockReset();
  });

  it('confirma la renovación cuando id y pin son válidos', async () => {
    searchParams.set('id', 'listing-1');
    searchParams.set('pin', '1234');
    renewListing.mockResolvedValue({ success: true });

    render(<RenovarPage />);

    expect(await screen.findByText(/sigue activa/i)).toBeInTheDocument();
    expect(renewListing).toHaveBeenCalledWith('listing-1', '1234');
  });

  it('muestra el error del backend si el PIN es incorrecto', async () => {
    searchParams.set('id', 'listing-1');
    searchParams.set('pin', '9999');
    renewListing.mockResolvedValue({ success: false, error: 'PIN incorrecto.' });

    render(<RenovarPage />);

    expect(await screen.findByText('PIN incorrecto.')).toBeInTheDocument();
  });

  it('muestra un error si falta el id o el pin en el enlace', async () => {
    render(<RenovarPage />);

    expect(await screen.findByText(/enlace de renovación inválido/i)).toBeInTheDocument();
    expect(renewListing).not.toHaveBeenCalled();
  });
});
