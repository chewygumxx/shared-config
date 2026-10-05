---
__cgxx: |
  # vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3:
  # SPDX-License-Identifier: GPL-3.0-only

  #
  #
  # ~chewygumxx/shared-config.git
  # ::: :/packages/prettier-config/README.md
  #
  #

ctime: 2026-10-05
title: "@chewygumxx/prettier-config"
description: Repository README.md
tags:
  - npm
  - config
---

# @chewygumxx/prettier-config

prettier's defaults, taking indentation, line endings and line length from
`.editorconfig`, with no trailing commas in `.jsonc` files so that prettier
agrees with [`@chewygumxx/biome-config`](../biome-config).

## Usage

```sh
bun add --dev prettier @chewygumxx/prettier-config
```

```json
{
  "prettier": "@chewygumxx/prettier-config"
}
```

> [!WARNING]
> The shared CI's YAML job runs prettier without installing the repository's
> packages, so a repository naming this package fails there until that job
> provides it, as it does `@chewygumxx/yamllint-config`.

## Extending

prettier cannot merge a shared configuration with options beside it in
`package.json`. Spread it from a `prettier.config.js` instead:

```js
import config from "@chewygumxx/prettier-config";

export default {
  ...config,
  overrides: [
    ...config.overrides,
    { files: ".zunit.yml", options: { tabWidth: 2 } },
  ],
};
```
