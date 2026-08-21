import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PublishModal } from '../components/PublishModal';

// Regression test for a bug found 2026-08-21: publishing from a
// department-level page (e.g. /departamento/valle-del-cauca/necesito/, which
// has no single defaultCiudad) silently preselected Pereira (Risaralda) —
// a city that isn't even in the department the user was browsing.
describe('PublishModal (components/PublishModal.tsx)', () => {
  it('sin defaultCiudad pero con defaultDepartmentSlug, preselecciona una ciudad de ESE departamento', () => {
    render(
      <PublishModal
        isOpen={true}
        onClose={vi.fn()}
        defaultDepartmentSlug="valle-del-cauca"
        onSuccessPublished={vi.fn()}
      />
    );

    const cityInput = screen.getByPlaceholderText(/Buscar ciudad o departamento/i);
    expect(cityInput).toHaveValue('Cali (Valle del Cauca)');
    expect(cityInput).not.toHaveValue(expect.stringContaining('Pereira'));
  });

  it('con defaultCiudad resuelve esa ciudad, ignorando defaultDepartmentSlug', () => {
    render(
      <PublishModal
        isOpen={true}
        onClose={vi.fn()}
        defaultCiudad="Cali"
        defaultDepartmentSlug="caldas"
        onSuccessPublished={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText(/Buscar ciudad o departamento/i)).toHaveValue(
      'Cali (Valle del Cauca)'
    );
  });

  it('sin ninguna pista de ubicación, cae a Pereira (contexto nacional)', () => {
    render(<PublishModal isOpen={true} onClose={vi.fn()} onSuccessPublished={vi.fn()} />);

    expect(screen.getByPlaceholderText(/Buscar ciudad o departamento/i)).toHaveValue(
      'Pereira (Risaralda)'
    );
  });
});
