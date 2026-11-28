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
  "$schema": "https://biomejs.dev/schemas/2.6.9/schema.json",
  "extends": ["@chewygumxx/biome-config/configs/recommended"]
}
```

The manifest path works with Biome 2.6 and later. Biome 2.5.14 consumers can
extend `@chewygumxx/biome-config` or `@chewygumxx/biome-config/biome`.
Both paths also work with Biome 2.6.

The shared file is named `config.json` rather than `biome.json` so that Biome
does not treat it as a nested configuration inside this repository.

The shared config excludes `settings*.json` in directories whose names contain
`claude`, root-level `skills-lock.json` and `secrets.json`, and
`packages/cli/assets/pi/vendor`.

With Biome 2.6, a list containing only exclusions adds to the shared
exclusions. For example, to also exclude `dist`:

```json
{
  "files": {
    "includes": ["!dist"]
  }
}
```

If the list starts with a positive pattern such as `"**"`, repeat any shared
exclusions you want to keep. Biome 2.5.14 requires that positive pattern.

<!-- vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3: -->
