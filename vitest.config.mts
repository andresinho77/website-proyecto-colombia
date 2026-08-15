import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// `import.meta.url` en vez de `__dirname`: el archivo es ESM (.mts) y Vite
// advierte sobre `__dirname` bajo el futuro `configLoader: 'native'`.
const rootDir = fileURLToPath(new URL('./', import.meta.url));

/**
 * Configuración del paso 3 del contrato de validación (`npm run validate`).
 *
 * - `jsdom`: los componentes son client components ("use client") y usan
 *   `localStorage`, `window.open` y eventos de DOM.
 * - `setupFiles`: registra los matchers de `@testing-library/jest-dom` y los
 *   stubs de APIs de navegador que jsdom no implementa (ver `tests/setup.ts`).
 * - `include` restringido a `tests/`: el export estático (`out/`) y
 *   `node_modules` nunca deben ser escaneados en busca de suites.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': rootDir,
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    exclude: ['node_modules/**', 'out/**', '.next/**', 'tests/e2e/**'],
    restoreMocks: true,
  },
});
