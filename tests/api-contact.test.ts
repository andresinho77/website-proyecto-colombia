import { describe, it, expect, vi, afterEach } from 'vitest';
import { getContactLink } from '../lib/api';

/**
 * US-6.5: getContactLink() is the reveal-on-click boundary the real
 * POST /listings/{id}/contact endpoint will sit behind once infra ships it.
 * Until then it must degrade to the offline MOCK_LISTINGS fallback on ANY
 * fetch failure — network-level (rejects) or HTTP-level (a live backend
 * that doesn't have this route yet returning 404) — since blocking contact
 * during that transition would be worse than the problem this fixes.
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
});
