---
name: requirement_analysis
description: Analyze business requirement text files and produce traceable scenario, test, Azure DevOps, and Jira planning deliverables.
argument-hint: Optional business document or input/output folder paths; defaults to business/ and output/.
---

# Business Requirements Analysis

## Goal

Read the business requirement `.txt` documents in the repository's `business/` folder and produce a complete, traceable analysis package in `output/`. The package must be available as both Markdown (`.md`) and plain text (`.txt`).

## Inputs and boundaries

- Default input: every `.txt` file directly inside the repository-root `business/` folder. If the user supplies a specific document or folder, use that instead.
- Default output: repository-root `output/`. Create it when it does not exist.
- Read relevant existing repository test plans and tests only to improve traceability and avoid claiming that a planned or implemented test is absent. Business requirements remain the source of truth.
- Do not use the network, disclose document contents, or create/update live Jira or Azure DevOps items. Produce drafts for human review only.
- Do not invent business rules, acceptance criteria, dates, estimates, owners, credentials, or environment details. Mark missing decisions as `TBD` / open questions and distinguish recommendations from stated requirements.
- Never copy passwords, tokens, or other secrets into generated files. Refer to credentials as configured test secrets.

## Workflow

1. Confirm the input folder exists and enumerate its `.txt` files. If it is missing or empty, report the issue and do not produce success-shaped empty deliverables.
2. Read every selected business document and extract its goals, scope, personas, requirements and IDs, rules, journeys, data expectations, non-functional needs, acceptance criteria, traceability, and open questions.
3. Inspect only relevant existing plans/tests referenced by the document. Label artifacts as existing, proposed, or needing verification; do not infer implementation status from a plan.
4. Build scenarios and test cases with stable IDs, expected outcomes, priority based on the source, and links back to requirement IDs. Cover positive, negative, boundary, and cross-step behavior present in the source.
5. Draft platform-ready Azure DevOps and Jira work items. Include useful hierarchy, titles, descriptions, requirement links, priorities, and testable acceptance criteria. Leave unprovided planning fields unset or `TBD`.
6. Check that every stated requirement is either mapped to a scenario/test/work item or explicitly identified as needing clarification. Preserve ambiguity as an open question rather than silently resolving it.
7. Write and verify all eight files below. Each `.txt` file must contain the same substantive information as its paired `.md` file in readable plain text.

## Required output files

- `output/scenario-analysis.md` and `output/scenario-analysis.txt`
- `output/test-cases.md` and `output/test-cases.txt`
- `output/ado-work-items.md` and `output/ado-work-items.txt`
- `output/jira-work-items.md` and `output/jira-work-items.txt`

### Content expectations

- **Scenario analysis:** source documents, concise summary, scope and exclusions, actors, business rules, end-to-end scenarios, non-functional expectations, requirement traceability, assumptions, risks/dependencies, and open questions.
- **Test cases:** stable case IDs, scenario, priority, linked requirement IDs, preconditions/data, actionable steps, and observable expected results. Keep secrets abstract and test data non-production.
- **Azure DevOps:** proposed Epic / Feature / User Story hierarchy where appropriate; each item has a draft title, description, priority, parent/link references, and verifiable acceptance criteria.
- **Jira:** proposed Epic / Story hierarchy where appropriate; each item has a draft summary, description, priority, labels, requirement links, and verifiable acceptance criteria.

## Output quality and safety

- Keep all outputs in the requested output folder; never write generated analysis over source documents or existing test assets.
- Use consistent IDs and terminology across all deliverables. Clearly label generated work items as drafts and do not invent platform IDs.
- Include source filenames and requirement IDs so a reviewer can trace every conclusion.
- If an output file already exists, read it before replacing it and preserve unrelated user content; do not delete unrelated files.
- Finish with a concise report listing processed inputs, generated files, requirement coverage gaps, and unresolved questions.
