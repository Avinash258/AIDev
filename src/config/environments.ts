export type EnvironmentName = 'dev' | 'qa' | 'stage';

export type EnvironmentConfig = {
  name: EnvironmentName;
  baseURL: string;
  /** Shared SauceDemo password; override with SAUCEDEMO_PASSWORD */
  password: string;
  /** Optional API base for future create-user / seed endpoints */
  apiURL?: string;
};

/**
 * Env files hold URLs + secrets only.
 * Business test data is created at runtime via factories / setup flows.
 */
export const environments: Record<EnvironmentName, EnvironmentConfig> = {
  dev: {
    name: 'dev',
    baseURL: 'https://www.saucedemo.com',
    password: 'secret_sauce',
  },
  qa: {
    name: 'qa',
    baseURL: 'https://www.saucedemo.com',
    password: 'secret_sauce',
  },
  stage: {
    name: 'stage',
    baseURL: 'https://www.saucedemo.com',
    password: 'secret_sauce',
  },
};
