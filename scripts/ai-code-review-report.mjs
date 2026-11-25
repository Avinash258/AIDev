#!/usr/bin/env node
/**
 * Deterministic AI Code Review report for CI.
 * Produces reports/ai-code-review.md (+ .txt) and prints a short summary.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'reports');
const mdPath = path.join(outDir, 'ai-code-review.md');
const txtPath = path.join(outDir, 'ai-code-review.txt');

function sh(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

function listFiles(dir, predicate) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...listFiles(full, predicate));
    else if (!predicate || predicate(full)) results.push(full.replace(/\\/g, '/'));
  }
  return results;
}

function rel(p) {
  return path.relative(root, p).replace(/\\/g, '/');
}

const eventName = process.env.GITHUB_EVENT_NAME || 'local';
const ref = process.env.GITHUB_REF || sh('git rev-parse --abbrev-ref HEAD') || 'unknown';
const sha = process.env.GITHUB_SHA || sh('git rev-parse HEAD') || 'unknown';
const runUrl = process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
  ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
  : 'n/a';
const prNumber = process.env.PR_NUMBER || '';

const baseRef =
  process.env.GITHUB_BASE_REF ||
  process.env.BASE_REF ||
  'origin/main';

let changedFiles = [];
if (eventName === 'pull_request' || process.env.FORCE_DIFF === '1') {
  sh(`git fetch --no-tags --depth=50 origin ${process.env.GITHUB_BASE_REF || 'main'} 2>nul || true`);
  const diff = sh(`git diff --name-only ${baseRef}...HEAD`);
  changedFiles = diff ? diff.split(/\r?\n/).filter(Boolean) : [];
} else {
  const diff = sh('git diff --name-only HEAD~1...HEAD') || sh('git ls-files');
  changedFiles = diff ? diff.split(/\r?\n/).filter(Boolean).slice(0, 200) : [];
}

const specs = listFiles(path.join(root, 'tests'), (f) => f.endsWith('.spec.ts'));
const pages = listFiles(path.join(root, 'src/pages'), (f) => f.endsWith('.ts'));
const actions = listFiles(path.join(root, 'src/actions'), (f) => f.endsWith('.ts'));
const dataFiles = listFiles(path.join(root, 'src/data'), (f) => f.endsWith('.ts'));
const brdPath = path.join(root, 'business/SauceDemo-Business-Requirements.txt');
const brd = fs.existsSync(brdPath) ? fs.readFileSync(brdPath, 'utf8') : '';
const requirementIds = [...brd.matchAll(/\bBR-[A-Z]+-\d+\b/g)].map((m) => m[0]);
const uniqueReqs = [...new Set(requirementIds)];

const findings = [];

function addFinding(severity, title, detail) {
  findings.push({ severity, title, detail });
}

// Framework architecture checks on changed / present files
const changedSpecs = changedFiles.filter((f) => f.includes('tests/') && f.endsWith('.spec.ts'));
for (const spec of changedSpecs) {
  const abs = path.join(root, spec);
  if (!fs.existsSync(abs)) continue;
  const body = fs.readFileSync(abs, 'utf8');
  if (body.includes("from '@playwright/test'") && !body.includes('fixtures/')) {
    addFinding(
      'High',
      `${spec} imports @playwright/test directly`,
      'Prefer test-fixtures or flow-fixtures so pages/actions stay injectable.',
    );
  }
  if (/page\.(click|fill|goto)\(/.test(body) && !/auth\.|checkout\.|setup\./.test(body)) {
    addFinding(
      'Medium',
      `${spec} may use raw page interactions`,
      'Prefer Page Object / Action methods over raw page.click/fill when available.',
    );
  }
  if (/waitForTimeout\(/.test(body)) {
    addFinding(
      'High',
      `${spec} uses waitForTimeout`,
      'Use web-first assertions instead of hard waits.',
    );
  }
}

for (const f of changedFiles) {
  if (/\.(env|pem|key)$/i.test(f) || /secrets?/i.test(f)) {
    addFinding('Critical', `Sensitive-looking path in change set: ${f}`, 'Confirm no secrets are committed.');
  }
  if (/password\s*[:=]\s*['"][^'"]+['"]/i.test(fs.existsSync(path.join(root, f)) ? fs.readFileSync(path.join(root, f), 'utf8') : '')) {
    addFinding('Critical', `Hardcoded password-like string in ${f}`, 'Use env / getPassword() instead.');
  }
}

if (changedFiles.some((f) => f.startsWith('src/pages/') || f.startsWith('tests/')) &&
    !changedFiles.some((f) => f.includes('.spec.ts'))) {
  addFinding(
    'Medium',
    'Page/UI layer changed without a matching spec in this diff',
    'Confirm coverage exists or add/update tests.',
  );
}

const mustReqs = uniqueReqs.filter((id) => {
  const line = brd.split(/\r?\n/).find((l) => l.includes(id));
  return line && /Must/i.test(line);
});

const coverageHints = {
  'BR-AUTH': specs.some((s) => /login/i.test(s)),
  'BR-PROD': specs.some((s) => /product/i.test(s)),
  'BR-CART': specs.some((s) => /cart|checkout|product/i.test(s)),
  'BR-CHK': specs.some((s) => /checkout|flow/i.test(s)),
};

const coverageRows = mustReqs.map((id) => {
  const prefix = id.replace(/-\d+$/, '');
  const covered = coverageHints[prefix] ? 'Likely covered' : 'Gap / verify';
  return `| ${id} | ${covered} |`;
});

const bySeverity = (sev) => findings.filter((f) => f.severity === sev);

function renderFindings(sev) {
  const items = bySeverity(sev);
  if (!items.length) return `_None_\n`;
  return items.map((f) => `- **${f.title}** — ${f.detail}`).join('\n') + '\n';
}

const generatedAt = new Date().toISOString();

const report = `# AI Code Review Report

| Field | Value |
|---|---|
| Generated | ${generatedAt} |
| Event | ${eventName} |
| Ref | ${ref} |
| SHA | \`${sha}\` |
| PR | ${prNumber || 'n/a'} |
| Run | ${runUrl} |
| Agent | \`.github/agents/code-review.agent.md\` |

## Summary

- Changed files considered: **${changedFiles.length}**
- Specs in repo: **${specs.length}**
- Pages: **${pages.length}** · Actions: **${actions.length}** · Data modules: **${dataFiles.length}**
- Findings: Critical **${bySeverity('Critical').length}**, High **${bySeverity('High').length}**, Medium **${bySeverity('Medium').length}**, Low **${bySeverity('Low').length}**

## Changed files

${changedFiles.length ? changedFiles.map((f) => `- \`${f}\``).join('\n') : '_No diff detected; listed current tree sample / empty._'}

## Critical Issues

${renderFindings('Critical')}
## High Issues

${renderFindings('High')}
## Medium Issues

${renderFindings('Medium')}
## Low Issues

${renderFindings('Low')}
## Test Coverage Gaps (Must requirements)

| Requirement | Status |
|---|---|
${coverageRows.length ? coverageRows.join('\n') : '| n/a | No BR Must IDs found |'}

## Architecture inventory

### Specs
${specs.map((s) => `- \`${rel(s)}\``).join('\n') || '_None_'}

### Pages
${pages.map((s) => `- \`${rel(s)}\``).join('\n') || '_None_'}

### Actions
${actions.map((s) => `- \`${rel(s)}\``).join('\n') || '_None_'}

## Recommendations

1. Keep specs importing from \`test-fixtures\` / \`flow-fixtures\`.
2. Put locators in \`src/pages\`, multi-step flows in \`src/actions\`.
3. Prefer env-agnostic data in \`src/data\` / \`src/data/flows\` + factory.
4. Map new behavior to \`BR-*\` IDs in \`business/SauceDemo-Business-Requirements.txt\`.
5. Re-run Playwright (\`npm test\` or \`npm run test:chromium\`) before merge.

## Review checklist

- [ ] No secrets / hardcoded passwords
- [ ] Specs use fixtures, not raw \`@playwright/test\` only
- [ ] No \`waitForTimeout\`
- [ ] Assertions stay in specs
- [ ] Happy path + critical negative cases covered
- [ ] Human merge approval still required
`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(mdPath, report, 'utf8');
fs.writeFileSync(txtPath, report.replace(/\*\*/g, '').replace(/`/g, ''), 'utf8');

const short = [
  `AI Code Review report written to ${rel(mdPath)}`,
  `Findings: C${bySeverity('Critical').length}/H${bySeverity('High').length}/M${bySeverity('Medium').length}/L${bySeverity('Low').length}`,
  `Changed files: ${changedFiles.length}`,
].join('\n');

console.log(short);
console.log('\n---REPORT_START---');
console.log(report);
console.log('---REPORT_END---');

const critical = bySeverity('Critical').length;
if (process.env.FAIL_ON_CRITICAL === '1' && critical > 0) {
  process.exit(1);
}
