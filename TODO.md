# cursed-ci

A static HTML page that says "hello world", deployed via a GitHub Actions pipeline so catastrophically over-engineered that engineers will share it in horror.

---

## The App

- [ ] Create `index.html` with a single `<h1>Hello World</h1>` and nothing else
- [ ] Create `package.json` with a `build` script that copies `index.html` to a `dist/` folder using a Node script (not cp, not a shell command — a Node script)
- [ ] Create `validate.js` — a script that reads `dist/index.html` and asserts it contains the string "Hello World". Exit 1 if not. This is the test suite.

---

## The Pipeline

### Workflow 1: `ci.yml` — The Main Build

Triggers: `push`, `pull_request`, `workflow_dispatch`

**Job 1: `preflight`**
- [ ] Checkout repo (full clone, `fetch-depth: 0`)
- [ ] Print the current date with `date`
- [ ] Print the runner OS
- [ ] Print the Node version that isn't installed yet
- [ ] Sleep 15 seconds (`# pre-flight stabilization delay`)
- [ ] Upload a "preflight report" artifact: a `.txt` file generated inline containing the word "OK"

**Job 2: `install-deps` (needs: preflight)**
- [ ] Checkout repo again (fresh checkout, separate job)
- [ ] Download the preflight artifact (never use it)
- [ ] Set up Node 18
- [ ] Run `npm install`
- [ ] Upload `node_modules` as an artifact

**Job 3: `install-deps-verify` (needs: install-deps)**
- [ ] Checkout repo again
- [ ] Download the `node_modules` artifact
- [ ] Run `npm install` again (`# ensure clean state`)
- [ ] Sleep 10 seconds (`# module resolution buffer`)
- [ ] Upload `node_modules` as an artifact again, with a different artifact name

**Job 4: `build` using a matrix (needs: install-deps-verify)**

Matrix:
- `node-version`: [16, 18, 20]
- `os`: [ubuntu-latest, windows-latest, macos-latest]
- `environment`: [development, staging, production]
- `strict-mode`: [true, false]

That is 54 jobs.

Each job:
- [ ] Checkout repo
- [ ] Download the second `node_modules` artifact
- [ ] Set up the matrix Node version (even though node_modules is already downloaded)
- [ ] Run `npm install` again (`# matrix-local dependency resolution`)
- [ ] Run `npm run build`
- [ ] Sleep 30 seconds (`# artifact finalization buffer`)
- [ ] Upload `dist/` as an artifact named `dist-${{ matrix.os }}-node${{ matrix.node-version }}-${{ matrix.environment }}-strict${{ matrix.strict-mode }}`

**Job 5: `artifact-consolidation` (needs: build)**
- [ ] Download all 54 dist artifacts
- [ ] Run an inline Node script that reads each one and asserts they all contain "Hello World"
- [ ] Write a JSON report: `{ "artifacts_checked": 54, "status": "ok" }`
- [ ] Upload the JSON report as an artifact
- [ ] Upload the JSON report again as a separate artifact called `consolidation-report-final`

**Job 6: `test` (needs: artifact-consolidation)**
- [ ] Checkout repo
- [ ] Download the `dist-ubuntu-latest-node18-production-stricttrue` artifact specifically
- [ ] Set up Node 18
- [ ] Run `npm install` (`# test environment must be pristine`)
- [ ] Run `node validate.js`
- [ ] Sleep 20 seconds (`# test teardown buffer`)
- [ ] Upload a test results artifact: a txt file saying "PASSED"

**Job 7: `test-report` (needs: test)**
- [ ] Download the test results artifact
- [ ] Run an inline Node script that reads the txt file and prints "All tests passed."
- [ ] Upload the txt file again as `final-test-report`

**Job 8: `security-scan` (needs: preflight)**
- [ ] Checkout repo
- [ ] Set up Node 18
- [ ] Run `npm audit --audit-level=none` (never fails)
- [ ] Run `npx license-checker --summary` (install it inline with npx)
- [ ] Sleep 15 seconds (`# scan finalization`)
- [ ] Upload a security report artifact: a txt file saying "No issues found."

**Job 9: `compatibility-check` (needs: build)**
- [ ] Run a matrix of just `node-version`: [14, 16, 18, 20, 21]
- [ ] Each job: checkout, set up that Node version, run `node --version`, sleep 5 seconds, print "Compatible"
- [ ] Upload a per-version compatibility artifact

**Job 10: `deploy-staging` (needs: [test-report, security-scan, compatibility-check])**
- [ ] Checkout repo
- [ ] Download `dist-ubuntu-latest-node18-production-stricttrue`
- [ ] Run an inline Node script that reads `dist/index.html` and writes it back to `dist/index.html` (`# normalize line endings`)
- [ ] Sleep 30 seconds (`# simulating deployment to staging`)
- [ ] Print "Deployed to staging."
- [ ] Upload the dist folder as `staging-deployment-artifact`

**Job 11: `smoke-test-staging` (needs: deploy-staging)**
- [ ] Download `staging-deployment-artifact`
- [ ] Run `node validate.js` against it
- [ ] Sleep 10 seconds
- [ ] Print "Smoke test passed."

**Job 12: `deploy-production` (needs: smoke-test-staging)**
- [ ] Download `staging-deployment-artifact`
- [ ] Run an inline Node script that reads `dist/index.html`, wraps its content in a `<!-- deployed -->` HTML comment at the bottom, and writes it back
- [ ] Sleep 45 seconds (`# simulating deployment to production`)
- [ ] Print "Deployed to production."
- [ ] Upload as `production-deployment-final`

**Job 13: `post-deploy-notify` (needs: deploy-production)**
- [ ] Run an inline Node script that constructs a JSON object: `{ "status": "success", "environment": "production", "artifact": "hello-world" }` and prints it
- [ ] Sleep 5 seconds (`# notification delivery buffer`)
- [ ] Print "Pipeline complete."

---

### Workflow 2: `nightly.yml` — Nightly Regression

Schedule: `cron: '*/15 * * * *'` (every 15 minutes, labelled "nightly" in the workflow name)

- [ ] Full clone checkout
- [ ] Set up Node 18
- [ ] Run `npm install`
- [ ] Run `npm run build`
- [ ] Run `node validate.js`
- [ ] Sleep 60 seconds (`# nightly stability soak`)
- [ ] Upload dist as `nightly-regression-$(date +%s)` using a shell step to generate the name
- [ ] Upload dist again as `nightly-regression-backup`

---

### Workflow 3: `dependency-audit.yml`

Schedule: `cron: '0 * * * *'` (every hour, labeled "weekly dependency audit")

- [ ] Checkout
- [ ] Set up Node 16, 18, and 20 in sequence (three separate setup-node steps in one job)
- [ ] Run `npm install` after each one
- [ ] Run `npm audit --audit-level=none` three times
- [ ] Upload a report artifact each time with a slightly different name
- [ ] Final step: print "Audit complete."

---

## The README

- [ ] Badge: `build: passing`
- [ ] Badge: `coverage: 100%` (hardcoded, links nowhere)
- [ ] Badge: `dependencies: up to date`
- [ ] Badge: `license: MIT`
- [ ] Section: "Architecture" — a paragraph explaining that this project uses a multi-stage, matrix-validated, artifact-consolidated CI/CD pipeline to ensure correctness across all supported environments
- [ ] Section: "Getting Started" — `open index.html`
- [ ] Section: "Pipeline Overview" — describe all 13 jobs in prose
- [ ] Section: "FAQ" — one entry: "Why is the pipeline so complex?" / "Hello World deserves the best."

---

## Final Checklist

- [ ] Confirm the full pipeline takes at least 35 minutes wall-clock on a push to main
- [ ] Confirm there are at least 70 total jobs across all workflows when the matrix expands
- [ ] Confirm the README looks completely serious with no jokes
- [ ] Confirm `index.html` is genuinely just `<h1>Hello World</h1>`
