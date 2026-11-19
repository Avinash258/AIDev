// spec: TestPlanfolder/SauceDemoLogin.test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../src/fixtures/test-fixtures';
import { loginErrors } from '../../src/data/messages';
import { urls } from '../../src/data/urls';
import { users } from '../../src/data/users';

test.describe('Login', () => {
  test('Missing username is rejected', async ({ auth, loginPage, page }) => {
    // 1. Open the application login page and verify the Login form is visible.
    await auth.openLogin();
    await expect(loginPage.username).toBeVisible();

    // 2. Leave Username empty, enter the password, then click Login.
    await auth.loginMissingUsername(users.standard.password);

    await expect(page).toHaveURL(urls.base);
    await expect(loginPage.errorBanner).toHaveText(loginErrors.usernameRequired);
  });
});
