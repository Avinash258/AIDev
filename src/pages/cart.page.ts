import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class CartPage extends BasePage {
  readonly title: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByText('Your Cart', { exact: true });
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
  }

  cartItem(name: string): Locator {
    return this.page.locator('.cart_item').filter({ hasText: name });
  }

  async goto() {
    await this.page.goto('/cart.html');
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }
}
