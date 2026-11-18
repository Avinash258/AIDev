import type { Page } from '@playwright/test';
import type { RuntimeData } from '../data/runtime-data';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { InventoryPage } from '../pages/inventory.page';

/**
 * Flow B+: consumes RuntimeData created by setup / earlier flows.
 */
export class CheckoutActions {
  readonly inventoryPage: InventoryPage;
  readonly cartPage: CartPage;
  readonly checkoutPage: CheckoutPage;

  constructor(page: Page) {
    this.inventoryPage = new InventoryPage(page);
    this.cartPage = new CartPage(page);
    this.checkoutPage = new CheckoutPage(page);
  }

  async openCart() {
    // New page in shared context — open cart by URL so session cookies apply
    await this.cartPage.goto();
  }

  async completeCheckoutWithRuntimeData(runtimeData: RuntimeData) {
    if (!runtimeData.customer) {
      throw new Error('runtimeData.customer is required for checkout');
    }

    await this.openCart();
    await this.cartPage.proceedToCheckout();
    await this.checkoutPage.fillCustomer(runtimeData.customer);
    await this.checkoutPage.continueToOverview();
    await this.checkoutPage.finish();

    runtimeData.confirmationHeader =
      (await this.checkoutPage.confirmationHeader.textContent())?.trim() ??
      undefined;

    return runtimeData.confirmationHeader;
  }
}
