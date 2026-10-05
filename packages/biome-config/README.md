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
  "$schema": "https://biomejs.dev/schemas/2.5.14/schema.json",
  "extends": ["@chewygumxx/biome-config"]
}
```

The shared file is named `config.json` rather than `biome.json` so that Biome
does not treat it as a nested configuration inside this repository.

<!-- vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3: -->
