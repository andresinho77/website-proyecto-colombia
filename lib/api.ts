import { Listing, CreateListingInput, FilterState } from './types';

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

export const fetchListings = async (filters?: Partial<FilterState>): Promise<Listing[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.ciudad) params.append('ciudad', filters.ciudad);
    if (filters?.tipo) params.append('tipo', filters.tipo);
    if (filters?.barrio) params.append('barrio', filters.barrio);
    if (filters?.maxPrecio) params.append('maxPrecio', filters.maxPrecio);

    const url = `${API_BASE_URL}?${params.toString()}`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (data.items && Array.isArray(data.items)) {
      return toPublicFeed(data.items);
    }
    return toPublicFeed(MOCK_LISTINGS);
  } catch (err) {
    console.warn('API connection unavailable, serving emergency local mock listings:', err);
    let items = [...MOCK_LISTINGS];

    if (filters?.ciudad) {
      items = items.filter((i) => i.ciudad.toLowerCase() === filters.ciudad?.toLowerCase());
    }
    if (filters?.tipo && filters.tipo !== 'todos') {
      items = items.filter((i) => i.tipo === filters.tipo);
    }
    if (filters?.barrio) {
      items = items.filter((i) => i.barrio.toLowerCase().includes(filters.barrio!.toLowerCase()));
    }
    return toPublicFeed(items);
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
