import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FilterFields } from '../components/FilterFields';
import { FilterState } from '../lib/types';

// Bug fix (2026-08-21): typing in Barrio pushed a new `filters` value on
// every keystroke, and CityFeedPage refetches (flashing ListingGrid's
// skeleton) whenever `filters` changes — so the skeleton flashed on every
// single character typed. Fixed by debouncing Barrio's onChangeFilter call.
const baseFilters: FilterState = {
  ciudad: 'Pereira',
  ciudadSlug: 'pereira',
  tipo: 'todos',
  zona: '',
  barrio: '',
  maxPrecio: '',
  sortBy: 'recientes',
};

describe('FilterFields — debounce del campo Barrio (components/FilterFields.tsx)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('no llama a onChangeFilter en cada tecla — solo una vez, tras una pausa', () => {
    const onChangeFilter = vi.fn();
    render(<FilterFields filters={baseFilters} onChangeFilter={onChangeFilter} />);

    const input = screen.getByPlaceholderText(/Circunvalar, Cuba/i);

    fireEvent.change(input, { target: { value: 'C' } });
    fireEvent.change(input, { target: { value: 'Ci' } });
    fireEvent.change(input, { target: { value: 'Cir' } });

    // El input refleja cada tecla al instante (estado local), pero el
    // fetch/onChangeFilter todavía no debería haberse disparado.
    expect(input).toHaveValue('Cir');
    expect(onChangeFilter).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(onChangeFilter).toHaveBeenCalledTimes(1);
    expect(onChangeFilter).toHaveBeenCalledWith({ barrio: 'Cir' });
  });

  it('un cambio externo de filters.barrio (p. ej. "Limpiar filtros") actualiza el input sin esperar el debounce', () => {
    const onChangeFilter = vi.fn();
    const withBarrio: FilterState = { ...baseFilters, barrio: 'Alamos' };
    const { rerender } = render(<FilterFields filters={withBarrio} onChangeFilter={onChangeFilter} />);

    const input = screen.getByPlaceholderText(/Circunvalar, Cuba/i);
    expect(input).toHaveValue('Alamos');

    // Simula "Limpiar filtros": el padre cambia filters.barrio a '' desde
    // afuera, sin pasar por el propio input.
    rerender(<FilterFields filters={{ ...withBarrio, barrio: '' }} onChangeFilter={onChangeFilter} />);
    expect(input).toHaveValue('');
  });
});
