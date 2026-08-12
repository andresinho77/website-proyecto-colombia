export interface SavedAuthorListing {
  id: string;
  pin: string;
  creadoEn: number;
  tipo: string;
  ciudad: string;
}

const STORAGE_KEY = 'alojamiento_solidario_my_listings';

export const getMyListings = (): SavedAuthorListing[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading localStorage:', err);
    return [];
  }
};

export const saveMyListing = (item: SavedAuthorListing) => {
  if (typeof window === 'undefined') return;
  try {
    const current = getMyListings();
    const updated = [item, ...current.filter((l) => l.id !== item.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
};

export const removeMyListing = (id: string) => {
  if (typeof window === 'undefined') return;
  try {
    const current = getMyListings();
    const updated = current.filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error removing from localStorage:', err);
  }
};
