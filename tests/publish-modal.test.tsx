import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PublishModal } from '../components/PublishModal';

// Fills every required field except email, so the only remaining blocker
// for a successful submit is the US-7.3 email requirement under test.
async function fillRequiredFieldsExceptEmail(user: ReturnType<typeof userEvent.setup>) {
  // Two elements share role "combobox" here: LocationCombobox's text input
  // (ARIA combobox) and the native Zona <select> (implicit ARIA role) — pick
  // the actual <select> by tag name.
  const zonaSelect = screen
    .getAllByRole('combobox')
    .find((el) => el.tagName === 'SELECT') as HTMLSelectElement;
  await user.selectOptions(zonaSelect, 'Centro');
  await user.type(
    screen.getByPlaceholderText(/Describa brevemente el espacio/i),
    'Habitación disponible con baño privado y agua potable.'
  );
  await user.type(screen.getByPlaceholderText('+573105550123'), '3105550123');
}

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

  describe('US-7.3: correo electrónico requerido', () => {
    it('bloquea el envío si el correo tiene formato inválido', async () => {
      const user = userEvent.setup();
      const onSuccessPublished = vi.fn();
      render(<PublishModal isOpen={true} onClose={vi.fn()} onSuccessPublished={onSuccessPublished} />);

      await fillRequiredFieldsExceptEmail(user);
      await user.type(screen.getByPlaceholderText('tucorreo@ejemplo.com'), 'no-es-un-correo');
      await user.click(screen.getByRole('button', { name: /Publicar Ahora/i }));

      expect(await screen.findByText(/correo electrónico válido/i)).toBeInTheDocument();
      expect(onSuccessPublished).not.toHaveBeenCalled();
    });

    it('permite el envío con un correo válido', async () => {
      const user = userEvent.setup();
      const onSuccessPublished = vi.fn();
      render(<PublishModal isOpen={true} onClose={vi.fn()} onSuccessPublished={onSuccessPublished} />);

      await fillRequiredFieldsExceptEmail(user);
      await user.type(screen.getByPlaceholderText('tucorreo@ejemplo.com'), 'autor@example.com');
      await user.click(screen.getByRole('button', { name: /Publicar Ahora/i }));

      await vi.waitFor(() => expect(onSuccessPublished).toHaveBeenCalled());
    });
  });
});
