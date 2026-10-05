---
ctime: 2026-10-05
mtime: 2026-10-05
spdx: GPL-3.0-only
title: "@chewygumxx/tsconfig"
description: >-
  A strict, type-check-only TypeScript base for repositories run by Bun or Node
  without a build step.
tags:
  - npm
  - config
  - typescript
---

<!--
   -
   - ~chewygumxx/shared-config.git
   - ::: :/packages/tsconfig/README.md
   -
   -->

# @chewygumxx/tsconfig

A strict, type-check-only TypeScript base for repositories run by Bun or Node
without a build step:

- `esnext` target with `nodenext` modules and resolution
- `strict`, with JavaScript checked as well as TypeScript
- nothing emitted; a build extends this with its own `outDir`
- declaration files of dependencies not checked.

| Export                      | Adds                         |
| --------------------------- | ---------------------------- |
| `@chewygumxx/tsconfig`      | nothing; the base            |
| `@chewygumxx/tsconfig/bun`  | Bun's globals and `bun:*`    |

## Usage

```sh
bun add --dev typescript @types/bun @chewygumxx/tsconfig
```

```json
{
  "$schema": "https://json.schemastore.org/tsconfig.json",
  "extends": "@chewygumxx/tsconfig/bun",
  "include": ["src", ".commitlintrc.mts"]
}
```

`include`, `files` and `exclude` stay in the repository: TypeScript resolves
them against the file that sets them, which here would be inside
`node_modules`.

## Extending

Options set beside `extends` take precedence, one option at a time. A
TypeScript source tree run directly by Bun adds the options that keep its
syntax erasable:

```json
{
  "extends": "@chewygumxx/tsconfig/bun",
  "compilerOptions": {
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "allowImportingTsExtensions": true
  },
  "include": ["src"]
}
```

`types` is replaced rather than merged, so a repository that needs more
global types restates `bun` alongside them.

<!-- vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3: -->
