---
__cgxx: |
  # vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3:
  # SPDX-License-Identifier: GPL-3.0-only

  #
  #
  # ~chewygumxx/shared-config.git
  # ::: :/README.md
  #
  #

ctime: 2026-10-04
title: shared-config
description: Repository README.md
tags:
  - npm
  - config
---

# shared-config

Shared tooling configuration for `chewygumxx` repositories, published to npm so
that each repository's local hooks and its CI apply the same rules.

| Package                                                                           | Configures                                           |
| --------------------------------------------------------------------------------- | ---------------------------------------------------- |
| [`@chewygumxx/commitlint-config`](packages/commitlint-config)                     | commitlint rules and the commitizen prompt           |
| [`@chewygumxx/cz-commitlint`](packages/cz-commitlint)                             | commitizen adapter labelling choices by title        |
| [`@chewygumxx/biome-config`](packages/biome-config)                               | Biome formatting, linting and import sorting         |
| [`@chewygumxx/tsconfig`](packages/tsconfig)                                       | strict, type-check-only TypeScript base              |
| [`@chewygumxx/prettier-config`](packages/prettier-config)                         | prettier options that agree with Biome               |
| [`@chewygumxx/remark-preset`](packages/remark-preset)                             | remark-lint rules for Markdown, no em dashes         |
| [`@chewygumxx/markdownlint-cli2-config`](packages/markdownlint-cli2-config)       | markdownlint rules that agree with remark            |
| [`@chewygumxx/yamllint-config`](packages/yamllint-config)                         | yamllint rules that agree with prettier              |
| [`@chewygumxx/cspell-config`](packages/cspell-config)                             | CSpell settings and the house word list              |
| [`@chewygumxx/secretlint-rule-preset`](packages/secretlint-rule-preset)           | secretlint rules for credentials, `.env`, home paths |
| [`@chewygumxx/shellcheck-config`](packages/shellcheck-config)                     | ShellCheck's optional checks that catch mistakes     |
| [`@chewygumxx/editorconfig-checker-config`](packages/editorconfig-checker-config) | editorconfig-checker without the indent size check   |

`bun create @chewygumxx/repo` lives in its own repository,
[`chewygumxx/create-repo`](https://github.com/chewygumxx/create-repo).

Shared CI lives in
[`chewygumxx/.github`](https://github.com/chewygumxx/.github); new repositories
start from [`chewygumxx/repo-tmpl`](https://github.com/chewygumxx/repo-tmpl),
which consumes these packages.

## Development

This repository consumes its own packages through Bun workspaces, so every
change is exercised here before it is published.

```sh
mise install
bun install
bun run check
```

mise pins the tools that are not npm packages, at the versions the shared CI
runs: yamllint, tombi, ShellCheck, shfmt, editorconfig-checker and
actionlint. `bun run check` also lints each package's manifest with publint
and, for those with types, attw, and finds unused dependencies with knip.

## Publishing

Each package is versioned independently. Bump its `version`, commit, and push a
tag named `<package>@<version>`, such as `biome-config@1.1.0`; the publish
workflow stages that package with provenance. Approve the staged version on
npmjs.com to release it.
