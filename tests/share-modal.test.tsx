import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShareModal } from '../components/ShareModal';
import { ListingGrid } from '../components/ListingGrid';
import { listingOfrezco } from './fixtures/listings';
import { getListingUrl } from '../lib/listingUrl';
import { Listing } from '../lib/types';

const listingConPin: Listing = { ...listingOfrezco, pin: '1234' };

/** Texto que WhatsApp recibiría, ya decodificado desde ?text=. */
const sharedText = () => {
  const href = screen.getByRole('link', { name: /Compartir por WhatsApp/i }).getAttribute('href')!;
  return decodeURIComponent(new URL(href).searchParams.get('text') || '');
};

describe('ShareModal (US-2.2)', () => {
  it('comparte por WhatsApp el enlace directo a la publicación', async () => {
    render(<ShareModal listing={listingOfrezco} onClose={vi.fn()} variant="share" />);

    const texto = sharedText();
    expect(texto).toContain(getListingUrl(listingOfrezco));
    // El enlace queda aislado al final para que WhatsApp lo haga tocable.
    expect(texto.trimEnd().endsWith(getListingUrl(listingOfrezco))).toBe(true);
  });

  it('muestra el enlace visible y lo copia al portapapeles', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ShareModal listing={listingOfrezco} onClose={vi.fn()} variant="share" />);

    const input = screen.getByLabelText('Enlace de la publicación') as HTMLInputElement;
    expect(input.value).toBe(getListingUrl(listingOfrezco));

    await userEvent.click(screen.getByRole('button', { name: /Copiar/i }));
    expect(writeText).toHaveBeenCalledWith(getListingUrl(listingOfrezco));
    expect(await screen.findByText(/¡Copiado!/)).toBeInTheDocument();
  });

  it('no revela el PIN del autor ni dice "tu publicación" al compartir del feed', () => {
    render(<ShareModal listing={listingConPin} onClose={vi.fn()} variant="share" />);

    expect(screen.getByText('Compartir publicación')).toBeInTheDocument();
    expect(screen.queryByText(/Clave de Edición/i)).not.toBeInTheDocument();
    expect(screen.queryByText('1234')).not.toBeInTheDocument();
    expect(screen.queryByText(/Publicación exitosa/i)).not.toBeInTheDocument();
  });

  it('sigue entregando el PIN al autor tras publicar (variante published)', () => {
    render(<ShareModal listing={listingConPin} onClose={vi.fn()} variant="published" />);

    expect(screen.getByText('Publicación exitosa')).toBeInTheDocument();
    expect(screen.getByText(/Clave de Edición/i)).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
    expect(sharedText()).toContain(getListingUrl(listingConPin));
  });

  it('no renderiza nada sin publicación', () => {
    const { container } = render(<ShareModal listing={null} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('Botón "Compartir" de la tarjeta', () => {
  beforeEach(() => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
  });

  it('entrega la publicación de esa tarjeta al handler de compartir', async () => {
    const onShareWhatsApp = vi.fn();
    render(<ListingGrid listings={[listingOfrezco]} onShareWhatsApp={onShareWhatsApp} />);

    await userEvent.click(screen.getByRole('button', { name: /Compartir/i }));
    expect(onShareWhatsApp).toHaveBeenCalledWith(listingOfrezco);
  });
});
