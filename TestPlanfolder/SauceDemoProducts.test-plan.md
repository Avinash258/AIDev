# SauceDemo Product Listing and Detail Test Plan

## Application Overview

Test the SauceDemo product listing and product detail experience, including catalog rendering, sorting, item navigation, and cart controls. Scenarios are independent, use a fresh test fixture, and follow the repository's POM/Action architecture. Environment selection remains in src/config via TEST_ENV; no environment-specific test data or hardcoded environment URLs/IDs are used.

## Test Scenarios

### 1. Products

**Seed:** `tests/seed.spec.ts`

#### 1.1. Products page displays the catalog

**File:** `tests/products/products-list-displays-catalog.spec.ts`

**Steps:**
  1. Implementation: Fixture=test-fixtures; Spec target=tests/products/products-list-displays-catalog.spec.ts; Pages=src/pages/inventory.page.ts; Actions=src/actions/auth.actions.ts; Data=src/data/users.ts, src/data/urls.ts, add src/data/products.ts for environment-agnostic expected catalog; Dependency=none.
    - expect: Use an isolated, fresh test context.
  2. Sign in as the standard user using AuthActions and open the products page.
    - expect: The browser is on the inventory route derived from src/data/urls.ts.
    - expect: The Products heading is visible.
  3. Inspect the product cards through InventoryPage methods.
    - expect: All expected products from src/data/products.ts are present exactly once.
    - expect: Each card exposes its product name, price, image, and add-to-cart control.

#### 1.2. Products can be sorted in each supported order

**File:** `tests/products/products-can-be-sorted.spec.ts`

**Steps:**
  1. Implementation: Fixture=test-fixtures; Spec target=tests/products/products-can-be-sorted.spec.ts; Pages=src/pages/inventory.page.ts; Actions=src/actions/auth.actions.ts; Data=src/data/users.ts, src/data/products.ts; Dependency=none.
    - expect: Use an isolated, fresh test context.
  2. Sign in as the standard user and verify the product listing is displayed.
    - expect: The listing starts with the default Name (A to Z) sort order.
  3. Use an InventoryPage sort method to select Name (Z to A), Price (low to high), and Price (high to low), checking the visible item order after each selection.
    - expect: Names and prices are ordered correctly for each selected sort mode.
    - expect: The expected ordering is derived from environment-agnostic product data, not IDs or per-environment values.

#### 1.3. Product details open and return to the catalog

**File:** `tests/products/product-details-open-and-return.spec.ts`

**Steps:**
  1. Implementation: Fixture=test-fixtures; Spec target=tests/products/product-details-open-and-return.spec.ts; Pages=src/pages/inventory.page.ts and add src/pages/product.page.ts; Actions=src/actions/auth.actions.ts and add/extend a product navigation Action if needed; Data=src/data/users.ts, src/data/urls.ts, src/data/products.ts; Dependency=none.
    - expect: Use an isolated, fresh test context.
  2. Sign in as the standard user and use InventoryPage to open the Sauce Labs Backpack details.
    - expect: The product detail view opens without hardcoding the app host or product ID.
  3. Verify product details with ProductPage, then use its Back to products method.
    - expect: The detail view shows the expected product name, description, price, and image.
    - expect: The products listing is restored.

#### 1.4. Product can be added to and removed from the listing cart

**File:** `tests/products/product-can-be-added-and-removed-from-list.spec.ts`

**Steps:**
  1. Implementation: Fixture=test-fixtures; Spec target=tests/products/product-can-be-added-and-removed-from-list.spec.ts; Pages=src/pages/inventory.page.ts; Actions=src/actions/auth.actions.ts and add/extend a cart Action if needed; Data=src/data/users.ts, src/data/urls.ts, src/data/products.ts; Dependency=none.
    - expect: Use an isolated, fresh test context with an empty cart.
  2. Sign in as the standard user and use InventoryPage to add the Sauce Labs Backpack to the cart.
    - expect: The cart count becomes 1.
    - expect: The product control changes to Remove.
  3. Use the Page or Action method to remove the same product.
    - expect: The cart count returns to the empty state.
    - expect: The product control changes back to Add to cart.

#### 1.5. Product can be added to cart from its detail view

**File:** `tests/products/product-detail-add-to-cart.spec.ts`

**Steps:**
  1. Implementation: Fixture=test-fixtures; Spec target=tests/products/product-detail-add-to-cart.spec.ts; Pages=src/pages/inventory.page.ts, add src/pages/product.page.ts; Actions=src/actions/auth.actions.ts and add/extend a product Action if needed; Data=src/data/users.ts, src/data/urls.ts, src/data/products.ts; Dependency=none.
    - expect: Use an isolated, fresh test context with an empty cart.
  2. Sign in as the standard user, open a product detail view through InventoryPage, and add that product using ProductPage or an Action method.
    - expect: The cart count becomes 1.
    - expect: The product detail control changes to Remove.
  3. Navigate to the cart through the framework's Page or Action method and inspect the cart item.
    - expect: The cart contains the selected product with the expected name and price.
