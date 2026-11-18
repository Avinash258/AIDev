export type CustomerData = {
  firstName: string;
  lastName: string;
  postalCode: string;
  email: string;
};

function stamp(): string {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

/** Builds unique customer payload for the current run (env-agnostic). */
export function buildCustomer(
  overrides: Partial<CustomerData> = {},
): CustomerData {
  const id = stamp();
  return {
    firstName: 'Auto',
    lastName: `User${id}`,
    postalCode: '560001',
    email: `auto.user.${id}@example.com`,
    ...overrides,
  };
}

export function buildOrderRef(prefix = 'ORD'): string {
  return `${prefix}-${stamp()}`;
}
