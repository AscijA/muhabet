import { test, expect } from './fixtures';

test('toggles and persists the theme', async ({ page }) => {
  await page.getByRole('button', { name: 'Open settings' }).click();
  await page.getByText('Toggle Theme (Light/Dark)').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('can cancel logout and then log out', async ({ page }) => {
  await page.getByRole('button', { name: 'Open settings' }).click();
  await page.getByText('Log Out').click();
  await expect(page.getByText('Are you sure you want to Log Out?')).toBeVisible();
  await page.getByRole('button', { name: 'No' }).click();
  await expect(page.getByText('Are you sure you want to Log Out?')).toBeHidden();
  await page.getByText('Log Out').click();
  await page.getByRole('button', { name: 'Yes' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();
});

test('blocks, unblocks, and deletes a conversation', async ({ page }) => {
  await page.getByRole('button', { name: 'Open chat with sam@example.com' }).click();
  await page.getByRole('button', { name: 'Open contact details' }).click();
  await page.getByText('Block User').click();
  await page.getByRole('button', { name: 'Yes' }).click();
  await expect(page.getByText(/You have blocked this user/)).toBeVisible();
  await page.getByRole('button', { name: 'Open contact details' }).click();
  await page.getByText('Unblock User').click();
  await page.getByRole('button', { name: 'Yes' }).click();
  await expect(page.getByPlaceholder('Type a message')).toBeVisible();
  await page.getByRole('button', { name: 'Open contact details' }).click();
  await page.getByText('Delete Chat').click();
  await page.getByRole('button', { name: 'Yes' }).click();
  await expect(page.getByText('Your conversations live here.')).toBeVisible();
});
