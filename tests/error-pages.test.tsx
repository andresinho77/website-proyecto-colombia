import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import NotFound from '../app/not-found';
import GlobalError from '../app/error';

// US-1.6: custom 404/500 pages instead of Next.js' defaults.
describe('app/not-found.tsx', () => {
  it('muestra copy en español y un enlace de vuelta al feed', async () => {
    render(<NotFound />);

    expect(screen.getByText(/No encontramos esta página/i)).toBeInTheDocument();
    const link = await screen.findByRole('link', { name: /Volver al feed de alojamientos/i });
    // Sin nada en localStorage, cae al DEFAULT_CITY (ver lib/useHomeHref.ts).
    // Next.js <Link> normaliza el trailing slash en el href renderizado.
    expect(link).toHaveAttribute('href', expect.stringMatching(/^\/[a-z-]+$/));
  });
});

describe('app/error.tsx', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('muestra el mensaje genérico y los botones de acción siempre', async () => {
    const reset = vi.fn();
    render(<GlobalError error={new Error('boom')} reset={reset} />);

    expect(screen.getByText(/Algo salió mal/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Intentar de nuevo/i }));
    expect(reset).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('link', { name: /Volver al feed/i })).toBeInTheDocument();
  });

  it('SEGURIDAD: nunca muestra error.stack/message cuando NODE_ENV es production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const error = new Error('mensaje sensible de prueba');
    error.stack = 'Error: mensaje sensible de prueba\n    at /server/secret/path.ts:42:1';

    render(<GlobalError error={error} reset={vi.fn()} />);

    expect(screen.queryByText(/Detalles técnicos/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/mensaje sensible de prueba/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/secret\/path\.ts/i)).not.toBeInTheDocument();
  });

  it('muestra error.stack/message solo cuando NODE_ENV no es production', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const error = new Error('detalle solo para desarrollo');

    render(<GlobalError error={error} reset={vi.fn()} />);

    expect(screen.getByText(/Detalles técnicos/i)).toBeInTheDocument();
    expect(screen.getByText(/detalle solo para desarrollo/i)).toBeInTheDocument();
  });
});
