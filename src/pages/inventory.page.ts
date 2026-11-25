import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class InventoryPage extends BasePage {
  readonly productsHeading: Locator;
  readonly cartLink: Locator;
  readonly addToCartButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.productsHeading = page.getByText('Products', { exact: true });
    this.cartLink = page.locator('.shopping_cart_link');
    this.addToCartButtons = page.getByRole('button', { name: 'Add to cart' });
  }

  productItem(name: string): Locator {
    return this.page.locator('.inventory_item').filter({ hasText: name });
  }

  productName(name: string): Locator {
    return this.page.locator('.inventory_item_name', { hasText: name });
  }

  productPrice(name: string, price: string): Locator {
    return this.productItem(name).locator('.inventory_item_price', {
      hasText: price,
    });
  }

  productImage(name: string): Locator {
    return this.productItem(name).locator('img');
  }

  async addProductByName(name: string) {
    await this.productItem(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async openCart() {
    await this.cartLink.click();
  }
}
