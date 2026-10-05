---
ctime: 2026-10-04
mtime: 2026-10-05
spdx: GPL-3.0-only
title: "@chewygumxx/remark-preset"
description: >-
  remark-lint's recommended and consistency presets, with frontmatter, GFM, -
  bullets and an 80-column prose limit.
tags:
  - npm
  - config
  - remark
  - markdown
---

<!--
   -
   - ~chewygumxx/shared-config.git
   - ::: :/packages/remark-preset/README.md
   -
   -->

# @chewygumxx/remark-preset

remark-lint's recommended and consistency presets with frontmatter and GFM
support, `-` list bullets, and an 80-column limit on prose. Code, headings,
tables and unbreakable links may exceed it. GitHub alerts such as
`> [!NOTE]` are not mistaken for undefined references.

Em dashes (U+2014) are reported wherever they are, front matter and code
included, as `no-em-dash`.

```sh
bun add --dev remark-cli @chewygumxx/remark-preset
```

```json
{
  "remarkConfig": {
    "plugins": ["@chewygumxx/remark-preset"]
  }
}
```

remark-lint drops a warning positioned after a file's last node, so an over-long
final line of a file is not reported.

<!-- vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3: -->
