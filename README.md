---
ctime: 2026-10-04
mtime: 2026-11-29
spdx: GPL-3.0-only
title: shared-config
description: >-
  Personalised tooling configuration for `chewygumxx` repositories, published to npm such
  that update cascades predictably.
tags:
  - npm
  - config
  - monorepo
---

<!--
   -
   - ~chewygumxx/shared-config.git
   - ::: :/README.md
   -
   -->

# shared-config

Personalised tooling configuration for `chewygumxx` repositories, published to
npm such that updates cascade predictably.

| Package                                                                           | Configures <!-- TODO: These should simply be npm package references --> |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [`@chewygumxx/commitlint-config`](packages/commitlint-config)                     | commitlint rules and the commitizen prompt                              |
| [`@chewygumxx/cz-commitlint`](packages/cz-commitlint)                             | commitizen adapter labelling choices by title                           |
| [`@chewygumxx/biome-config`](packages/biome-config)                               | Biome formatting, linting and import sorting                            |
| [`@chewygumxx/tsconfig`](packages/tsconfig)                                       | strict, type-check-only TypeScript base                                 |
| [`@chewygumxx/prettier-config`](packages/prettier-config)                         | prettier options that agree with Biome                                  |
| [`@chewygumxx/remark-preset`](packages/remark-preset)                             | remark-lint rules for Markdown, no em dashes                            |
| [`@chewygumxx/markdownlint-cli2-config`](packages/markdownlint-cli2-config)       | markdownlint rules that agree with remark                               |
| [`@chewygumxx/yamllint-config`](packages/yamllint-config)                         | yamllint rules that agree with prettier                                 |
| [`@chewygumxx/cspell-config`](packages/cspell-config)                             | CSpell settings and the house word list                                 |
| [`@chewygumxx/secretlint-rule-preset`](packages/secretlint-rule-preset)           | secretlint rules for credentials, `.env`, home paths                    |
| [`@chewygumxx/shellcheck-config`](packages/shellcheck-config)                     | ShellCheck's optional checks that catch mistakes                        |
| [`@chewygumxx/editorconfig-checker-config`](packages/editorconfig-checker-config) | editorconfig-checker without the indent size check                      |
| [`@chewygumxx/actionlint-config`](packages/actionlint-config)                     | actionlint without create-github-app-token's false reports              |
| [`@chewygumxx/tombi-config`](packages/tombi-config)                               | Tombi formatting and linting for TOML                                   |
| [`@chewygumxx/hk-config`](packages/hk-config)                                     | hk steps that lint and format, imported by `hk.pkl`                     |
| [`@chewygumxx/mise-tasks-config`](packages/mise-tasks-config)                     | `cgxx:` mise task templates that hand work to hk                        |

`bun create @chewygumxx/repo` is the
[repository scaffolder](packages/create-repo). Its templates utilise the
published packages of this monorepository.

## Development

This repository uses its own packages through Bun workspaces. Run the
following from the repository root to install the tools, dependencies and
Git hooks and check your changes.

```sh
mise trust
mise install
mise run lint
```

`mise run lint` checks changed files and `mise run format` applies fixes
without staging them. Both run hk quietly and report warnings and failures.
Add `--verbose` for hk debug output.

Pre-commit checks staged changes. CI runs the full test suite, package
checks and checks on the composed templates. Run `mise run check --all`
when you need the full check locally.

## Releases

Release Please proposes workspace version and lockfile updates together.
After the proposal merges, CI verifies the npm tarballs and Publish sends
those same tarballs to npm. Refresh Template Pins then verifies updated
template dependencies and opens a separate PR for the scaffolder.

See the [maintainer runbook](MAINTAINERS.md) for focused checks, release
status, CI rehearsal and recovery.

<!-- vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3: -->
