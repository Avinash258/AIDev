# AIDev — Playwright Test Framework

Playwright E2E framework using **Page Object Model (POM)**, **action handlers**, **flow/runtime data**, and **env-aware config**. Specs stay thin; reusable logic lives in `src/`.

Demo app: [SauceDemo](https://www.saucedemo.com/).

---

## Quick start

```bash
npm install
npx playwright install
```

```powershell
# All tests
npm test

# Suites
npm run test:login
npm run test:flows

# Chromium only
npm run test:chromium

# Switch environment (URLs/secrets only)
$env:TEST_ENV='qa'; npx playwright test
$env:TEST_ENV='dev'; npx playwright test --project=chromium

# Optional password override
$env:SAUCEDEMO_PASSWORD='secret_sauce'

# HTML report
npm run report
```

---

## Architecture

```text
AIDev/
├── playwright.config.ts          # baseURL from active TEST_ENV
├── src/
│   ├── config/                   # Env = URLs + secrets only
│   │   ├── environments.ts
│   │   └── env.ts
│   ├── data/
│   │   ├── users.ts              # Role-based credentials (password from env)
│   │   ├── messages.ts           # UI copy / error strings
│   │   ├── urls.ts               # Route patterns
│   │   ├── runtime-data.ts       # Shared bag for dependent flows
│   │   └── flows/                # Env-agnostic flow templates
│   │       ├── login.flow.ts
│   │       └── checkout.flow.ts
│   ├── utils/
│   │   ├── data-factory.ts       # Unique runtime customer/order data
│   │   └── env.ts
│   ├── pages/                    # Page Object Model (locators + page intent)
│   │   ├── base.page.ts
│   │   ├── login.page.ts
│   │   ├── inventory.page.ts
│   │   ├── cart.page.ts
│   │   └── checkout.page.ts
│   ├── actions/                  # Multi-step business flows
│   │   ├── auth.actions.ts
│   │   ├── setup.actions.ts      # Create/prepare runtimeData + seed UI
│   │   └── checkout.actions.ts   # Consume runtimeData
│   └── fixtures/
│       ├── test-fixtures.ts      # Independent tests (isolated context)
│       └── flow-fixtures.ts      # Dependent serial flows (shared session + runtimeData)
├── tests/
│   ├── login/                    # Independent login suite
│   ├── flows/                    # Dependent create → consume journey
│   └── seed.spec.ts              # Planner/generator seed
├── TestPlanfolder/               # Human / agent test plans
└── .github/agents/               # Planner, generator, healer agents
```

### Layer rules

| Layer | Owns | Does not own |
|---|---|---|
| **Config** | `baseURL`, passwords, `apiURL` | Business payloads, product IDs |
| **Flow templates** | Names/shapes for a journey | Env-specific IDs |
| **Data factory** | Unique emails, names, order refs | Playwright UI calls |
| **Pages** | Locators + single-page actions | Assertions, multi-page flows |
| **Actions** | Multi-step flows | `expect()` (keep in specs) |
| **Fixtures** | Wire `page` → pages → actions | Business rules |
| **Specs** | Arrange + web-first asserts | Raw selectors when POM exists |

---

## Environments

Env files hold **URLs and secrets only**. Business data is created at runtime so you do **not** maintain `users.qa.json` / `users.dev.json`.

| Variable | Purpose | Default |
|---|---|---|
| `TEST_ENV` | `dev` \| `qa` \| `stage` | `qa` |
| `SAUCEDEMO_PASSWORD` | Override shared password | from `environments.ts` |

Edit targets in `src/config/environments.ts`:

```ts
qa: {
  name: 'qa',
  baseURL: 'https://www.saucedemo.com',
  password: 'secret_sauce',
  // apiURL: 'https://api.qa.example.com',  // for future seed APIs
}
```

`playwright.config.ts` reads `getBaseURL()` from the active env.

---

## Fixtures

### Independent tests — `test-fixtures.ts`

Use for login and any scenario that starts from a **fresh** browser state.

```ts
import { test, expect } from '../../src/fixtures/test-fixtures';
import { users } from '../../src/data/users';

test('Standard user can log in', async ({ auth, inventoryPage, page }) => {
  await auth.openLogin();
  await auth.loginAs(users.standard);
  await expect(page).toHaveURL(/inventory\.html/);
  await expect(inventoryPage.productsHeading).toBeVisible();
});
```

### Dependent flows — `flow-fixtures.ts`

Use when **Flow A creates data/session** and **Flow B/C consume it**.

Provides:

- `runtimeData` (worker-scoped) — shared created data
- `flowContext` (worker-scoped) — shared cookies/session across serial tests
- `setup`, `checkout`, pages, `auth`

```ts
import { test, expect } from '../../src/fixtures/flow-fixtures';

test.describe.configure({ mode: 'serial' });

test('Flow A: create data + seed cart', async ({ setup, runtimeData }) => {
  setup.prepareCheckoutData(runtimeData);   // factory → runtimeData
  await setup.loginAndSeedCart(runtimeData); // UI uses that data
});

test('Flow B: checkout using runtimeData', async ({ checkout, runtimeData }) => {
  await checkout.completeCheckoutWithRuntimeData(runtimeData);
});

test('Flow C: later flow reads created data only', async ({ runtimeData }) => {
  expect(runtimeData.orderRef).toBeTruthy();
  expect(runtimeData.customer?.email).toContain('auto.user.');
});
```

Reference implementation: `tests/flows/checkout.dependency.spec.ts`.

---

## Data strategy

```text
Env change  →  only config (URL/password)
Flow template  →  product names, postal defaults (no env IDs)
Data factory   →  unique customer/order at runtime
Setup action   →  writes RuntimeData
Later flows    →  read/update RuntimeData
```

| File | Role |
|---|---|
| `src/data/flows/checkout.flow.ts` | Template: product names, expected confirmation |
| `src/utils/data-factory.ts` | `buildCustomer()`, `buildOrderRef()` |
| `src/data/runtime-data.ts` | `user`, `customer`, `products`, `orderRef`, … |
| `src/actions/setup.actions.ts` | `prepareCheckoutData` + `loginAndSeedCart` |

Discover catalog items by **visible name** (or future API lookup), never by hardcoded env product IDs.

---

## Page Object Model

Pages use Playwright best-practice locators (`getByRole`, `getByPlaceholder`, …), `readonly` locators, and intent methods.

```ts
// src/pages/login.page.ts
async login(username: string, password: string) {
  await this.fillCredentials(username, password);
  await this.submit();
}
```

Expose locators for assertions in specs:

```ts
await expect(loginPage.errorBanner).toHaveText(loginErrors.lockedOut);
```

---

## Actions (handlers)

| Action | Purpose |
|---|---|
| `AuthActions` | Open login, login as role, validation helpers |
| `SetupActions` | Create runtime data + seed cart for dependent journeys |
| `CheckoutActions` | Open cart, complete checkout from `runtimeData` |

Add a new feature by:

1. Page(s) under `src/pages/`
2. Action(s) under `src/actions/`
3. Optional `src/data/flows/<feature>.flow.ts`
4. Thin spec under `tests/<feature>/` or `tests/flows/`
5. Register fixtures if new pages/actions are needed

---

## Test suites

| Suite | Path | Fixture | Style |
|---|---|---|---|
| Login | `tests/login/saucedemo-login.spec.ts` | `test-fixtures` | Independent |
| Checkout journey | `tests/flows/checkout.dependency.spec.ts` | `flow-fixtures` | Serial dependent |
| Seed | `tests/seed.spec.ts` | default | Planner/generator seed |

Plan source example: `TestPlanfolder/SauceDemoLogin.test-plan.md`.

---

## Coding standards

1. Prefer `getByRole` / `getByLabel` / `getByPlaceholder` / `getByTestId`
2. Web-first asserts: `toBeVisible`, `toHaveURL`, `toHaveText` — no `waitForTimeout`
3. Assertions in **specs**; pages/actions navigate and act
4. Import `test` / `expect` from the correct fixtures file
5. No per-env business data files — use factory + `runtimeData`
6. Independent tests by default; `describe.serial` + `flow-fixtures` only when needed
7. One concern per file: page ≠ data ≠ action ≠ spec

---

## Agent workflow (GitHub Copilot / Cursor agents)

| Agent | File | Role |
|---|---|---|
| **Planner** | `.github/agents/playwright-test-planner.agent.md` | Explore UI → write test plan |
| **Generator** | `.github/agents/playwright-test-generator.agent.md` | Plan → Playwright specs |
| **Healer** | `.github/agents/playwright-test-healer.agent.md` | Debug/fix failing tests |

MCP server: Playwright test MCP (`npx playwright run-test-mcp-server`) via `.vscode/mcp.json`.

When customizing agents, plans/specs/fixes should target **POM + actions + fixtures + flow/runtime data**, not raw `page.click()` scripts.

Suggested plan annotations per scenario:

- Fixture · Spec target · Pages · Actions · Data · Dependency (`none` | `serial`)

---

## Adding a new dependent flow

1. Add template: `src/data/flows/<name>.flow.ts`
2. Extend `RuntimeData` if new fields are required
3. Add `prepare*` on `SetupActions` (factory → `runtimeData`)
4. Add consume methods on a feature `*Actions` class
5. Write `tests/flows/<name>.dependency.spec.ts` with `test.describe.configure({ mode: 'serial' })`
6. Import from `src/fixtures/flow-fixtures`

---

## Scripts

| Script | Command |
|---|---|
| `npm test` | Run full suite |
| `npm run test:login` | Login specs only |
| `npm run test:flows` | Dependent flow specs |
| `npm run test:chromium` | Chromium project |
| `npm run report` | Open HTML report |

---

## CI

GitHub Actions workflow: `.github/workflows/playwright.yml`.

Set `TEST_ENV` (and secrets like `SAUCEDEMO_PASSWORD`) in the workflow environment as needed.
