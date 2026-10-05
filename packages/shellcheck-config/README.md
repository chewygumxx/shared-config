---
ctime: 2026-10-05
mtime: 2026-10-05
spdx: GPL-3.0-only
title: "@chewygumxx/shellcheck-config"
description: >-
  ShellCheck's default checks plus the optional ones that catch mistakes rather
  than enforce a style.
tags:
  - npm
  - config
  - shellcheck
  - shell
---

<!--
   -
   - ~chewygumxx/shared-config.git
   - ::: :/packages/shellcheck-config/README.md
   -
   -->

# @chewygumxx/shellcheck-config

Every check ShellCheck runs by default, plus the optional checks that catch
mistakes rather than enforce a style:

- `[[ ]]` over `[ ]` in bash and ksh
- a `case` without a default branch
- `[ "$var" ]` without `-n`
- exit codes masked by command substitutions and pipelines, beyond the
  default checks
- uppercase variables used but never assigned
- `which`, and unquoted variables that only look safe.

Sourced files are followed, and found relative to the script that sources
them.

## Usage

ShellCheck is not an npm package; pin it with mise beside this one:

```sh
mise use aqua:koalaman/shellcheck@0.11.0
bun add --dev @chewygumxx/shellcheck-config
```

ShellCheck reads no `extends`, so name the file with `--rcfile`. Pass tracked
shell scripts only; `shfmt -f` finds them by extension or shebang:

```json
{
  "scripts": {
    "lint:sh": "git ls-files -z | xargs -0 -r shfmt -f | tr '\\n' '\\0' | xargs -0 -r shellcheck --rcfile node_modules/@chewygumxx/shellcheck-config/config.shellcheckrc"
  }
}
```

> [!NOTE]
> The shared CI's shell job runs ShellCheck without installing the
> repository's packages, so it applies only the default checks unless the
> repository keeps a `.shellcheckrc` of its own.

## Extending

ShellCheck reads one file, so a repository that wants the house style with
changes copies this one to its own `.shellcheckrc` and edits it, or adds
`# shellcheck disable=SC2034` directives in the scripts concerned.

<!-- vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3: -->
