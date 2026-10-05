---
ctime: 2026-10-05
mtime: 2026-10-05
spdx: GPL-3.0-only
title: "@chewygumxx/cspell-config"
description: >-
  CSpell's defaults with the house vocabulary, in British and American English
tags:
  - npm
  - config
  - cspell
---

<!--
   -
   - ~chewygumxx/shared-config.git
   - ::: :/packages/cspell-config/README.md
   -
   -->

# @chewygumxx/cspell-config

CSpell's defaults with the house vocabulary:

- British and American English, so prose in British English and code naming
  American APIs both pass
- the words in [`en.utf-8.add`](en.utf-8.add): tools, their authors and the
  repositories' own terms that cspell's dictionaries lack
- vim modelines and `--diff-filter=` flags not checked
- `.gitignore`d files, `LICENSE`s, lockfiles and compiled Vim spell files
  skipped.

## Usage

```sh
bun add --dev cspell @chewygumxx/cspell-config
```

```json
{
  "cspell": {
    "import": ["@chewygumxx/cspell-config"]
  },
  "scripts": {
    "lint:spell": "git ls-files -z | xargs -0 -r cspell --no-progress --no-summary --no-must-find-files"
  }
}
```

## Extending

Words only one repository uses belong beside the import rather than in the
shared list:

```json
{
  "cspell": {
    "import": ["@chewygumxx/cspell-config"],
    "words": ["commitlintconfig"]
  }
}
```

`en.utf-8.add` is one word per line with `#` comments: a Vim word list, named
as Neovim's `spellfile` requires, so Neovim can list it after its own word list
and check against the same vocabulary.

<!-- vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3: -->
