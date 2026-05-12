![build: passing](https://img.shields.io/badge/build-passing-brightgreen)
![coverage: 100%](https://img.shields.io/badge/coverage-100%25-brightgreen)
![dependencies: up to date](https://img.shields.io/badge/dependencies-up%20to%20date-brightgreen)
![license: MIT](https://img.shields.io/badge/license-MIT-blue)
![docker: scanned](https://img.shields.io/badge/docker-scanned-blue)
![pages: deployed](https://img.shields.io/badge/pages-deployed-brightgreen)
![jquery: included](https://img.shields.io/badge/jquery-included-orange)
![npm packages: 575](https://img.shields.io/badge/npm%20packages-575-red)

# gitnub

please don't tell my mother about this

A cursed CI/CD pipeline so catastrophically over-engineered that engineers will share it in horror. Deploys a static HTML page that says "Hello World".

![Legal Review](Screenshot%202026-05-11%20at%208.12.42%E2%80%AFPM.png)

## Architecture

This project employs a multi-stage, matrix-validated, artifact-consolidated, Docker-containerized, Trivy-scanned, GitHub Pages-deployed CI/CD pipeline to ensure correctness across all supported environments. The build output is verified independently across 3 Node.js versions, 3 operating systems, 3 deployment environments, and 2 strict-mode configurations, producing 54 individually validated artifacts per commit. Each artifact undergoes consolidation, testing, security scanning, cross-version compatibility verification, container smoke testing, staging deployment, staging smoke testing, and finally production promotion through a fully automated 17-job workflow.

The application itself consists of a single `<h1>` tag. It requires 575 npm packages, an 8-stage Dockerfile, a custom HTML type system, and a webpack bundler that bundles nothing.

## Getting Started

```
open index.html
```

## Build Tooling

The build pipeline runs seven phases of analysis before producing output:

1. **Linting** — A custom 7-phase HTML linter performs character-by-character analysis (with synthetic CPU load), tag balance verification, whitespace auditing, security pattern scanning, accessibility pre-checks, cyclomatic complexity computation of HTML, and three passes of O(n²) deep semantic analysis with hash computation.

2. **Type Checking** — A hand-rolled HTML Type System (v0.1.0-alpha.3) tokenizes the document, performs type inference against 35 element definitions covering the full HTML spec, generates and solves type constraints, and validates each element against its schema.

3. **Building** — A Node.js script copies `index.html` to `dist/`. This is the build.

4. **Bundling** — Webpack processes `stub.js` (a single comment) through Babel with the full `@babel/preset-env` configuration, producing `bundle.js` and a minified copy of the HTML that was already in `dist/`.

5. **Analysis** — The build artifact analyzer computes MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes, performs Shannon entropy analysis, estimates compression ratios via run-length encoding, calculates DOM complexity metrics, runs a performance budget check, and generates a JSON build manifest.

6. **Validation** — Reads `dist/index.html` and asserts it contains the string "Hello World". This is the test suite.

7. **Formatting** — Prettier is configured. There is nothing to format.

## Dependencies

575 npm packages including Express, Mongoose, Redis, Sequelize, Socket.io, bcrypt, jsonwebtoken, jQuery, lodash, moment, axios, winston, RxJS, `is-odd`, `is-even`, and `left-pad`. None of them are used.

## Docker

An 8-stage Dockerfile installs Python, Git, wget, and build-essential to ultimately serve one HTML file through nginx. The image includes a health check that polls itself every 30 seconds to make sure it's still serving Hello World.

## Pipeline Overview

The main CI workflow consists of 17 sequential and parallel jobs that execute on every push, pull request, and manual dispatch:

1. **YAML Lint** validates all workflow files with yamllint and actionlint before anything else runs.

2. **Preflight** performs a full repository clone, prints diagnostic information about the runner environment, executes a 15-second stabilization delay, and uploads a preflight status report artifact.

3. **Install Dependencies** checks out a fresh copy of the repository, downloads the preflight report, sets up Node.js 18, runs `npm install` for 575 packages, and uploads the entire `node_modules` directory as an artifact for downstream jobs.

4. **Install Dependencies Verify** downloads the previously uploaded `node_modules`, runs `npm install` again to ensure a clean state, waits 10 seconds for module resolution to stabilize, and re-uploads `node_modules` under a new artifact name.

5. **Code Quality** downloads the verified `node_modules`, runs the 7-phase HTML linter and the HTML Type System, waits 10 seconds for lint result stabilization, and uploads a quality report.

6. **Build** runs a 54-job matrix across all combinations of Node.js versions (16, 18, 20), operating systems (Ubuntu, Windows, macOS), environments (development, staging, production), and strict-mode flags (true, false). Each job downloads the verified `node_modules`, reinstalls dependencies locally, executes the build, waits 30 seconds for artifact finalization, and uploads its output with a unique identifier.

7. **Artifact Consolidation** downloads all 54 build artifacts, validates that each one contains "Hello World", generates a JSON status report, and uploads it twice under separate artifact names for redundancy.

8. **Test** downloads the canonical production build artifact, sets up a pristine test environment with a fresh `npm install`, runs the validation suite and the build artifact analyzer, waits 20 seconds for test teardown, and uploads the results.

9. **Test Report** downloads the test results, runs an inline script to confirm the outcome, and re-uploads the results as the final test report.

10. **Security Scan** runs in parallel with the main build pipeline, performing an npm audit with no failure threshold and a license compatibility check via `license-checker`, followed by a 15-second scan finalization period.

11. **Docker Build** builds the 8-stage Docker image using BuildKit with GitHub Actions cache, saves it as a tarball, and uploads it as an artifact.

12. **Docker Security Scan** loads the Docker image, runs Trivy vulnerability scanning across all severity levels, generates a CycloneDX SBOM, and uploads it.

13. **Docker Smoke Test** loads the Docker image, starts a container, waits 10 seconds for startup, curls localhost to verify "Hello World" is served, and tears down the container.

14. **Compatibility Check** verifies the project against Node.js versions 14, 16, 18, 20, and 21, running `node --version` on each and uploading per-version compatibility reports.

15. **Deploy Staging** gates on the test report, security scan, compatibility check, and Docker smoke test all completing successfully. It downloads the canonical build artifact, normalizes line endings via an inline Node.js script, simulates a 30-second deployment, and uploads the staging artifact.

16. **Smoke Test Staging** downloads the staging deployment artifact and runs the validation suite against it, followed by a 10-second observation period.

17. **Deploy Production** downloads the staging artifact, appends a `<!-- deployed -->` HTML comment, simulates a 45-second production deployment, and uploads the final production artifact.

18. **Deploy Pages** deploys the production artifact to GitHub Pages so the world can see Hello World.

19. **Post-Deploy Notify** constructs and prints a JSON notification payload confirming successful production deployment and pages deployment, waits 5 seconds for notification delivery, and prints the pipeline completion message.

Additionally, a **Nightly Regression** workflow runs every 15 minutes to perform a full build-and-validate cycle with a 60-second stability soak, and a **Weekly Dependency Audit** workflow runs every hour to audit dependencies across three Node.js versions sequentially.

## FAQ

**Why is the pipeline so complex?**

Hello World deserves the best.

**Why jQuery?**

You never know.

**How many npm packages does this need?**

575, at time of writing. We expect this number to grow as the project matures.

**Does the Docker health check actually do anything?**

Yes. Every 30 seconds it confirms nginx is still serving Hello World. If it ever stops, the container restarts. This has never happened.
