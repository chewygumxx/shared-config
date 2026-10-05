---
ctime: 2026-10-04
mtime: 2026-10-05
spdx: GPL-3.0-only
title: "@chewygumxx/commitlint-config"
description: >-
  Conventional Commits with a 50-character header, a 72-character body, fixed
  types and optional scopes.
tags:
  - npm
  - config
  - commitlint
---

<!--
   -
   - ~chewygumxx/shared-config.git
   - ::: :/packages/commitlint-config/README.md
   -
   -->

# @chewygumxx/commitlint-config

Conventional Commits with a 50-character header, a 72-character body, a fixed
list of types and an optional list of scopes. Dependabot's signed-off version
bumps are exempt.

```sh
bun add --dev @commitlint/cli @chewygumxx/commitlint-config
```

```ts
// .commitlintrc.mts
import { defineConfig } from "@chewygumxx/commitlint-config";

export default defineConfig({
  scopes: [
    { name: "claude", fullName: "Claude", description: "Claude Code assets" },
  ],
});
```

Without `scopes`, any scope is accepted, and
`extends: ["@chewygumxx/commitlint-config"]` works too. The `types` list is
exported for reuse.

<!-- vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3: -->
