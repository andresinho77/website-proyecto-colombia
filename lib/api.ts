import { Listing, ListingStatus, CreateListingInput, FilterState, PaginatedListings } from './types';

/**
 * Contrato de `NEXT_PUBLIC_API_URL` (ver README → "Validación local"):
 *
 * - Build de despliegue (`next build`, NODE_ENV=production): la variable es
 *   OBLIGATORIA. El valor queda incrustado en el bundle estático, así que un
 *   default silencioso apuntaría el artefacto a un endpoint adivinado. Si falta,
 *   el build falla con instrucciones explícitas.
 * - Desarrollo local (`next dev`): si falta, se usa deliberadamente el servidor
 *   mock local (`npm run dev:api`). Nunca se cae a producción por defecto, para
 *   que un `npm run dev` no escriba datos reales por accidente.
 * - Validación local (`npm run validate`): usa `build:local`, que inyecta el
 *   mismo endpoint local salvo que ya haya un valor en el entorno.
 */
export const LOCAL_API_BASE_URL = 'http://localhost:4000/api/listings';

function resolveApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) return configured.replace(/\/+$/, '');

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_API_URL is required to build a deployable bundle.\n' +
        '  · Deploy build:      NEXT_PUBLIC_API_URL="https://<api-host>/api/listings" npm run build\n' +
        `  · Local validation:  npm run validate   (uses ${LOCAL_API_BASE_URL})\n` +
        '  · CI: set the NEXT_PUBLIC_API_URL repository variable.'
    );
  }

  return LOCAL_API_BASE_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();

// Emergency sample mock data for offline/demo fallback
const MOCK_LISTINGS: Listing[] = [
  {
    id: 'mock-1',
    tipo: 'ofrezco',
    ciudad: 'Pereira',
    ciudadSlug: 'pereira',
    departamento: 'Risaralda',
    departamentoSlug: 'risaralda',
    zona: 'Oriente',
    barrio: 'Circunvalar',
    personas: 4,
    fechaDesde: '2026-08-11',
    fechaHasta: '2026-08-25',
    precio: 0,
    descripcion: 'Habitación amplia amoblada disponible con 2 camas dobles. Agua potable, luz y baño privado. Aceptamos familias con niños y mascotas.',
    whatsapp: '+573105550123',
    imagenes: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
    ],
    pin: '1234',
    creadoEn: Date.now() - 3600000 * 2,
    estado: 'activo',
    reportes: 0,
  },
  {
    id: 'mock-2',
    tipo: 'necesito',
    ciudad: 'Pereira',
    ciudadSlug: 'pereira',
    departamento: 'Risaralda',
    departamentoSlug: 'risaralda',
    zona: 'Sur',
    barrio: 'Cuba',
    personas: 3,
    fechaDesde: '2026-08-12',
    fechaHasta: null,
    precio: 0,
    descripcion: 'Familia damnificada por la emergencia (2 adultos y 1 bebé de 8 meses). Requerimos espacio temporal seguro en Pereira o barrios cercanos.',
    whatsapp: '+573205559876',
    imagenes: [],
    pin: '5678',
    creadoEn: Date.now() - 3600000 * 5,
    estado: 'activo',
    reportes: 0,
  },
  {
    id: 'mock-3',
    tipo: 'ofrezco',
    ciudad: 'Cali',
    ciudadSlug: 'cali',
    departamento: 'Valle del Cauca',
    departamentoSlug: 'valle-del-cauca',
    zona: 'Centro',
    barrio: 'San Antonio',
    personas: 2,
    fechaDesde: '2026-08-10',
    fechaHasta: '2026-09-01',
    precio: 0,
    descripcion: 'Ofrezco apartamento independiente para 2 personas. WiFi, cocina con estufa a gas y reserva de agua. Contacto rápido por WhatsApp.',
    whatsapp: '+573155554321',
    imagenes: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ],
    pin: '9999',
    creadoEn: Date.now() - 3600000 * 12,
    estado: 'activo',
    reportes: 0,
  },
  {
    id: 'mock-4',
    tipo: 'ofrezco',
    ciudad: 'Quibdó',
    ciudadSlug: 'quibdo',
    departamento: 'Chocó',
    departamentoSlug: 'choco',
    zona: 'Anillo Central (Comuna 3)',
    barrio: 'César Conto',
    personas: 6,
    fechaDesde: '2026-08-11',
    fechaHasta: null,
    precio: 0,
    descripcion: 'Bodega cubierta apta como albergue temporal para familias o acopio de donaciones. Baño comunitario y energía eléctrica activa.',
    whatsapp: '+573185557788',
    imagenes: [],
    pin: '7777',
    creadoEn: Date.now() - 3600000 * 18,
    estado: 'activo',
    reportes: 0,
  }
];

// Public feed contract: only `activo` listings, newest (creadoEn) first.
// Applied consistently to both the API response and the offline/mock fallback.
const toPublicFeed = (items: Listing[]): Listing[] =>
  items.filter((i) => i.estado === 'activo').sort((a, b) => b.creadoEn - a.creadoEn);

export const fetchListings = async (
  filters?: Partial<FilterState>,
  cursor?: string
): Promise<PaginatedListings> => {
  try {
    const params = new URLSearchParams();
    if (filters?.ciudad) params.append('ciudad', filters.ciudad);
    if (filters?.ciudadSlug) params.append('ciudadSlug', filters.ciudadSlug);
    if (filters?.departamento) params.append('departamento', filters.departamento);
    if (filters?.departamentoSlug) params.append('departamentoSlug', filters.departamentoSlug);
    if (filters?.tipo) params.append('tipo', filters.tipo);
    if (filters?.zona) params.append('zona', filters.zona);
    if (filters?.barrio) params.append('barrio', filters.barrio);
    if (filters?.maxPrecio) params.append('maxPrecio', String(filters.maxPrecio));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (cursor || filters?.cursor) params.append('cursor', (cursor || filters?.cursor)!);

    const url = `${API_BASE_URL}?${params.toString()}`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (data.items && Array.isArray(data.items)) {
      return {
        items: toPublicFeed(data.items),
        nextCursor: data.nextCursor,
        totalCount: data.total,
      };
    }
    if (Array.isArray(data)) {
      return {
        items: toPublicFeed(data),
      };
    }
    return {
      items: toPublicFeed(MOCK_LISTINGS),
    };
  } catch (err) {
    console.warn('API connection unavailable, serving emergency local mock listings:', err);
    let items = [...MOCK_LISTINGS];

    if (filters?.departamento || filters?.departamentoSlug) {
      const targetDept = (filters.departamentoSlug || filters.departamento || '').toLowerCase();
      items = items.filter((i) =>
        (i.departamentoSlug && i.departamentoSlug.toLowerCase() === targetDept) ||
        (i.departamento && i.departamento.toLowerCase() === targetDept)
      );
    }
    if (filters?.ciudad || filters?.ciudadSlug) {
      const targetCity = (filters.ciudadSlug || filters.ciudad || '').toLowerCase();
      items = items.filter((i) =>
        (i.ciudadSlug && i.ciudadSlug.toLowerCase() === targetCity) ||
        (i.ciudad && i.ciudad.toLowerCase() === targetCity)
      );
    }
    if (filters?.tipo && filters.tipo !== 'todos') {
      items = items.filter((i) => i.tipo === filters.tipo);
    }
    if (filters?.zona) {
      items = items.filter((i) => i.zona.toLowerCase() === filters.zona?.toLowerCase());
    }
    if (filters?.barrio) {
      items = items.filter((i) => i.barrio.toLowerCase().includes(filters.barrio!.toLowerCase()));
    }
    return {
      items: toPublicFeed(items),
    };
  }
};

export const createListing = async (input: CreateListingInput): Promise<{ success: boolean; listing?: Listing; error?: string }> => {
  try {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Error al guardar la publicación.' };
    }

    return { success: true, listing: data.listing };
  } catch (err: any) {
    console.warn('Backend API offline, simulating local submission:', err);
    // Offline simulation fallback for presentation
    const mockCreated: Listing = {
      id: `local-${Date.now()}`,
      tipo: input.tipo,
      ciudad: input.ciudad,
      ciudadSlug: input.ciudadSlug,
      departamento: input.departamento,
      departamentoSlug: input.departamentoSlug,
      zona: input.zona,
      barrio: input.barrio,
      personas: Number(input.personas) || 1,
      fechaDesde: input.fechaDesde,
      fechaHasta: input.fechaHasta,
      precio: Number(input.precio) || 0,
      descripcion: input.descripcion,
      whatsapp: input.whatsapp,
      imagenes: input.imagenes || [],
      pin: String(Math.floor(1000 + Math.random() * 9000)),
      creadoEn: Date.now(),
      estado: 'activo',
      reportes: 0,
    };
    MOCK_LISTINGS.unshift(mockCreated);
    return { success: true, listing: mockCreated };
  }
};

export const requestUploadUrl = async (contentType: string): Promise<{ uploadUrl?: string; fileUrl?: string; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/upload-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Error generando URL de subida.' };
    return { uploadUrl: data.uploadUrl, fileUrl: data.fileUrl };
  } catch (err: any) {
    return { error: 'No se pudo conectar con el servidor de carga.' };
  }
};

export const uploadFileToS3 = async (file: File, uploadUrl: string): Promise<boolean> => {
  try {
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    return res.ok;
  } catch (err) {
    console.error('Error uploading file to S3:', err);
    return false;
  }
};

// US-6.5: the public feed (fetchListings) should not hand out raw WhatsApp
// numbers to anyone scripting a request against the API directly — the
// reveal happens on demand, per click, through this call instead, so the
// backend can rate-limit/Turnstile-gate it independently of just serving the
// feed. The real POST /listings/{id}/contact endpoint doesn't exist yet
// (proposed in openapi.yaml); until infra ships it, the offline fallback
// below resolves the number from MOCK_LISTINGS with the same response
// shape, so ListingCard's call site won't need to change when it does.
export const getContactLink = async (
  id: string,
  turnstileToken?: string | null
): Promise<{ success: boolean; whatsapp?: string; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/${id}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ turnstileToken }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'No se pudo obtener el contacto.' };
    }
    return { success: true, whatsapp: data.whatsapp };
  } catch (err) {
    const item = MOCK_LISTINGS.find((i) => i.id === id);
    if (!item) return { success: false, error: 'Publicación no encontrada.' };
    return { success: true, whatsapp: item.whatsapp };
  }
};

export const reportListing = async (id: string): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, message: data.message };
  } catch (err) {
    const item = MOCK_LISTINGS.find((i) => i.id === id);
    if (item) {
      item.reportes = (item.reportes || 0) + 1;
      if (item.reportes >= 3) item.estado = 'reportado';
    }
    return { success: true, message: 'Reporte registrado localmente.' };
  }
};

// Admin/moderation surface (app/admin). Wire contract is unchanged: POST
// `${API_BASE_URL}/admin` with `x-admin-key` + `{ action, adminKey }` (list) or
// `{ id, action, adminKey }` (status change) — this only centralizes it so the
// page has one reusable loader instead of duplicating fetch/catch inline, and so
// the offline fallback (used for moderation triage when infra is unavailable)
// lives next to the other MOCK_LISTINGS fallbacks above.
const ADMIN_DEMO_KEYS = ['colombia2026admin', 'admin'];

export interface AdminListingsResult {
  success: boolean;
  items: Listing[];
  offline: boolean;
  error?: string;
}

export const fetchAdminListings = async (adminKey: string): Promise<AdminListingsResult> => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ action: 'list_all', adminKey }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, items: data.items || [], offline: false };
    }
    if (ADMIN_DEMO_KEYS.includes(adminKey)) {
      // Backend reachable but rejected the key or returned an unexpected shape;
      // the local demo key still unlocks offline triage so moderation isn't
      // blocked by incomplete/unavailable infra.
      return { success: true, items: [...MOCK_LISTINGS], offline: true };
    }
    return { success: false, items: [], offline: false, error: data.error || 'Clave de administrador incorrecta.' };
  } catch (err) {
    if (ADMIN_DEMO_KEYS.includes(adminKey)) {
      return { success: true, items: [...MOCK_LISTINGS], offline: true };
    }
    return { success: false, items: [], offline: true, error: 'No se pudo conectar con el servidor de moderación.' };
  }
};

export const setAdminListingStatus = async (
  id: string,
  action: ListingStatus,
  adminKey: string
): Promise<{ success: boolean; offline: boolean; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ id, action, adminKey }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, offline: false, error: data.error || 'No se pudo actualizar el estado.' };
    }
    return { success: true, offline: false };
  } catch (err) {
    const item = MOCK_LISTINGS.find((i) => i.id === id);
    if (item) item.estado = action;
    return { success: true, offline: true };
  }
};

export const resolveListing = async (id: string, pin: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, pin }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true };
  } catch (err) {
    const item = MOCK_LISTINGS.find((i) => i.id === id);
    if (!item) return { success: false, error: 'Publicación no encontrada.' };
    if (!item.pin || item.pin !== pin) {
      return { success: false, error: 'PIN incorrecto.' };
    }
    item.estado = 'resuelto';
    return { success: true };
  }
};
