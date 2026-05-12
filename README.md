![build: passing](https://img.shields.io/badge/build-passing-brightgreen)
![coverage: 100%](https://img.shields.io/badge/coverage-100%25-brightgreen)
![dependencies: up to date](https://img.shields.io/badge/dependencies-up%20to%20date-brightgreen)
![license: MIT](https://img.shields.io/badge/license-MIT-blue)

# cursed-ci

A static HTML page that says "Hello World", deployed via a rigorous, enterprise-grade CI/CD pipeline.

![Legal Review](Screenshot%202026-05-11%20at%208.12.42%20PM.png)

## Architecture

This project employs a multi-stage, matrix-validated, artifact-consolidated CI/CD pipeline to ensure correctness across all supported environments. The build output is verified independently across 3 Node.js versions, 3 operating systems, 3 deployment environments, and 2 strict-mode configurations, producing 54 individually validated artifacts per commit. Each artifact is consolidated, tested, scanned for security vulnerabilities, checked for cross-version compatibility, deployed to staging, smoke tested, and finally promoted to production through a fully automated 13-job workflow.

## Getting Started

```
open index.html
```

## Pipeline Overview

The main CI workflow consists of 13 sequential and parallel jobs that execute on every push, pull request, and manual dispatch:

1. **Preflight** performs a full repository clone, prints diagnostic information about the runner environment, executes a 15-second stabilization delay, and uploads a preflight status report artifact.

2. **Install Dependencies** checks out a fresh copy of the repository, downloads the preflight report, sets up Node.js 18, runs `npm install`, and uploads the entire `node_modules` directory as an artifact for downstream jobs.

3. **Install Dependencies Verify** downloads the previously uploaded `node_modules`, runs `npm install` again to ensure a clean state, waits 10 seconds for module resolution to stabilize, and re-uploads `node_modules` under a new artifact name.

4. **Build** runs a 54-job matrix across all combinations of Node.js versions (16, 18, 20), operating systems (Ubuntu, Windows, macOS), environments (development, staging, production), and strict-mode flags (true, false). Each job downloads the verified `node_modules`, reinstalls dependencies locally, executes the build, waits 30 seconds for artifact finalization, and uploads its output with a unique identifier.

5. **Artifact Consolidation** downloads all 54 build artifacts, validates that each one contains the expected output, generates a JSON status report, and uploads it twice under separate artifact names for redundancy.

6. **Test** downloads the canonical production build artifact, sets up a pristine test environment with a fresh `npm install`, runs the validation suite, waits 20 seconds for test teardown, and uploads the results.

7. **Test Report** downloads the test results, runs an inline script to confirm the outcome, and re-uploads the results as the final test report.

8. **Security Scan** runs in parallel with the main build pipeline, performing an npm audit with no failure threshold and a license compatibility check via `license-checker`, followed by a 15-second scan finalization period.

9. **Compatibility Check** verifies the project against Node.js versions 14, 16, 18, 20, and 21, running `node --version` on each and uploading per-version compatibility reports.

10. **Deploy Staging** gates on the test report, security scan, and compatibility check completing successfully. It downloads the canonical build artifact, normalizes line endings via an inline Node.js script, simulates a 30-second deployment, and uploads the staging artifact.

11. **Smoke Test Staging** downloads the staging deployment artifact and runs the validation suite against it, followed by a 10-second observation period.

12. **Deploy Production** downloads the staging artifact, appends a deployment marker HTML comment, simulates a 45-second production deployment, and uploads the final production artifact.

13. **Post-Deploy Notify** constructs and prints a JSON notification payload confirming successful production deployment, waits 5 seconds for notification delivery, and prints the pipeline completion message.

Additionally, a **Nightly Regression** workflow runs every 15 minutes to perform a full build-and-validate cycle with a 60-second stability soak, and a **Weekly Dependency Audit** workflow runs every hour to audit dependencies across three Node.js versions sequentially.

## FAQ

**Why is the pipeline so complex?**

Hello World deserves the best.
