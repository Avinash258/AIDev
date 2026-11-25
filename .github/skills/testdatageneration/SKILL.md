---
name: testdatageneration
description: Generate and organize safe, realistic, framework-aligned test data for Playwright tests. Use when creating test fixtures, scenario data, flow data, runtime data, or data factories.
---

# Test Data Generation

Generate test data that supports the repository's Playwright framework and the scenarios under test. Keep data maintainable, environment-agnostic, safe to share, and realistic enough to verify observable behavior.

## Before generating data

1. Read the relevant test plan, spec, and existing files under `src/data/`, `src/utils/`, and `src/fixtures/`.
2. Reuse existing data constants, types, and factories where possible. Match the repository's TypeScript style and naming.
3. Determine whether the scenario is independent or genuinely depends on data created by an earlier test. Prefer independent data and `test-fixtures`; use `flow-fixtures` and `runtimeData` only for real create-then-consume journeys.
4. Generate only the data needed by the requested scenarios. Do not invent business rules or requirements; call out missing or ambiguous values for clarification.

## Framework locations and data ownership

- Put reusable, environment-neutral business data in `src/data/`.
- Put data specific to a multi-step journey in `src/data/flows/`.
- Put reusable typed data factories in `src/utils/` when data must be generated dynamically or supports overrides.
- Keep types that describe cross-test runtime handoffs in `src/data/runtime-data.ts`. Setup actions populate `runtimeData`; later flow tests consume it.
- Put environment selection and environment-specific configuration only in `src/config/`. Switch environments through `TEST_ENV`; never create per-environment business-data files.
- Keep test assertions in specs, not in data modules, Pages, or Actions.

Use static constants for stable, reusable values; use a factory for data that must be unique per run. Define explicit types for structured data and use `as const` for fixed literal collections when appropriate. Keep generated values valid for the application's inputs and easy for tests to verify.

## Safety and quality rules

- Never include real customer records, production data, passwords, tokens, or other secrets in generated files.
- Reference configured test secrets through the existing configuration helpers. Keep credential usernames abstract or use documented test accounts; do not duplicate secret values.
- Do not hardcode environment URLs, environment-specific IDs, or values discovered only in one environment. Resolve entities such as product IDs at runtime using stable, visible business keys when needed.
- Keep flow data environment-agnostic. Use `runtimeData` only when a later step must consume data created at runtime; do not use it to share static data.
- Generate unique values only where collisions matter. Prefer the existing factory patterns and preserve the ability to provide deterministic overrides in tests.
- Do not silently substitute invalid, empty, or success-shaped data when required inputs are missing. Report the missing requirement or configuration.
- Update only the data and directly related types/factory code required by the request. Do not create generated artifacts or data files outside the requested scope.

## Examples

### Stable scenario or flow data

Store stable business-level values in a named constant, not in a spec or environment-specific file:

```ts
export const checkoutFlow = {
  productNames: ['Example Backpack', 'Example Bike Light'] as const,
  defaultPostalCode: '560001',
} as const;
```

Prefer names that describe what the test uses, such as product names, rather than environment-bound identifiers.

### Unique data with deterministic overrides

Use a typed factory when each run needs unique data, while allowing tests to override values:

```ts
export type CustomerData = {
  firstName: string;
  lastName: string;
  postalCode: string;
  email: string;
};

export function buildCustomer(
  overrides: Partial<CustomerData> = {},
): CustomerData {
  const id = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return {
    firstName: 'Auto',
    lastName: `User${id}`,
    postalCode: '560001',
    email: `auto.user.${id}@example.com`,
    ...overrides,
  };
}
```

Use non-production domains and data. For cases that test invalid input, make the invalidity explicit in the test scenario or factory override.

### Credentials from configuration

Keep the password in the configured test-secret source rather than in test data:

```ts
import { getPassword } from '../config/env';

export const testUser = {
  username: 'standard_user',
  get password() {
    return getPassword();
  },
};
```

Follow the existing repository helper and account conventions instead of adding another credential mechanism.

### Data created and consumed by a dependent flow

Use the existing typed `RuntimeData` shape and setup flow. Add a field only when a later test actually needs to consume data created at runtime. Keep static inputs in `src/data/flows/`; do not store them in `runtimeData`.

## Completion

After generating or changing data, check that imports, types, and consumers agree; values remain environment-agnostic; no secrets or production data were added; and independent tests have not gained unnecessary serial dependencies. Report the files changed and any unresolved data assumptions.
