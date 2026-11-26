---
name: testfailureanalysis
description: Analyze failed GitHub Actions CI runs, identify evidence-backed root causes, and recommend next steps without changing code.
---

# CI Failure Analysis Skill

Use this skill when investigating a failed GitHub Actions workflow, job, or CI check. The goal is to explain why it failed using run metadata, job logs, workflow configuration, and relevant source files—not to fix or rerun it.

## Investigation workflow

### 1. Identify the relevant run

- Start with a run URL or ID supplied by the user. If none is provided, identify the run using the stated pull request, branch, or workflow.
- If several runs are plausible and the target cannot be determined, ask the user which run to inspect rather than guessing.
- Establish the workflow name, run ID, event, branch/commit, and status.
- Distinguish failures from queued, in-progress, skipped, and cancelled runs.

### 2. Inspect jobs and logs

- Retrieve run metadata and job results; identify failed jobs and the exact failing step when available.
- Read the failed job logs and locate the earliest meaningful error, rather than relying only on a final exit code or later cascading errors.
- Inspect the relevant workflow YAML and only the source or configuration files necessary to explain the failure.
- For pull-request runs, inspect PR/check context when it helps establish the commit, changed files, or check state.

### 3. Determine and classify the cause

- Trace the failure from its earliest actionable error through relevant workflow and source configuration.
- Separate what the logs directly prove from what is inferred. Label the cause **confirmed** or **likely**, and state confidence when evidence is incomplete.
- Where useful, classify the issue as workflow/configuration, dependency/install, build, test/assertion, environment/secret, external service, timeout/resource, or runner/infrastructure.
- Identify downstream or cascading failures separately from the primary cause.
- Do not assume a flaky test, transient outage, or infrastructure problem without supporting evidence.
- If the available evidence is insufficient, state what is unknown and what additional run, job, or log information is needed. Never invent a diagnosis.

### 4. Report findings; do not make changes

- Do not edit files, commit changes, rerun or cancel workflows, change repository settings, or create/update GitHub content.
- Give a concise, focused recommended next step. Suggest a code change only when evidence supports it, and present it as a recommendation—not as an applied fix.
- If run data or logs are inaccessible, report the access limitation and avoid presenting a guess as fact.

## Evidence and secret handling

- Support the diagnosis with the relevant workflow/run, job, step, timestamp, and concise log excerpt or error text.
- Keep evidence excerpts to the minimum needed to support the explanation.
- Never expose credentials, tokens, private keys, or other secrets found in logs. Redact sensitive values; if relevant, state only that a secret appears missing or invalid.
- Distinguish direct observations from deductions and make uncertainty explicit.

## Response format

### CI failure

- **Workflow / run:** workflow name, run ID, event, branch/commit, and status
- **Failed job / step:** exact names when available
- **Primary failure:** earliest actionable error in concise terms
- **Evidence:** short log excerpt or error text and its job/step location
- **Root cause:** confirmed or likely, confidence, and reasoning
- **Other failures:** downstream/cascading errors or unrelated failures, if any
- **Recommended next step:** the smallest useful investigation or fix
- **Limitations:** inaccessible logs, permissions, or unresolved uncertainty