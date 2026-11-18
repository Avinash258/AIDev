import { users } from '../users';

/**
 * Login flow templates — roles only, no env-specific IDs.
 * Credentials resolve from active TEST_ENV via users.ts.
 */
export const loginFlow = {
  happyPath: {
    user: users.standard,
  },
  lockedOut: {
    user: users.lockedOut,
  },
  invalidUser: {
    user: users.invalidUser,
  },
} as const;
