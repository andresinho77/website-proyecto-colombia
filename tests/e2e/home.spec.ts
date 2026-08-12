import { test, expect } from '@playwright/test';

test('homepage loads and shows the hero CTAs', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /conectando techo/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /necesito alojamiento/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /tengo espacio disponible/i })).toBeVisible();
});
