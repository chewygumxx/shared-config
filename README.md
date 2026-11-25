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
| [`@chewygumxx/hk-config`](packages/hk-config)                                     | hk steps that lint and format, imported by `hk.pkl`        |
| [`@chewygumxx/mise-tasks-config`](packages/mise-tasks-config)                     | `cgxx:` mise task templates that hand work to hk           |

`bun create @chewygumxx/repo` lives in its own repository,
[`chewygumxx/create-repo`](https://github.com/chewygumxx/create-repo).

Shared CI lives in
[`chewygumxx/.github`](https://github.com/chewygumxx/.github); new repositories
start from [`chewygumxx/repo-tmpl`](https://github.com/chewygumxx/repo-tmpl),
which consumes these packages.

## Development

This repository consumes its own packages through Bun workspaces, so every
change is exercised here before it is published. mise is the switchboard: it
pins the tools and names the tasks, and hands each task to the tool for it.

```sh
mise install
mise run check --all
```

`mise install` installs the toolchain, then the packages, then the Git hooks,
which read the packages. If this clone used Husky, clear its old
repository-local hook path before running `mise install`:

```sh
git config --local --unset core.hooksPath '^\.config/husky/_$'
```

The tasks extend the `cgxx:` templates of
[`@chewygumxx/mise-tasks-config`](packages/mise-tasks-config). `mise run lint`
and `mise run format` run hk's check and fix hooks, whose steps come from
[`@chewygumxx/hk-config`](packages/hk-config) in `.config/hk.pkl`. Both act on
the changed files, staged, unstaged and untracked; pass `--staged` for the
staged files alone, `--all` for every file git does not ignore, and `-S <step>`
for one hk step. A change to `bun.lock`, `.config` or `packages` selects every
file, and hk skips a step whose inputs have not changed since it last passed.
`mise run format` leaves its fixes unstaged for you to review.

The pre-commit hook runs `mise run check --staged` on the staged contents and
restores unstaged edits. Stage your changes and run `mise run commit` or
`bun run commit` to open the cz-git prompt. The prompt reads the repository's
commitlint configuration, including its types, scopes and message length limits.
Use `mise run test` to run the tests and `mise run act` to run CI locally.
CI runs `bun run check`, which delegates to `mise run check --all`.

## Publishing

Release Please reads conventional commits on `main` and opens a single
release pull request with independent versions for the affected packages. The
workflow refreshes `bun.lock`. If the refresh fails, run the **Release Please**
workflow manually on `main` to retry it.

Before merging the first release pull request, enable **Allow npm publish**
on the existing trusted publisher for each of the first 14 packages listed
above. In the package's npm settings, select the publisher for
`chewygumxx/shared-config` and `publish.yaml`. This change requires a
maintainer to authenticate with 2FA. [npm trusted publishing][npm-trust]

A trusted publisher can be added only to a package that exists, so
`@chewygumxx/hk-config` and `@chewygumxx/mise-tasks-config` are first
published by hand, then given their trusted publisher like the rest.

Merging the release pull request approves publication. Release Please creates
a GitHub release with notes and a `<package>@<version>` tag for each package.
The **Publish** workflow checks the tagged commit and publishes that workspace
to npm with provenance. For the first release, check the GitHub release and
confirm the version and provenance with
`npm view <package>@<version> version dist.attestations`.

[npm-trust]: https://docs.npmjs.com/trusted-publishers/

<!-- vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3: -->
