---
ctime: 2026-11-20
mtime: 2026-11-29
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

The `cgxx:` [mise](https://mise.jdx.dev) templates define standard tasks
for chewygumxx repositories. The `lint` and `format` tasks run
[hk](https://hk.jdx.dev) with the steps of
[`@chewygumxx/hk-config`](../hk-config).

| Template | Aliases | Runs |
| --- | --- | --- |
| `cgxx:install` | `i` | `bun ci` |
| `cgxx:install:vendir` | `vendir` | `vendir sync` using `.config/vendir.yml` |
| `cgxx:lint` | `l` | hk's check hook |
| `cgxx:format` | `f`, `fmt` | hk's fix hook, leaving fixes unstaged |
| `cgxx:test` | `t` | `bun test` |
| `cgxx:check` | `c` | `lint` and `test` |
| `cgxx:commit:lint` | | commitlint on a commit message file |
| `cgxx:commit` | `cm`, `cz`, `czg` | Commitizen with the cz-git adapter |
| `cgxx:act` | | The shared remote act task |

Lint and format select changed files by default. `check` passes its file
selection to lint and also runs the tests. Use `--staged` to select staged
files or `--all` to include every file Git tracks or leaves unignored. Use
`--step <name>` with lint or format to run one hk step. Every selected step
runs even if another fails.

Lint and format run hk quietly by default, with warnings and failure
diagnostics visible. Pass `--verbose` to either task for hk debug output.

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

The task templates load after `bun ci` installs the packages. Add this
hook to `.config/mise/config.toml` to install dependencies and Git hooks
when running `mise install` locally.

```toml
[[hooks.postinstall]]
run = 'test -n "${CI-}" || { bun ci && hk install --mise; }'
```

In CI, run `mise exec -- bun ci` after `mise install`.

## Extending

A task overrides whatever it sets itself, keeping the rest of its template.
Widen on more paths for every task through mise's environment:

```toml
[env]
CGXX_WIDEN_ON = "bun.lock .config packages"
```

<!-- vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3: -->
