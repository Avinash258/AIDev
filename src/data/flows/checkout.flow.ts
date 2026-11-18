/**
 * Checkout flow template — product names & shape only.
 * No env-specific product IDs. Setup resolves them in the live app.
 */
export const checkoutFlow = {
  /** Products to seed into the cart (discovered by visible name) */
  productNames: ['Sauce Labs Backpack', 'Sauce Labs Bike Light'] as const,
  /** Postal code default when factory override is not needed */
  defaultPostalCode: '560001',
  expectedConfirmation: 'Thank you for your order!',
} as const;
