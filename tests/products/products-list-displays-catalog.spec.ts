// spec: TestPlanfolder/SauceDemoProducts.test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../src/fixtures/test-fixtures';
import { products } from '../../src/data/products';
import { urls } from '../../src/data/urls';
import { users } from '../../src/data/users';

test.describe('Products', () => {
  test('Products page displays the catalog', async ({
    auth,
    inventoryPage,
    page,
  }) => {
    await auth.openLogin();
    await auth.loginAs(users.standard);

    await expect(page).toHaveURL(urls.inventory);
    await expect(inventoryPage.productsHeading).toBeVisible();

    for (const product of products) {
      await expect(inventoryPage.productName(product.name)).toHaveCount(1);
      await expect(
        inventoryPage.productPrice(product.name, product.price),
      ).toBeVisible();
      await expect(inventoryPage.productImage(product.name)).toBeVisible();
      await expect(
        inventoryPage.productItem(product.name).getByRole('button', {
          name: 'Add to cart',
        }),
      ).toBeVisible();
    }

    await expect(inventoryPage.addToCartButtons).toHaveCount(products.length);
  });
});
