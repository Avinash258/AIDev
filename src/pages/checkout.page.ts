import type { Locator, Page } from '@playwright/test';
import type { CustomerData } from '../utils/data-factory';
import { BasePage } from './base.page';

export class CheckoutPage extends BasePage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly confirmationHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.getByPlaceholder('First Name');
    this.lastName = page.getByPlaceholder('Last Name');
    this.postalCode = page.getByPlaceholder('Zip/Postal Code');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.finishButton = page.getByRole('button', { name: 'Finish' });
    this.confirmationHeader = page.locator('.complete-header');
  }

  async fillCustomer(customer: Pick<CustomerData, 'firstName' | 'lastName' | 'postalCode'>) {
    await this.firstName.fill(customer.firstName);
    await this.lastName.fill(customer.lastName);
    await this.postalCode.fill(customer.postalCode);
  }

  async continueToOverview() {
    await this.continueButton.click();
  }

  async finish() {
    await this.finishButton.click();
  }
}
