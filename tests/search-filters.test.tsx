import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SearchFilters } from '../components/SearchFilters';
import { FilterState } from '../lib/types';

// US-4.9: below `lg:` the always-open filter grid collapses to a compact
// trigger bar that opens FilterSheet, instead of pushing listings out of
// the first screen on mobile — this suite covers that flow directly
// (CityFeedPage/landing tests already cover the unified count assertions).
const baseFilters: FilterState = {
  ciudad: 'Pereira',
  ciudadSlug: 'pereira',
  tipo: 'todos',
  zona: '',
  barrio: '',
  maxPrecio: '',
  sortBy: 'recientes',
};

describe('SearchFilters (components/SearchFilters.tsx)', () => {
  it('la barra compacta de mobile abre FilterSheet, que muestra los mismos controles', async () => {
    const onChangeFilter = vi.fn();
    render(
      <SearchFilters
        filters={baseFilters}
        onChangeFilter={onChangeFilter}
        onReset={vi.fn()}
        totalResults={5}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /^Filtros/i }));

    // El sheet no usa role="dialog" explícito, pero su botón "Cerrar filtros"
    // solo existe cuando está abierto.
    const closeBtn = await screen.findByRole('button', { name: /Cerrar filtros/i });
    expect(closeBtn).toBeInTheDocument();
    // FilterFields (Zona, Barrio, Precio, Ordenar) se renderiza dentro del
    // sheet — "Ordenar por" también existe en el panel de desktop (oculto
    // solo por CSS), de ahí getAllByText en vez de uno solo.
    expect(screen.getAllByText('Ordenar por').length).toBeGreaterThan(0);
  });

  it('no muestra el badge de contador ni chips cuando no hay filtros activos', () => {
    render(
      <SearchFilters
        filters={baseFilters}
        onChangeFilter={vi.fn()}
        onReset={vi.fn()}
        totalResults={5}
      />
    );

    expect(screen.queryByText('Zona: ')).not.toBeInTheDocument();
    // El boton "Limpiar" solo aparece cuando hay chips activos.
    expect(screen.queryByRole('button', { name: /^Limpiar$/i })).not.toBeInTheDocument();
  });

  it('con un filtro activo, muestra el chip en la barra de mobile y permite quitarlo sin abrir el sheet', async () => {
    const onChangeFilter = vi.fn();
    render(
      <SearchFilters
        filters={{ ...baseFilters, zona: 'Oriente' }}
        onChangeFilter={onChangeFilter}
        onReset={vi.fn()}
        totalResults={2}
      />
    );

    // Igual que los contadores/labels duplicados en otras suites: el chip
    // existe tanto en la barra compacta de mobile como en el panel de
    // desktop a la vez (jsdom no aplica media queries) — se usa el primero.
    const chips = screen.getAllByRole('button', { name: /Zona: Oriente/i });
    expect(chips.length).toBeGreaterThan(0);

    await userEvent.click(chips[0]);
    expect(onChangeFilter).toHaveBeenCalledWith({ zona: '' });
    // No debería haber abierto el sheet al hacer clic en el chip.
    expect(screen.queryByRole('button', { name: /Cerrar filtros/i })).not.toBeInTheDocument();
  });

  it('el botón "Ver N publicaciones" del sheet lo cierra', async () => {
    render(
      <SearchFilters
        filters={{ ...baseFilters, zona: 'Oriente' }}
        onChangeFilter={vi.fn()}
        onReset={vi.fn()}
        totalResults={7}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /^Filtros/i }));
    const applyBtn = await screen.findByRole('button', { name: /Ver 7 publicaciones/i });
    await userEvent.click(applyBtn);

    expect(screen.queryByRole('button', { name: /Cerrar filtros/i })).not.toBeInTheDocument();
  });

  it('"Limpiar" dentro del sheet llama a onReset', async () => {
    const onReset = vi.fn();
    render(
      <SearchFilters
        filters={{ ...baseFilters, zona: 'Oriente' }}
        onChangeFilter={vi.fn()}
        onReset={onReset}
        totalResults={2}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /^Filtros/i }));
    await screen.findByRole('button', { name: /Cerrar filtros/i }); // sheet abierto

    // "Limpiar" existe tanto en la fila de chips de la barra compacta como
    // dentro del sheet (jsdom no oculta ninguno vía media queries) — el del
    // sheet es el último en el orden del DOM (JSX: barra mobile, luego
    // FilterSheet, luego panel de desktop).
    const limpiarButtons = screen.getAllByRole('button', { name: /^Limpiar$/i });
    await userEvent.click(limpiarButtons[limpiarButtons.length - 1]);

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
