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

// EmergencyBanner dismissal (US-1.5): remembered so a returning visitor
// doesn't see the emergency-lines banner on every single page load once
// they've closed it once. Deliberately NOT tied to an expiry — reopening is
// one click away via the phone icon in the Navbar, so there's no harm in it
// staying dismissed indefinitely versus a stale flag silently hiding real
// emergency numbers from someone who forgot they dismissed it days ago.
const EMERGENCY_BANNER_DISMISSED_KEY = 'alojamiento_solidario_emergency_banner_dismissed';
const DATA_POLICY_ACCEPTED_KEY = 'alojamiento_solidario_data_policy_accepted';

export const isEmergencyBannerDismissed = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(EMERGENCY_BANNER_DISMISSED_KEY) === 'true';
  } catch (err) {
    console.error('Error reading localStorage:', err);
    return false;
  }
};

export const setEmergencyBannerDismissed = (dismissed: boolean) => {
  if (typeof window === 'undefined') return;
  try {
    if (dismissed) {
      localStorage.setItem(EMERGENCY_BANNER_DISMISSED_KEY, 'true');
    } else {
      localStorage.removeItem(EMERGENCY_BANNER_DISMISSED_KEY);
    }
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
  // Keep the pre-hydration CSS hook (app/layout.tsx's blocking script +
  // the `html.eb-dismissed [data-emergency-banner]` rule in globals.css)
  // in sync with React state from here on — without this, reopening the
  // banner would leave the CSS class stuck from the initial page load,
  // silently keeping it `display:none` even after React re-renders it.
  document.documentElement.classList.toggle('eb-dismissed', dismissed);
};

export const isDataPolicyAccepted = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(DATA_POLICY_ACCEPTED_KEY) === 'true';
  } catch (err) {
    console.error('Error reading localStorage:', err);
    return false;
  }
};

export const setDataPolicyAccepted = (accepted: boolean) => {
  if (typeof window === 'undefined') return;
  try {
    if (accepted) {
      localStorage.setItem(DATA_POLICY_ACCEPTED_KEY, 'true');
    } else {
      localStorage.removeItem(DATA_POLICY_ACCEPTED_KEY);
    }
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
};
