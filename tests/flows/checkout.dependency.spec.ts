// Dependent flows: setup creates runtime data → checkout consumes it.
// Switch env with TEST_ENV=dev|qa|stage (no per-env test data files).

import { test, expect } from '../../src/fixtures/flow-fixtures';
import { checkoutFlow } from '../../src/data/flows/checkout.flow';
import { urls } from '../../src/data/urls';

test.describe.configure({ mode: 'serial' });

test.describe('Checkout journey (create data → consume in later flow)', () => {
  test('Flow A: create checkout data and seed cart in current env', async ({
    setup,
    runtimeData,
    inventoryPage,
    page,
  }) => {
    setup.prepareCheckoutData(runtimeData);

    expect(runtimeData.user).toBeTruthy();
    expect(runtimeData.customer?.email).toMatch(/@example\.com$/);
    expect(runtimeData.products).toHaveLength(checkoutFlow.productNames.length);
    expect(runtimeData.orderRef).toMatch(/^ORD-/);

    await setup.loginAndSeedCart(runtimeData);

    await expect(page).toHaveURL(urls.inventory);
    await expect(inventoryPage.productsHeading).toBeVisible();
    await expect(inventoryPage.cartLink).toHaveText(
      String(runtimeData.cartItemCount),
    );
  });

  test('Flow B: checkout using runtime data from Flow A', async ({
    checkout,
    cartPage,
    checkoutPage,
    runtimeData,
    page,
  }) => {
    expect(runtimeData.customer).toBeTruthy();
    expect(runtimeData.products?.length).toBeGreaterThan(0);

    await checkout.openCart();
    for (const product of runtimeData.products!) {
      await expect(cartPage.cartItem(product.name)).toBeVisible();
    }

    const confirmation =
      await checkout.completeCheckoutWithRuntimeData(runtimeData);

    await expect(page).toHaveURL(urls.checkoutComplete);
    await expect(checkoutPage.confirmationHeader).toHaveText(
      checkoutFlow.expectedConfirmation,
    );
    expect(confirmation).toBe(checkoutFlow.expectedConfirmation);

    // Created customer / orderRef remain available for any later flow
    expect(runtimeData.customer?.firstName).toBeTruthy();
    expect(runtimeData.orderRef).toMatch(/^ORD-/);
    expect(runtimeData.confirmationHeader).toBe(
      checkoutFlow.expectedConfirmation,
    );
  });

  test('Flow C: later flow only needs runtime data (no re-seed)', async ({
    runtimeData,
  }) => {
    // Simulates another journey (reporting, API assert, etc.) consuming
    // data created earlier — still env-agnostic.
    expect(runtimeData.user?.username).toBe('standard_user');
    expect(runtimeData.customer?.email).toContain('auto.user.');
    expect(runtimeData.products?.map((p) => p.name)).toEqual(
      [...checkoutFlow.productNames],
    );
    expect(runtimeData.confirmationHeader).toBe(
      checkoutFlow.expectedConfirmation,
    );
    expect(runtimeData.orderRef).toBeTruthy();
  });
});
