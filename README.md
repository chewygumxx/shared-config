---
ctime: 2026-10-04
mtime: 2026-10-05
spdx: GPL-3.0-only
title: shared-config
description: >-
  Shared tooling configuration for chewygumxx repositories, published to npm so
  local hooks and CI apply the same rules.
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

Shared tooling configuration for `chewygumxx` repositories, published to npm so
that each repository's local hooks and its CI apply the same rules.

| Package                                                                           | Configures                                                 |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| [`@chewygumxx/commitlint-config`](packages/commitlint-config)                     | commitlint rules and the commitizen prompt                 |
| [`@chewygumxx/cz-commitlint`](packages/cz-commitlint)                             | commitizen adapter labelling choices by title              |
| [`@chewygumxx/biome-config`](packages/biome-config)                               | Biome formatting, linting and import sorting               |
| [`@chewygumxx/tsconfig`](packages/tsconfig)                                       | strict, type-check-only TypeScript base                    |
| [`@chewygumxx/prettier-config`](packages/prettier-config)                         | prettier options that agree with Biome                     |
| [`@chewygumxx/remark-preset`](packages/remark-preset)                             | remark-lint rules for Markdown, no em dashes               |
| [`@chewygumxx/markdownlint-cli2-config`](packages/markdownlint-cli2-config)       | markdownlint rules that agree with remark                  |
| [`@chewygumxx/yamllint-config`](packages/yamllint-config)                         | yamllint rules that agree with prettier                    |
| [`@chewygumxx/cspell-config`](packages/cspell-config)                             | CSpell settings and the house word list                    |
| [`@chewygumxx/secretlint-rule-preset`](packages/secretlint-rule-preset)           | secretlint rules for credentials, `.env`, home paths       |
| [`@chewygumxx/shellcheck-config`](packages/shellcheck-config)                     | ShellCheck's optional checks that catch mistakes           |
| [`@chewygumxx/editorconfig-checker-config`](packages/editorconfig-checker-config) | editorconfig-checker without the indent size check         |
| [`@chewygumxx/actionlint-config`](packages/actionlint-config)                     | actionlint without create-github-app-token's false reports |
| [`@chewygumxx/tombi-config`](packages/tombi-config)                               | Tombi formatting and linting for TOML                      |

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
mise run install
mise run check --all
```

`mise install` installs the toolchain and Git hooks. If this clone used Husky,
clear its old repository-local hook path before running `mise install`:

```sh
git config --local --unset core.hooksPath '^\.config/husky/_$'
```

`mise run check` and `mise run lint` select staged paths for file-based checks.
`mise run format` formats the working-tree copies of staged paths so you can
review and stage the changes. Pass `--all` to select all tracked paths. The
checks also run publint for each package, attw for packages with types, and
Knip for unused dependencies. Use `mise run test` to run the tests and
`mise run commit` to open the commitizen prompt. CI runs `bun run check`, which
delegates to `mise run check --all`.

## Publishing

Release Please reads conventional commits on `main` and opens a single
release pull request with independent versions for the affected packages. The
workflow refreshes `bun.lock`. If the refresh fails, run the **Release Please**
workflow manually on `main` to retry it.

Before merging the first release pull request, enable **Allow npm publish**
on the existing trusted publisher for each of the 14 packages listed above.
In the package's npm settings, select the publisher for
`chewygumxx/shared-config` and `publish.yaml`. This change requires a
maintainer to authenticate with 2FA. [npm trusted publishing][npm-trust]

Merging the release pull request approves publication. Release Please creates
a GitHub release with notes and a `<package>@<version>` tag for each package.
The **Publish** workflow checks the tagged commit and publishes that workspace
to npm with provenance. For the first release, check the GitHub release and
confirm the version and `dist.attestations` with `npm view <package>@<version>`.

[npm-trust]: https://docs.npmjs.com/trusted-publishers/

<!-- vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3: -->
