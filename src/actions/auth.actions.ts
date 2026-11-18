import type { Page } from '@playwright/test';
import type { Credentials } from '../data/users';
import { InventoryPage } from '../pages/inventory.page';
import { LoginPage } from '../pages/login.page';

export class AuthActions {
  readonly loginPage: LoginPage;
  readonly inventoryPage: InventoryPage;

  constructor(page: Page) {
    this.loginPage = new LoginPage(page);
    this.inventoryPage = new InventoryPage(page);
  }

  async openLogin() {
    await this.loginPage.goto();
  }

  async loginAs(user: Credentials) {
    await this.loginPage.login(user.username, user.password);
  }

  async loginWithEnter(user: Credentials) {
    await this.loginPage.fillCredentials(user.username, user.password);
    await this.loginPage.submitWithEnter();
  }

  async loginMissingUsername(password: string) {
    await this.loginPage.password.fill(password);
    await this.loginPage.submit();
  }

  async loginMissingPassword(username: string) {
    await this.loginPage.username.fill(username);
    await this.loginPage.submit();
  }
}
