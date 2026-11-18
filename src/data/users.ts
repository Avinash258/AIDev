import { getPassword } from '../config/env';

export type Credentials = {
  username: string;
  password: string;
};

function withEnvPassword(username: string): Credentials {
  return { username, password: getPassword() };
}

/**
 * Role-based users. Password comes from active env / SAUCEDEMO_PASSWORD.
 * Switch env with TEST_ENV — no per-env user data files required.
 */
export const users = {
  get standard() {
    return withEnvPassword('standard_user');
  },
  get lockedOut() {
    return withEnvPassword('locked_out_user');
  },
  get problem() {
    return withEnvPassword('problem_user');
  },
  get performance() {
    return withEnvPassword('performance_glitch_user');
  },
  get error() {
    return withEnvPassword('error_user');
  },
  get visual() {
    return withEnvPassword('visual_user');
  },
  get invalidUser() {
    return withEnvPassword('not_a_user');
  },
  get wrongPassword() {
    return { username: 'standard_user', password: 'wrong_password' };
  },
};
