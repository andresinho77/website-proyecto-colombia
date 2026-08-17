import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// `next/link` (Navbar, Footer) observa el viewport para prefetch. jsdom no
// implementa IntersectionObserver, así que se stubea para que el render no falle.
class IntersectionObserverStub {
  readonly root = null;
  readonly rootMargin = '';
  readonly scrollMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);

// CitySwitcher (Navbar) and the `/` redirect use `useRouter` from
// `next/navigation`, which requires an app-router context jsdom doesn't
// provide. Stub it globally so any component tree can render.
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  notFound: () => {
    throw new Error('notFound() called in test');
  },
}));

afterEach(() => {
  cleanup();
});
