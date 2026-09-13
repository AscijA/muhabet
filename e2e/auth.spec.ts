import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('shows the sign-in experience', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();
  await expect(page.getByLabel('Email address')).toBeVisible();
  await expect(page.getByLabel('Password')).toHaveAttribute('type', 'password');
  await expect(page.locator('[class*="imageContainer"]')).toBeVisible();
});

test('rejects invalid credentials and clears the error while typing', async ({ page }) => {
  await page.getByLabel('Email address').fill('wrong@example.com');
  await page.getByLabel('Password').fill('incorrect');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Invalid Credentials')).toBeVisible();
  await page.getByLabel('Password').fill('password123');
  await expect(page.getByText('Invalid Credentials')).toBeHidden();
});

test('signs in with the deterministic test account', async ({ page }) => {
  await page.getByLabel('Email address').fill('alex@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/chat$/);
  await expect(page.getByRole('button', { name: 'Open chat with sam@example.com' })).toBeVisible();
});

test('switches to sign-up and validates account input', async ({ page }) => {
  await page.getByRole('button', { name: 'Account needed? Sign up' }).click();
  await expect(page.getByRole('heading', { name: 'Start a conversation.' })).toBeVisible();
  await page.getByLabel('Email address').fill('not-an-email');
  await page.getByLabel('Password').fill('123456');
  await page.getByRole('button', { name: 'Sign up' }).click();
  await expect(page.getByText('Email is invalid')).toBeVisible();
});

test('opens, validates, and closes password reset', async ({ page }) => {
  await page.getByRole('button', { name: 'Reset password' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Email address').fill('invalid');
  await dialog.getByRole('button', { name: 'Reset password' }).click();
  await expect(dialog.getByText('Email is invalid')).toBeVisible();
  await dialog.getByLabel('Email address').fill('alex@example.com');
  await dialog.getByRole('button', { name: 'Reset password' }).click();
  await expect(dialog).toBeHidden();
});
