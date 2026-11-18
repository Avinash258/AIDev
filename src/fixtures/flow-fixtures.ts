import {
  test as base,
  expect,
  type BrowserContext,
} from '@playwright/test';
import { AuthActions } from '../actions/auth.actions';
import { CheckoutActions } from '../actions/checkout.actions';
import { SetupActions } from '../actions/setup.actions';
import {
  createEmptyRuntimeData,
  type RuntimeData,
} from '../data/runtime-data';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { InventoryPage } from '../pages/inventory.page';
import { LoginPage } from '../pages/login.page';

type FlowTestFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  auth: AuthActions;
  setup: SetupActions;
  checkout: CheckoutActions;
};

type FlowWorkerFixtures = {
  /**
   * Shared across serial tests in the same worker.
   * Setup flow writes here; later flows read/update.
   */
  runtimeData: RuntimeData;
  /**
   * Custom worker-scoped context (cannot re-scope built-in `context`).
   * Keeps session cookies so Flow B can reuse Flow A cart/login state.
   */
  flowContext: BrowserContext;
};

/**
 * Flow fixtures for dependent journeys:
 * - worker-scoped flowContext → session cookies persist across serial tests
 * - worker-scoped runtimeData → created data is reused by later flows
 */
export const test = base.extend<FlowTestFixtures, FlowWorkerFixtures>({
  runtimeData: [
    async ({}, use) => {
      await use(createEmptyRuntimeData());
    },
    { scope: 'worker' },
  ],

  flowContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      await use(context);
      await context.close();
    },
    { scope: 'worker' },
  ],

  page: async ({ flowContext }, use) => {
    const page = await flowContext.newPage();
    await use(page);
    await page.close();
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  auth: async ({ page }, use) => {
    await use(new AuthActions(page));
  },
  setup: async ({ page }, use) => {
    await use(new SetupActions(page));
  },
  checkout: async ({ page }, use) => {
    await use(new CheckoutActions(page));
  },
});

export { expect };
