import { test, expect } from './fixtures';

test('lists chats, shows the empty state, and opens a conversation', async ({ page }) => {
  await expect(page.getByText('Your conversations live here.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open chat with jordan@example.com' })).toBeVisible();
  await page.getByRole('button', { name: 'Open chat with sam@example.com' }).click();
  await expect(page.locator('[class*="messageContent"]').filter({ hasText: 'Are we still on for coffee?' })).toBeVisible();
  await expect(page.locator('[class*="messageContent"]').filter({ hasText: 'Absolutely — see you at ten.' })).toBeVisible();
});

test('sends a message with Enter and ignores blank messages', async ({ page }) => {
  await page.getByRole('button', { name: 'Open chat with sam@example.com' }).click();
  const input = page.getByPlaceholder('Type a message');
  await input.fill('A fresh browser-tested message');
  await input.press('Enter');
  await expect(page.locator('[class*="messageContent"]').filter({ hasText: 'A fresh browser-tested message' })).toBeVisible();
  await input.fill('   ');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.locator('[class*="messageContent"]').filter({ hasText: 'A fresh browser-tested message' })).toHaveCount(1);
});

test('replies to a message', async ({ page }) => {
  await page.getByRole('button', { name: 'Open chat with sam@example.com' }).click();
  const message = page.locator('[class*="messageContent"]').filter({ hasText: 'Are we still on for coffee?' }).locator('..');
  await message.getByRole('button', { name: 'Message actions' }).click();
  await page.getByRole('menuitem', { name: 'Reply' }).click();
  await expect(page.getByText('Are we still on for coffee?')).toHaveCount(2);
  await page.getByPlaceholder('Type a message').fill('Yes, replying now.');
  await page.getByRole('button', { name: 'Reply' }).click();
  await expect(page.locator('[class*="messageContent"]').filter({ hasText: 'Yes, replying now.' })).toBeVisible();
});

test('edits and deletes an owned message', async ({ page }) => {
  await page.getByRole('button', { name: 'Open chat with sam@example.com' }).click();
  const own = page.locator('[class*="messageContent"]').filter({ hasText: 'Absolutely — see you at ten.' }).locator('..');
  await own.getByRole('button', { name: 'Message actions' }).click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();
  await page.getByPlaceholder('Type a message').fill('Absolutely — make it eleven.');
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('[class*="messageContent"]').filter({ hasText: 'Absolutely — make it eleven.' })).toBeVisible();
  const edited = page.locator('[class*="messageContent"]').filter({ hasText: 'Absolutely — make it eleven.' }).locator('..');
  await edited.getByRole('button', { name: 'Message actions' }).click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await expect(page.getByText('*This message was deleted*').first()).toBeVisible();
});

test('validates and creates a new conversation', async ({ page }) => {
  await page.getByRole('button', { name: 'New Chat' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByText('Confirm').click();
  await expect(dialog.getByText('Please enter an email address.')).toBeVisible();
  await dialog.getByLabel('Email address').fill('alex@example.com');
  await dialog.getByText('Confirm').click();
  await expect(dialog.getByText('You cannot create a chat with yourself.')).toBeVisible();
  await dialog.getByLabel('Email address').fill('taylor@example.com');
  await dialog.getByText('Confirm').click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: 'Open chat with taylor@example.com' })).toBeVisible();
  await expect(page.getByPlaceholder('Type a message')).toBeVisible();

  await page.getByRole('button', { name: 'New Chat' }).click();
  await page.getByRole('dialog').getByLabel('Email address').fill('TAYLOR@example.com');
  await page.getByRole('dialog').getByText('Confirm').click();
  await expect(page.getByRole('button', { name: 'Open chat with taylor@example.com' })).toHaveCount(1);
});
