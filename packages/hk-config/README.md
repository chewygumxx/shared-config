---
ctime: 2026-11-20
mtime: 2026-11-20
spdx: GPL-3.0-only
title: "@chewygumxx/hk-config"
description: >-
  Shared hk steps that lint and format chewygumxx repositories, for hk.pkl to
  import from node_modules.
tags:
  - npm
  - config
  - hk
  - lint
---

<!--
   -
   - ~chewygumxx/shared-config.git
   - ::: :/packages/hk-config/README.md
   -
   -->

# @chewygumxx/hk-config

The [hk](https://hk.jdx.dev) steps every chewygumxx repository lints and
formats with, in one Pkl file. hk selects the files each step runs on
(changed, staged, or every file git does not ignore), stashes unstaged edits
in hooks, and skips a step whose files and configuration have not changed
since it last passed.

| Step                | Checks                                     | Fixes |
| ------------------- | ------------------------------------------ | ----- |
| `actionlint`        | GitHub workflows                           |       |
| `biome`             | Biome's languages, formatting included     | yes   |
| `cspell`            | Spelling                                   |       |
| `editorconfig`      | `.editorconfig`                            |       |
| `emdash`            | No em dash (U+2014)                        |       |
| `markdownlint`      | Markdown                                   | yes   |
| `prettier`          | YAML formatting                            | yes   |
| `remark`            | Markdown, with the remark preset           |       |
| `secretlint`        | Secrets                                    |       |
| `shellcheck`        | Shell scripts                              |       |
| `shfmt`             | Shell formatting                           | yes   |
| `tombi`             | TOML, formatting included                  | yes   |
| `yamllint`          | YAML                                       |       |
| `headers`           | Each file's repository and path header     | yes   |
| `knip`              | Unused files and dependencies              |       |
| `packages`          | publint, and attw for typed packages       |       |
| `sort_package_json` | `package.json` key order                   | yes   |
| `tsc`               | Types                                      |       |

The last five check the whole project on every run. The rest take the
selected files. `lint` maps every step and `format` every step that fixes.

## Usage

Install the package, and each CLI the steps you use run. The npm ones are
optional peer dependencies, run with `bun run`; pin the rest with mise:

```sh
bun add --dev --exact @chewygumxx/hk-config
mise use aqua:jdx/hk@2.13.0 aqua:koalaman/shellcheck aqua:mvdan/sh
```

Import the steps into `.config/hk.pkl`, amending the hk configuration at the
version they are written for:

```pkl
amends "package://github.com/jdx/hk/releases/download/v2.13.0/hk@2.13.0#/Config.pkl"

import "../node_modules/@chewygumxx/hk-config/steps.pkl" as cgxx

hooks {
    ["check"] { steps = cgxx.lint }
    ["fix"] {
        stage = false
        steps = cgxx.format
    }
}
```

Steps read their configuration from the other `@chewygumxx` packages in
`node_modules`, and from `.config/prettierrc.json` and
`.config/remarkrc.json`.

`hk.pkl` cannot be read until the package is installed, so install it before
the hooks, as with mise's `postinstall = [ "bun ci", "hk install --mise" ]`.

## Extending

Pick steps one by one rather than all of them:

```pkl
["check"] {
    steps {
        ["biome"] = cgxx.biome
        ["tombi"] = cgxx.tombi
    }
}
```

Amend a mapping to change a step or add one of your own:

```pkl
steps = (cgxx.lint) {
    ["packages"] { check = "bun run cgxx-lint-packages packages/*/" }
    ["mine"] { check = "./scripts/check-mine" }
}
```

A step's cache keys on its files, its configuration, `bun.lock` and
`.config/mise/config.toml`. Add inputs for every step by amending the module:

```pkl
local cgxx = (import("../node_modules/@chewygumxx/hk-config/steps.pkl")) {
    extraInputs = List("vendor/**")
}
```

<!-- vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3: -->
