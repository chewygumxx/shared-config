---
ctime: 2026-10-05
mtime: 2026-10-05
spdx: GPL-3.0-only
title: "@chewygumxx/actionlint-config"
description: >-
  actionlint's defaults, without two false reports for
  actions/create-github-app-token@v3.
tags:
  - npm
  - config
  - actionlint
---

<!--
   -
   - ~chewygumxx/shared-config.git
   - ::: :/packages/actionlint-config/README.md
   -
   -->

# @chewygumxx/actionlint-config

actionlint's defaults, without the two false reports its bundled metadata
makes for `actions/create-github-app-token@v3`: a missing `app-id`, and an
undefined `client-id`, which v3 added in place of `app-id`. Every other
message, for that action too, is still reported.

## Usage

actionlint is pinned with mise, as CI pins it; it runs shellcheck on each
`run:` script when shellcheck is installed too:

```sh
mise use aqua:rhysd/actionlint@1.7.12
bun add --dev @chewygumxx/actionlint-config
```

actionlint reads only `.github/actionlint.yaml` by itself, so name this file:

```json
{
  "scripts": {
    "lint:actions": "actionlint -config-file node_modules/@chewygumxx/actionlint-config/config.yaml"
  }
}
```

> [!NOTE]
> The shared CI's workflow job runs actionlint without installing the
> repository's packages, so it reads only a `.github/actionlint.yaml` that the
> repository keeps itself.

## Extending

actionlint reads one file. A repository that needs more, such as its
self-hosted runner labels, keeps its own `.github/actionlint.yaml` and
restates these `ignore` patterns in it.

<!-- vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3: -->
