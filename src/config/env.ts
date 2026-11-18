import {
  environments,
  type EnvironmentConfig,
  type EnvironmentName,
} from './environments';

let cached: EnvironmentConfig | undefined;

function resolveEnvName(): EnvironmentName {
  const raw = (process.env.TEST_ENV ?? 'qa').toLowerCase();
  if (raw === 'dev' || raw === 'qa' || raw === 'stage') {
    return raw;
  }
  throw new Error(
    `Unknown TEST_ENV "${raw}". Expected one of: dev, qa, stage.`,
  );
}

/**
 * Active environment. Switch with TEST_ENV=dev|qa|stage.
 * Password can still be overridden by SAUCEDEMO_PASSWORD.
 */
export function getEnv(): EnvironmentConfig {
  if (cached) {
    return cached;
  }

  const name = resolveEnvName();
  const base = environments[name];
  cached = {
    ...base,
    password: process.env.SAUCEDEMO_PASSWORD ?? base.password,
  };
  return cached;
}

export function getBaseURL(): string {
  return getEnv().baseURL;
}

export function getPassword(): string {
  return getEnv().password;
}
