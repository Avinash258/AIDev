// spec: TestPlanfolder/SauceDemoLogin.test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../src/fixtures/test-fixtures';
import { loginErrors } from '../../src/data/messages';
import { urls } from '../../src/data/urls';
import { users } from '../../src/data/users';

test.describe('Login', () => {
  test('Standard user can log in successfully', async ({
    auth,
    inventoryPage,
    page,
  }) => {
    await auth.openLogin();
    await auth.loginAs(users.standard);

    await expect(page).toHaveURL(urls.inventory);
    await expect(inventoryPage.productsHeading).toBeVisible();
  });

  test('Locked-out user receives the expected login error', async ({
    auth,
    loginPage,
    page,
  }) => {
    await auth.openLogin();
    await auth.loginAs(users.lockedOut);

    await expect(page).toHaveURL(urls.base);
    await expect(loginPage.errorBanner).toHaveText(loginErrors.lockedOut);
  });

  test('Invalid username is rejected', async ({ auth, loginPage, page }) => {
    await auth.openLogin();
    await auth.loginAs(users.invalidUser);

    await expect(page).toHaveURL(urls.base);
    await expect(loginPage.errorBanner).toHaveText(loginErrors.mismatch);
  });

  test('Invalid password is rejected', async ({ auth, loginPage, page }) => {
    await auth.openLogin();
    await auth.loginAs(users.wrongPassword);

    await expect(page).toHaveURL(urls.base);
    await expect(loginPage.errorBanner).toHaveText(loginErrors.mismatch);
  });

  test('Missing username is rejected', async ({ auth, loginPage, page }) => {
    await auth.openLogin();
    await auth.loginMissingUsername(users.standard.password);

    await expect(page).toHaveURL(urls.base);
    await expect(loginPage.errorBanner).toHaveText(loginErrors.usernameRequired);
  });

  test('Missing password is rejected', async ({ auth, loginPage, page }) => {
    await auth.openLogin();
    await auth.loginMissingPassword(users.standard.username);

    await expect(page).toHaveURL(urls.base);
    await expect(loginPage.errorBanner).toHaveText(loginErrors.passwordRequired);
  });

  test('Login can be submitted with Enter', async ({
    auth,
    inventoryPage,
    page,
  }) => {
    await auth.openLogin();
    await auth.loginWithEnter(users.standard);

    await expect(page).toHaveURL(urls.inventory);
    await expect(inventoryPage.productsHeading).toBeVisible();
  });

  test('Password input remains masked', async ({ auth, loginPage }) => {
    await auth.openLogin();
    await loginPage.password.fill(users.standard.password);

    await expect(loginPage.password).toHaveAttribute('type', 'password');
  });

  test('Login error can be dismissed', async ({ auth, loginPage }) => {
    await auth.openLogin();
    await auth.loginAs(users.lockedOut);
    await expect(loginPage.errorBanner).toHaveText(loginErrors.lockedOut);

    await loginPage.dismissLoginError();

    await expect(loginPage.errorBanner).toBeHidden();
    await expect(loginPage.username).toBeVisible();
  });

  test('Displayed problem user account can log in', async ({
    auth,
    inventoryPage,
    page,
  }) => {
    await auth.openLogin();
    await auth.loginAs(users.problem);

    await expect(page).toHaveURL(urls.inventory);
    await expect(inventoryPage.productsHeading).toBeVisible();
  });

  test('Displayed performance glitch user account can log in', async ({
    auth,
    inventoryPage,
    page,
  }) => {
    test.setTimeout(60_000);
    await auth.openLogin();
    await auth.loginAs(users.performance);

    await expect(page).toHaveURL(urls.inventory);
    await expect(inventoryPage.productsHeading).toBeVisible();
  });

  test('Displayed error user account can log in', async ({
    auth,
    inventoryPage,
    page,
  }) => {
    await auth.openLogin();
    await auth.loginAs(users.error);

    await expect(page).toHaveURL(urls.inventory);
    await expect(inventoryPage.productsHeading).toBeVisible();
  });

  test('Displayed visual user account can log in', async ({
    auth,
    inventoryPage,
    page,
  }) => {
    await auth.openLogin();
    await auth.loginAs(users.visual);

    await expect(page).toHaveURL(urls.inventory);
    await expect(inventoryPage.productsHeading).toBeVisible();
  });

  test('Successful login clears stale login errors', async ({
    auth,
    loginPage,
    page,
  }) => {
    await auth.openLogin();
    await auth.loginAs(users.invalidUser);
    await expect(loginPage.errorBanner).toHaveText(loginErrors.mismatch);

    await auth.loginAs(users.standard);

    await expect(page).toHaveURL(urls.inventory);
    await expect(loginPage.errorBanner).toBeHidden();
  });
});
