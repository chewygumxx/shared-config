---
ctime: 2026-11-20
mtime: 2026-11-20
spdx: GPL-3.0-only
title: "@chewygumxx/tombi-config"
description: >-
  Shared tombi configuration for chewygumxx repositories
tags:
  - npm
  - config
  - tombi
  - toml
---

<!--
   -
   - ~chewygumxx/shared-config.git
   - ::: :/packages/tombi-config/README.md
   -
   -->

# @chewygumxx/tombi-config

Personal configuration of tombi, the TOML formatter and linter:

- TOML v1.1.0
- four-space indentation
- one space inside array brackets
- aligned `=` signs and trailing comments
- a space, not `T`, between date and time.

## Usage

```sh
bun add --dev @chewygumxx/tombi-config
```

tombi takes no flag or environment variable naming a configuration file. Copy
the file to where tombi looks for one: the repository's `tombi.toml` or
`.config/tombi.toml`, or the user-level `tombi/config.toml`.

```sh
cp node_modules/@chewygumxx/tombi-config/tombi.toml .config/tombi.toml
```

<!-- vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3: -->
