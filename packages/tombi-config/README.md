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

Extend it from the repository's `tombi.toml` or `.config/tombi.toml`. This
needs tombi 1.11.0 or later. Paths in `.config/tombi.toml` resolve from the
repository root; in `tombi.toml`, from the file's own directory.

```toml
extends = [ "node_modules/@chewygumxx/tombi-config/tombi.toml" ]
```

## Extending

The local configuration is applied after the house style: tables merge, and
local values win.

```toml
extends = [ "node_modules/@chewygumxx/tombi-config/tombi.toml" ]

[format.rules]
line-width = 100
```

<!-- vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3: -->
