---
__cgxx: |
  # vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3:
  # SPDX-License-Identifier: GPL-3.0-only

  #
  #
  # ~chewygumxx/shared-config.git
  # ::: :/packages/markdownlint-cli2-config/README.md
  #
  #

ctime: 2026-10-05
title: "@chewygumxx/markdownlint-cli2-config"
description: Repository README.md
tags:
  - npm
  - config
---

# @chewygumxx/markdownlint-cli2-config

markdownlint's defaults, adjusted to agree with
[`@chewygumxx/remark-preset`](../remark-preset):

- `-` list bullets
- an 80-column limit on prose; code, headings, tables and unbreakable links may
  exceed it
- a front matter `title` does not count as the document's heading.

## Usage

```sh
bun add --dev markdownlint-cli2 @chewygumxx/markdownlint-cli2-config
```

Extend it from the `config` property of a `.markdownlint-cli2.jsonc`:

```jsonc
{
  "config": {
    "extends": "@chewygumxx/markdownlint-cli2-config"
  }
}
```

Pass tracked files only, as with the other linters:

```json
{
  "scripts": {
    "lint:md": "git ls-files -z '*.md' | xargs -0 -r markdownlint-cli2"
  }
}
```

## Extending

Rules set beside `extends` take precedence. markdownlint merges the extended
file shallowly, so an overridden rule loses this package's options for that
rule; restate any you want to keep:

```jsonc
{
  "config": {
    "extends": "@chewygumxx/markdownlint-cli2-config",
    "MD013": {
      "line_length": 100,
      "code_blocks": false,
      "headings": false,
      "tables": false
    }
  }
}
```

The shared file is named `config.jsonc` rather than `.markdownlint.jsonc` so
that markdownlint-cli2 does not treat it as a nested configuration inside this
repository.
