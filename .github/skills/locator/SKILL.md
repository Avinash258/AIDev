---
name: locator
description: Choose, create, and improve resilient Playwright locators. Use when writing or debugging locators, selectors, Page Objects, or UI tests.
---

# Playwright Locator Strategy

Choose locators that describe how a user or assistive technology identifies an element. Follow Playwright's locator guidance and this repository's Page Object and Action conventions. A good locator is understandable, resilient to layout or DOM refactors, and uniquely identifies the intended element when used for an action.

## Locator selection order

Prefer the most meaningful user-facing locator available:

1. `getByRole(role, { name })` for interactive controls and semantic content. Include the accessible name; use `{ exact: true }` when exact matching makes the intent clearer.
2. `getByLabel(text)` for form controls with an associated label.
3. `getByText(text)` for visible non-interactive content or content assertions.
4. `getByPlaceholder(text)` when the placeholder is the only useful user-facing identifier for an input.
5. `getByAltText(text)` for images and other elements with meaningful alternative text; `getByTitle(text)` when the title is the intended identifier.
6. `getByTestId(id)` when user-facing attributes are insufficient or unstable and the application provides a deliberate testing contract.

Do not choose a locator solely because it is short. Use a test ID when it improves stability, not as a default replacement for an accessible role, label, or name.

## Resilience and uniqueness

- Treat a locator as a description of the target, not as a stored element handle. Playwright resolves locators when an action or assertion runs, which supports dynamic pages and built-in waiting.
- Actions such as `click()` and `fill()` should target one intended element. If the locator matches multiple elements, refine it instead of allowing strictness errors or choosing an arbitrary match.
- Narrow repeated elements by scoping from a meaningful container and chaining a user-facing locator. Use `filter({ hasText })` or `filter({ has: locator })` when it expresses the relationship clearly. The inner locator in `has` must be relative to the outer locator.
- Use `first()`, `last()`, and `nth()` only when position is itself part of the scenario and the ordering is intentional and stable. Do not use them to silence an ambiguous locator.
- For collections, assert the expected count or behavior directly rather than selecting a positional item without a user-relevant reason.
- Prefer retrying web-first assertions such as `await expect(locator).toBeVisible()` or `toHaveText()` over fixed sleeps or one-time DOM checks.

## CSS, XPath, and DOM structure

- Avoid long CSS or XPath chains, positional selectors, and selectors coupled to styling classes or internal DOM structure. They tend to break when the page implementation changes.
- Use `locator(cssOrXPath)` only when the user-facing locator APIs and an explicit test ID cannot express the target. Keep the selector short and based on a stable, intentional attribute; explain non-obvious choices.
- Do not use XPath for shadow-root content; Playwright's XPath locators do not pierce shadow roots. Prefer supported role, text, label, or test-id locators.
- Never copy transient browser snapshot references, generated element IDs, or coordinates into application locators.

## Repository conventions

- Put UI locators and page-specific behavior in `src/pages/`. Keep reusable workflows in `src/actions/`.
- Reuse existing Page and Action methods. If a locator or interaction is missing, add the appropriate reusable method rather than putting raw locator interactions in a spec.
- Keep specs focused on scenario arrangement and assertions. Put assertions in specs, not in Page Objects or Actions.
- Inspect the live page or available accessibility snapshot when needed to confirm roles, accessible names, labels, and relationships. Do not guess selectors from screenshots alone.

## Examples

### Prefer role and accessible name

```ts
const signInButton = page.getByRole('button', {
  name: 'Sign in',
  exact: true,
});
await signInButton.click();
```

### Use the associated form label

```ts
await page.getByLabel('User name').fill('standard_user');
```

### Disambiguate a repeated action by its container

```ts
const product = page
  .getByRole('listitem')
  .filter({ has: page.getByRole('heading', { name: 'Product 2' }) });

await product.getByRole('button', { name: 'Add to cart' }).click();
```

The heading locator is evaluated within each candidate list item. Avoid using `nth()` if the product name identifies the intended card.

### Use a test ID as an explicit contract when needed

```ts
await page.getByTestId('directions').click();
```

Use this when a meaningful role, label, or visible text is unavailable or does not provide a stable unique target.

### Avoid structural selectors

```ts
// Avoid: tied to DOM nesting and implementation classes.
page.locator('#app > div:nth-child(2) > div.panel button.primary');

// Prefer: expresses the control as users encounter it.
page.getByRole('button', { name: 'Save', exact: true });
```

## Locator review checklist

Before using or approving a locator, verify:

- It represents the intended user-visible element or an explicit test contract.
- It is unique for the action, or intentionally represents a collection for an assertion.
- It remains meaningful if layout, styling, or unrelated DOM structure changes.
- Any scoping/filtering reflects a real relationship and does not accidentally select a different item.
- It follows the existing Page Object and Action boundaries.

## Reference

Official Playwright documentation: [Locators](https://playwright.dev/docs/locators).
