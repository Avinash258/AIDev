import { getPassword } from '../config/env';

/** @deprecated Prefer getPassword() from config/env */
export function getSaucePassword(): string {
  return getPassword();
}
