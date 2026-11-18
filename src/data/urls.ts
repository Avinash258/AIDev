import { getBaseURL } from '../config/env';

export const urls = {
  get base() {
    return `${getBaseURL()}/`;
  },
  inventory: /\/inventory\.html$/,
  cart: /\/cart\.html$/,
  checkoutInfo: /\/checkout-step-one\.html$/,
  checkoutOverview: /\/checkout-step-two\.html$/,
  checkoutComplete: /\/checkout-complete\.html$/,
} as const;
