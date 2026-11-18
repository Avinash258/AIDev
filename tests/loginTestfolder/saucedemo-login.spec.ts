// spec: TestPlanfolder/SauceDemoLogin.test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

const baseUrl = 'https://www.saucedemo.com/';

function password(): string {
  return process.env.SAUCEDEMO_PASSWORD ?? 'secret_sauce';
}

async function openLoginPage(page: import('@playwright/test').Page) {
  await page.goto(baseUrl);
}

async function login(page: import('@playwright/test').Page, username: string, value: string) {
  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Password').fill(value);
  await page.getByRole('button', { name: 'Login' }).click();
}

test.describe('Login', () => {
  test('Standard user can log in successfully', async ({ page }) => {
    await openLoginPage(page);

    await login(page, 'standard_user', password());

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.getByText('Products', { exact: true })).toBeVisible();
  });

  test('Locked-out user receives the expected login error', async ({ page }) => {
    await openLoginPage(page);

    await login(page, 'locked_out_user', password());

    await expect(page).toHaveURL(baseUrl);
    await expect(page.getByText('Epic sadface: Sorry, this user has been locked out.')).toBeVisible();
  });

  test('Invalid username is rejected', async ({ page }) => {
    await openLoginPage(page);

    await login(page, 'not_a_user', password());

    await expect(page).toHaveURL(baseUrl);
    await expect(page.getByText('Epic sadface: Username and password do not match any user in this service')).toBeVisible();
  });

  test('Invalid password is rejected', async ({ page }) => {
    await openLoginPage(page);

    await login(page, 'standard_user', 'wrong_password');

    await expect(page).toHaveURL(baseUrl);
    await expect(page.getByText('Epic sadface: Username and password do not match any user in this service')).toBeVisible();
  });

  test('Missing username is rejected', async ({ page }) => {
    await openLoginPage(page);

    await page.getByPlaceholder('Password').fill(password());
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(baseUrl);
    await expect(page.getByText('Epic sadface: Username is required')).toBeVisible();
  });

  test('Missing password is rejected', async ({ page }) => {
    await openLoginPage(page);

    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(baseUrl);
    await expect(page.getByText('Epic sadface: Password is required')).toBeVisible();
  });

  test('Login can be submitted with Enter', async ({ page }) => {
    await openLoginPage(page);

    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill(password());
    await page.getByPlaceholder('Password').press('Enter');

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.getByText('Products', { exact: true })).toBeVisible();
  });

  test('Password input remains masked', async ({ page }) => {
    await openLoginPage(page);

    const passwordField = page.getByPlaceholder('Password');
    await passwordField.fill(password());

    await expect(passwordField).toHaveAttribute('type', 'password');
  });

  test('Login error can be dismissed', async ({ page }) => {
    await openLoginPage(page);

    await login(page, 'locked_out_user', password());
    await expect(page.getByText('Epic sadface: Sorry, this user has been locked out.')).toBeVisible();

    await page.getByRole('button', { name: 'Dismiss error' }).click();

    await expect(page.getByText('Epic sadface: Sorry, this user has been locked out.')).toBeHidden();
    await expect(page.getByPlaceholder('Username')).toBeVisible();
  });

  test('Displayed problem user account can log in', async ({ page }) => {
    await openLoginPage(page);

    await login(page, 'problem_user', password());

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.getByText('Products', { exact: true })).toBeVisible();
  });

  test('Displayed performance glitch user account can log in', async ({ page }) => {
    test.setTimeout(60_000);
    await openLoginPage(page);

    await login(page, 'performance_glitch_user', password());

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.getByText('Products', { exact: true })).toBeVisible();
  });

  test('Displayed error user account can log in', async ({ page }) => {
    await openLoginPage(page);

    await login(page, 'error_user', password());

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.getByText('Products', { exact: true })).toBeVisible();
  });

  test('Displayed visual user account can log in', async ({ page }) => {
    await openLoginPage(page);

    await login(page, 'visual_user', password());

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.getByText('Products', { exact: true })).toBeVisible();
  });

  test('Successful login clears stale login errors', async ({ page }) => {
    await openLoginPage(page);

    await login(page, 'not_a_user', password());
    await expect(page.getByText('Epic sadface: Username and password do not match any user in this service')).toBeVisible();

    await login(page, 'standard_user', password());

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.getByText('Epic sadface: Username and password do not match any user in this service')).toBeHidden();
  });
});
