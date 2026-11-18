import { test as base, expect } from '@playwright/test';
import { AuthActions } from '../actions/auth.actions';
import { InventoryPage } from '../pages/inventory.page';
import { LoginPage } from '../pages/login.page';

type AppFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  auth: AuthActions;
};

/**
 * Default fixtures — isolated page/context per test (login, independent cases).
 */
export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  auth: async ({ page }, use) => {
    await use(new AuthActions(page));
  },
});

export { expect };
