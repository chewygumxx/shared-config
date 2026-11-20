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

| Template           | Alias | Runs                                       |
| ------------------ | ----- | ------------------------------------------ |
| `cgxx:install`     | `i`   | `bun ci`                                   |
| `cgxx:lint`        | `l`   | hk's check hook                            |
| `cgxx:format`      | `f`   | hk's fix hook, leaving fixes unstaged      |
| `cgxx:test`        | `t`   | Nothing until the repository gives `run`   |
| `cgxx:check`       | `c`   | `lint` and `test`                          |
| `cgxx:lint:commit` |       | commitlint on a commit message file        |
| `cgxx:commit`      |       | The commitizen prompt                      |
| `cgxx:act`         |       | The repository's hidden `act-cached` task  |

`lint`, `format` and `check` act on the changed files: staged, unstaged and
untracked. `--staged` selects the staged files alone and `--all` every file
git does not ignore. `lint` and `format` take `-S <step>` to run one hk step.
Every step runs, however many fail.

A change to a path in `$CGXX_WIDEN_ON`, by default `bun.lock`,
`.config/hk.pkl` and `.config/mise`, selects every file, as it can change the
result for any of them.

## Usage

```sh
bun add --dev --exact @chewygumxx/mise-tasks-config @chewygumxx/hk-config
mkdir -p .config/mise/conf.d
ln -s ../../../node_modules/@chewygumxx/mise-tasks-config/tasks.toml .config/mise/conf.d/50-cgxx.toml
```

mise reads templates from a configuration file, not an included task file,
hence the link, which mise ignores until the package is installed. Then
extend a template for each task:

```toml
[install]
extends = "cgxx:install"

[lint]
extends = "cgxx:lint"

[format]
extends = "cgxx:format"

[test]
extends = "cgxx:test"
run     = "bun test"

[check]
extends = "cgxx:check"
```

Install the packages before hk's hooks, which read them:

```toml
[hooks]
postinstall = [ "bun ci", "hk install --mise" ]
```

## Extending

A task overrides whatever it sets itself, keeping the rest of its template.
Widen on more paths for every task through mise's environment:

```toml
[env]
CGXX_WIDEN_ON = "bun.lock .config packages"
```

<!-- vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3: -->
