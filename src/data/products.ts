/**
 * SauceDemo catalog — env-agnostic product names/prices as shown in the UI.
 * Identified by visible name; no per-env IDs.
 */
export type Product = {
  name: string;
  price: string;
};

export const products: readonly Product[] = [
  { name: 'Sauce Labs Backpack', price: '$29.99' },
  { name: 'Sauce Labs Bike Light', price: '$9.99' },
  { name: 'Sauce Labs Bolt T-Shirt', price: '$15.99' },
  { name: 'Sauce Labs Fleece Jacket', price: '$49.99' },
  { name: 'Sauce Labs Onesie', price: '$7.99' },
  { name: 'Test.allTheThings() T-Shirt (Red)', price: '$15.99' },
] as const;
