---
ctime: 2026-10-04
mtime: 2026-10-05
spdx: GPL-3.0-only
title: "@chewygumxx/biome-config"
description: >-
  Biome settings taking indentation and line endings from .editorconfig, with
  the recommended rules and import sorting.
tags:
  - npm
  - config
  - biome
---

<!--
   -
   - ~chewygumxx/shared-config.git
   - ::: :/packages/biome-config/README.md
   -
   -->

# @chewygumxx/biome-config

Biome settings that take indentation and line endings from `.editorconfig`,
respect `.gitignore`, and enable the recommended lint rules and import sorting.

```sh
bun add --dev --exact @biomejs/biome
bun add --dev @chewygumxx/biome-config
```

```json
{
  "$schema": "https://biomejs.dev/schemas/2.6.8/schema.json",
  "extends": ["@chewygumxx/biome-config/configs/recommended"]
}
```

The manifest path works with Biome 2.6 and later. Biome 2.5.14 consumers can
extend `@chewygumxx/biome-config` or `@chewygumxx/biome-config/biome`.
Both paths also work with Biome 2.6.

The shared file is named `config.json` rather than `biome.json` so that Biome
does not treat it as a nested configuration inside this repository.

Claude Code's `.claude/settings.json` and `.claude/settings.local.json` are
excluded, as Claude Code rewrites them in its own style. A repository that sets
`files.includes` replaces the shared list, so repeat the exclusion. With
Biome 2.6, a list containing only exclusions uses the default file selection.

```json
{
  "files": {
    "includes": ["!**/.claude/settings*.json", "!dist"]
  }
}
```

For Biome 2.5.14, start the `includes` list with `"**"`.

<!-- vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3: -->
