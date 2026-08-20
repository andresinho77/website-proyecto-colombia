import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { IntentNavBar } from '../components/IntentNavBar';

// US-4.5 follow-up: replaces the old full-width hero (HeroButtons, removed)
// with a persistent Todos/Necesito/Ofrezco bar + a single contextual "+"
// publish action (iOS Reminders/Todoist list-header idiom).
describe('IntentNavBar (components/IntentNavBar.tsx)', () => {
  it('sin intentTipo: el botón "+" abre un selector con las 2 opciones antes de publicar', async () => {
    const onOpenPublish = vi.fn();
    render(<IntentNavBar basePath="/pereira/" onOpenPublish={onOpenPublish} />);

    // Un solo botón "+" contextual, no uno por pestaña.
    const plusButton = screen.getByRole('button', { name: /Publicar \(elegir tipo\)/i });
    expect(onOpenPublish).not.toHaveBeenCalled();

    await userEvent.click(plusButton);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('menuitem', { name: /Necesito alojamiento/i }));
    expect(onOpenPublish).toHaveBeenCalledWith('necesito');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('con intentTipo="necesito": el botón "+" publica directo sin selector', async () => {
    const onOpenPublish = vi.fn();
    render(<IntentNavBar basePath="/pereira/" intentTipo="necesito" onOpenPublish={onOpenPublish} />);

    const plusButton = screen.getByRole('button', { name: /Publicar necesidad de alojamiento/i });
    await userEvent.click(plusButton);

    expect(onOpenPublish).toHaveBeenCalledWith('necesito');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('con intentTipo="ofrezco": el botón "+" publica directo con ese tipo', async () => {
    const onOpenPublish = vi.fn();
    render(<IntentNavBar basePath="/pereira/" intentTipo="ofrezco" onOpenPublish={onOpenPublish} />);

    await userEvent.click(screen.getByRole('button', { name: /Publicar espacio disponible/i }));
    expect(onOpenPublish).toHaveBeenCalledWith('ofrezco');
  });

  it('las pestañas enlazan a las rutas del basePath dado y marcan la activa', () => {
    render(<IntentNavBar basePath="/departamento/valle-del-cauca/" intentTipo="ofrezco" onOpenPublish={vi.fn()} />);

    // Next.js' <Link> normaliza el trailing slash en el href renderizado.
    expect(screen.getByRole('tab', { name: 'Todos' })).toHaveAttribute('href', '/departamento/valle-del-cauca');
    expect(screen.getByRole('tab', { name: 'Necesito' })).toHaveAttribute(
      'href',
      '/departamento/valle-del-cauca/necesito'
    );
    const ofrezcoTab = screen.getByRole('tab', { name: 'Ofrezco' });
    expect(ofrezcoTab).toHaveAttribute('href', '/departamento/valle-del-cauca/ofrezco');
    expect(ofrezcoTab).toHaveAttribute('aria-selected', 'true');
  });
});
