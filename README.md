# web-systems-lab

[![CI](https://github.com/arabi-1/web-systems-lab/actions/workflows/ci.yml/badge.svg)](https://github.com/arabi-1/web-systems-lab/actions/workflows/ci.yml)

Coursework for **CSC337 Advanced Web Technologies** (COMSATS University Islamabad), built as a small engineering system rather than a folder of assignments: one package per lab, shared lint and format config, CI on every change, and a PR-only `main`.

## Labs

| Lab                                                               | Topic                                 | Stack                               | Status  |
| ----------------------------------------------------------------- | ------------------------------------- | ----------------------------------- | ------- |
| [lab01_service-request-server](labs/lab01_service-request-server) | Service request server, no frameworks | Node.js core (http, fs), JSON store | Planned |

## Repository layout

- `labs/labNN_topic/` is one independent package per lab, with its own `package.json`, README, tests and `.env.example`. There are no npm workspaces, so heavy Angular and React installs stay isolated.
- Root `eslint.config.js` and `.prettierrc.json` are shared, TypeScript-aware config.
- `.nvmrc` and `engines` pin the Node version (24 for development, 22 and 24 in CI).

## Engineering workflow

- `main` is protected: pull requests only, squash merge only, and the `lint-test (22)` and `lint-test (24)` checks must pass.
- One feature branch and one PR per task, with Conventional Commit titles, so `main` gets one clean commit per task.
- CI runs lint, then the format check, then tests, and tests only the labs that changed.
- Husky and lint-staged run ESLint and Prettier on staged files before every commit.
- Tool versions are pinned exactly and installed with `npm ci`. Dependabot opens weekly update PRs.
- Secrets never enter the repo: `.env` is gitignored and each lab ships a `.env.example`.

## Running a lab

Each lab is self-contained. From the repo root:

    cd labs/<lab-folder>
    npm ci
    npm test

See each lab's README for its own setup and run instructions.
