---
ctime: 2026-11-20
mtime: 2026-11-20
spdx: GPL-3.0-only
title: "@chewygumxx/mise-tasks-config"
description: >-
  Shared mise task templates for chewygumxx repositories, which hand linting
  and formatting to hk.
tags:
  - npm
  - config
  - mise
  - hk
---

<!--
   -
   - ~chewygumxx/shared-config.git
   - ::: :/packages/mise-tasks-config/README.md
   -
   -->

# @chewygumxx/mise-tasks-config

The `cgxx:` [mise](https://mise.jdx.dev) task templates behind every
chewygumxx repository's standard tasks. mise stays the one place to run
anything; the work goes to the tool made for it, `lint` and `format` to
[hk](https://hk.jdx.dev) with the steps of
[`@chewygumxx/hk-config`](../hk-config).

| Template           | Aliases     | Runs                                  |
| ------------------ | ----------- | ------------------------------------- |
| `cgxx:install`     | `i`         | `bun ci`                              |
| `cgxx:lint`        | `l`         | hk's check hook                       |
| `cgxx:format`      | `f`, `fmt`  | hk's fix hook, leaving fixes unstaged |
| `cgxx:test`        | `t`         | `bun test`                            |
| `cgxx:check`       | `c`         | `lint` and `test`                     |
| `cgxx:commit:lint` |             | commitlint on a commit message file   |
| `cgxx:commit`      | `cz`, `czg` | Commitizen with the cz-git adapter    |
| `cgxx:act`         |             | The shared remote act task            |

`lint`, `format` and `check` select changed files by default. Use `-s` or
`--staged` to select staged files and `--all` to include every file git does
not ignore. Use `-S <step>` with `lint` or `format` to run one hk step. Every
selected step runs even if another fails.

A change to a path in `$CGXX_WIDEN_ON`, by default `bun.lock`,
`.config/hk.pkl` and `.config/mise`, selects every file, as it can change the
result for any of them. Under `--staged`, only a staged change widens, and
to every file in the index, so untracked files stay out.

## Usage

```sh
bun add --dev --exact @chewygumxx/mise-tasks-config @chewygumxx/hk-config
mkdir -p .config/mise/conf.d
ln -s ../../../node_modules/@chewygumxx/mise-tasks-config/std.task.toml .config/mise/conf.d/50-cgxx-std.toml
ln -s ../../../node_modules/@chewygumxx/mise-tasks-config/validate.task.toml .config/mise/conf.d/60-cgxx-validate.toml
```

mise loads task templates through the links in `.config/mise/conf.d/` once
the package is installed. When upgrading from `tasks.toml`, replace its link
with the two above and update any `cgxx:lint:commit` reference to
`cgxx:commit:lint`. Extend a template for each task.

```toml
[install]
extends = "cgxx:install"

[lint]
extends = "cgxx:lint"

[format]
extends = "cgxx:format"

[test]
extends = "cgxx:test"

[check]
extends = "cgxx:check"
```

To use `cgxx:commit`, install `commitizen` and `cz-git` and set
`config.commitizen.path` in `package.json` to `./node_modules/cz-git`.
Install `@commitlint/cli` to use `cgxx:commit:lint`. Enable mise's
`experimental` setting if you use `cgxx:act`.

Until the package is installed no task loads, as each extends a template
that does not yet exist, so `mise install` installs the packages, then hk's
hooks, which read them. CI installs the packages itself, from a lockfile a
release may yet refresh:

```toml
[hooks]
postinstall = 'test -n "${CI-}" || { bun ci && hk install --mise; }'
```

## Extending

A task overrides whatever it sets itself, keeping the rest of its template.
Widen on more paths for every task through mise's environment:

```toml
[env]
CGXX_WIDEN_ON = "bun.lock .config packages"
```

<!-- vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3: -->
