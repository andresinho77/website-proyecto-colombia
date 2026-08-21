import { describe, it, expect, vi, afterEach } from 'vitest';
import { getContactLink } from '../lib/api';

/**
 * US-6.5: getContactLink() calls the real POST /listings/{id}/contact
 * endpoint (backend-proyecto-colombia). It degrades to the offline
 * MOCK_LISTINGS fallback on network failures and on non-404 HTTP errors
 * (backend unreachable/misconfigured mid-deploy), matching fetchListings'
 * pattern elsewhere in this file (bug-014 fix). A 404 is treated as
 * authoritative — the backend genuinely has no such listing — and returned
 * as an error instead of silently falling back to demo data.
 */
describe('getContactLink (lib/api.ts)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('devuelve el whatsapp cuando la API responde success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, whatsapp: '+573000000000' }),
    }) as unknown as typeof fetch;

    const res = await getContactLink('mock-1', 'token123');
    expect(res).toEqual({ success: true, whatsapp: '+573000000000' });
  });

  it('cae al fallback offline (MOCK_LISTINGS) cuando falla la red', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch;

    const res = await getContactLink('mock-1');
    expect(res.success).toBe(true);
    expect(res.whatsapp).toBe('+573105550123');
  });

  it('devuelve error si el id no existe ni en la API ni en el fallback offline', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch;

    const res = await getContactLink('id-inexistente');
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/no encontrada/i);
  });

  it('cae al fallback offline cuando la API responde con un error HTTP no-404 (bug-014)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Error interno del servidor.' }),
    }) as unknown as typeof fetch;

    const res = await getContactLink('mock-1');
    expect(res.success).toBe(true);
    expect(res.whatsapp).toBe('+573105550123');
  });

  it('trata un 404 real de la API como definitivo, sin caer al fallback offline', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Publicación no encontrada.' }),
    }) as unknown as typeof fetch;

    const res = await getContactLink('mock-1');
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/no encontrada/i);
  });

  it('cae al fallback offline si el 404 viene del framework y no de la API (bug-015)', async () => {
    // Fastify (dev server) y API Gateway responden así cuando la ruta
    // /contact no está montada. No significa que la publicación no exista,
    // y mostrarlo tal cual dejaba un "Not Found" en inglés bajo el botón.
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        message: 'Route POST:/api/listings/mock-1/contact not found',
        error: 'Not Found',
        statusCode: 404,
      }),
    }) as unknown as typeof fetch;

    const res = await getContactLink('mock-1');
    expect(res.success).toBe(true);
    expect(res.whatsapp).toBe('+573105550123');
  });
});
