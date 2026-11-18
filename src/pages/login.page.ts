import type { Locator, Page } from '@playwright/test';
import { urls } from '../data/urls';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly errorBanner: Locator;
  readonly dismissError: Locator;

  constructor(page: Page) {
    super(page);
    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorBanner = page.locator('[data-test="error"]');
    this.dismissError = page.getByRole('button', { name: 'Dismiss error' });
  }

  async goto() {
    await this.page.goto(urls.base);
  }

  async fillCredentials(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
  }

  async submit() {
    await this.loginButton.click();
  }

  async submitWithEnter() {
    await this.password.press('Enter');
  }

  async login(username: string, password: string) {
    await this.fillCredentials(username, password);
    await this.submit();
  }

  async dismissLoginError() {
    await this.dismissError.click();
  }
}
