import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class InventoryPage extends BasePage {
  readonly productsHeading: Locator;
  readonly cartLink: Locator;

  constructor(page: Page) {
    super(page);
    this.productsHeading = page.getByText('Products', { exact: true });
    this.cartLink = page.locator('.shopping_cart_link');
  }

  productItem(name: string): Locator {
    return this.page.locator('.inventory_item').filter({ hasText: name });
  }

  async addProductByName(name: string) {
    await this.productItem(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async openCart() {
    await this.cartLink.click();
  }
}
