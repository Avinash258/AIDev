import type { Page } from '@playwright/test';
import { checkoutFlow } from '../data/flows/checkout.flow';
import type { RuntimeData } from '../data/runtime-data';
import { users } from '../data/users';
import { InventoryPage } from '../pages/inventory.page';
import { LoginPage } from '../pages/login.page';
import { buildCustomer, buildOrderRef } from '../utils/data-factory';
import { AuthActions } from './auth.actions';

/**
 * Creates / prepares runtime data for the active env and seeds the app
 * so later flows can consume RuntimeData without per-env data files.
 */
export class SetupActions {
  readonly auth: AuthActions;
  readonly loginPage: LoginPage;
  readonly inventoryPage: InventoryPage;

  constructor(page: Page) {
    this.auth = new AuthActions(page);
    this.loginPage = this.auth.loginPage;
    this.inventoryPage = this.auth.inventoryPage;
  }

  /**
   * Flow A (data): build unique customer + product refs into runtimeData.
   * No UI yet — safe to call from any env.
   */
  prepareCheckoutData(
    runtimeData: RuntimeData,
    productNames: readonly string[] = checkoutFlow.productNames,
  ): RuntimeData {
    runtimeData.user = users.standard;
    runtimeData.customer = buildCustomer({
      postalCode: checkoutFlow.defaultPostalCode,
    });
    runtimeData.products = productNames.map((name) => ({ name }));
    runtimeData.orderRef = buildOrderRef();
    runtimeData.cartItemCount = productNames.length;
    return runtimeData;
  }

  /**
   * Flow A (UI): login with runtime user and add runtime products to cart.
   * Session stays in the shared worker context for dependent tests.
   */
  async loginAndSeedCart(runtimeData: RuntimeData) {
    if (!runtimeData.user || !runtimeData.products?.length) {
      throw new Error(
        'runtimeData.user and runtimeData.products must be prepared first',
      );
    }

    await this.auth.openLogin();
    await this.auth.loginAs(runtimeData.user);

    for (const product of runtimeData.products) {
      await this.inventoryPage.addProductByName(product.name);
    }
  }
}
