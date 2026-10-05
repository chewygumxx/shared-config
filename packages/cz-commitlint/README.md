---
ctime: 2026-10-04
mtime: 2026-10-05
spdx: GPL-3.0-only
title: "@chewygumxx/cz-commitlint"
description: >-
  @commitlint/cz-commitlint, listing each type and scope by the title its prompt
  configuration gives it.
tags:
  - npm
  - config
  - commitlint
  - commitizen
---

<!--
   -
   - ~chewygumxx/shared-config.git
   - ::: :/packages/cz-commitlint/README.md
   -
   -->

# @chewygumxx/cz-commitlint

[`@commitlint/cz-commitlint`](https://commitlint.js.org/reference/prompt.html),
listing each type and scope by the `title` its prompt configuration gives it,
padded to the longest title, rather than by its value.

```sh
bun add --dev commitizen @chewygumxx/cz-commitlint
```

```json
{
  "config": {
    "commitizen": {
      "path": "@chewygumxx/cz-commitlint"
    }
  }
}
```

The adapter wraps upstream's public `prompter` and relabels its choices before
inquirer shows them, so no patch to `node_modules` is needed. Emoji prefixes,
descriptions and the value committed are unchanged, and an entry without a
`title` keeps upstream's `<key>:` label. Should upstream change how it labels
choices, the adapter falls back to upstream's labels and emits a
`CzCommitlintWarning`.

<!-- vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3: -->
