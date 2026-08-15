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

afterEach(() => {
  cleanup();
});
