---
__cgxx: |
  # vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3:
  # SPDX-License-Identifier: GPL-3.0-only

  #
  #
  # ~chewygumxx/shared-config.git
  # ::: :/packages/editorconfig-checker-config/README.md
  #
  #

ctime: 2026-10-05
title: "@chewygumxx/editorconfig-checker-config"
description: Repository README.md
tags:
  - npm
  - config
---

# @chewygumxx/editorconfig-checker-config

editorconfig-checker's defaults with the indent size check off, as the shared
CI's `-disable-indent-size` has it: YAML sequences, Markdown list
continuations and verbatim licence text break it legitimately, and the
formatters own indentation. Indent style, charset, line endings, trailing
whitespace and final newlines are still checked.

## Usage

editorconfig-checker is pinned with mise, as CI pins it:

```sh
mise use aqua:editorconfig-checker/editorconfig-checker@4.0.2
bun add --dev @chewygumxx/editorconfig-checker-config
```

With no files named, it checks every tracked file:

```json
{
  "scripts": {
    "lint:editorconfig": "editorconfig-checker -config node_modules/@chewygumxx/editorconfig-checker-config/config.json"
  }
}
```

The file has no `Version`, so that it applies to whichever version of
editorconfig-checker runs it.

## Extending

editorconfig-checker reads one file, so a repository that needs more, such
as an `Exclude` pattern, keeps its own `.editorconfig-checker.json` with
`"Disable": { "IndentSize": true }` restated, or passes the flag beside it:

```sh
editorconfig-checker -config node_modules/@chewygumxx/editorconfig-checker-config/config.json -exclude '^vendor/'
```
