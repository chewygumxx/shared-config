---
__cgxx: |
  # vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3:
  # SPDX-License-Identifier: GPL-3.0-only

  #
  #
  # ~chewygumxx/shared-config.git
  # ::: :/packages/yamllint-config/README.md
  #
  #

ctime: 2026-09-29
title: "@chewygumxx/yamllint-config"
description: >-
  My personalised base configuration for yamllint
tags: []
---

# @chewygumxx/yamllint-config

Personal configuration of yamllint that conforms to prettier's YAML output:

- yamllint's defaults,
- one space allowed before a trailing comment
- no `---` required
- no line length limit
- `on:` accepted as a key.

## Usage

```sh
bun add --dev @chewygumxx/yamllint-config
```

Name the file in `YAMLLINT_CONFIG_FILE` rather than extending it from a
`.yamllint`, so that no configuration file is needed in the repository. Pass
tracked files only; yamllint would otherwise descend into `node_modules`.

```json
{
  "scripts": {
    "lint:yaml": "git ls-files -z '*.yaml' '*.yml' | YAMLLINT_CONFIG_FILE=node_modules/@chewygumxx/yamllint-config/config.yaml xargs -0 -r yamllint --strict"
  }
}
```

## Extending

yamllint reads that variable only when the repository has no `.yamllint`,
`.yamllint.yaml` or `.yamllint.yml`, so a repository can still override it. A
repository that wants the house style with a few changes can extend it:

```yaml
extends: node_modules/@chewygumxx/yamllint-config/config.yaml
```
