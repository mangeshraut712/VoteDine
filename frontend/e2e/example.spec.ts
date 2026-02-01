import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/VoteDine/);
});

test('homepage has VoteDine heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'VoteDine' })).toBeVisible();
});
