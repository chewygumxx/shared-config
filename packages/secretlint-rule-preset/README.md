---
ctime: 2026-10-05
mtime: 2026-10-05
spdx: GPL-3.0-only
title: "@chewygumxx/secretlint-rule-preset"
description: >-
  secretlint's recommended preset, plus two rules for what a repository should
  never track.
tags:
  - npm
  - config
  - secretlint
---

<!--
   -
   - ~chewygumxx/shared-config.git
   - ::: :/packages/secretlint-rule-preset/README.md
   -
   -->

# @chewygumxx/secretlint-rule-preset

secretlint's recommended preset, which finds credentials by their format,
with two rules for what a repository should never track:

- [`no-dotenv`](https://github.com/secretlint/secretlint/tree/master/packages/%40secretlint/secretlint-rule-no-dotenv):
  any `.env` file, whatever it holds
- [`no-homedir`](https://github.com/secretlint/secretlint/tree/master/packages/%40secretlint/secretlint-rule-no-homedir):
  a path into the home directory of whoever runs the check.

## Usage

```sh
bun add --dev secretlint @chewygumxx/secretlint-rule-preset
```

secretlint reads the `secretlint` key of `package.json`, so no
`.secretlintrc.json` is needed:

```json
{
  "secretlint": {
    "rules": [{ "id": "@chewygumxx/secretlint-rule-preset" }]
  }
}
```

Pass tracked files only, so that an untracked `.env` is not reported, with
`--no-gitignore`, so that a force-added one that `.gitignore` matches is.
secretlint masks the secrets it reports by default:

```json
{
  "scripts": {
    "lint:secrets": "git ls-files -z | xargs -0 -r secretlint --no-gitignore"
  }
}
```

## Extending

A rule of the preset is quietened by its message ids. A dotfiles repository,
whose files name paths in the home directory on purpose, allows `HOMEDIR`:

```json
{
  "rules": [
    {
      "id": "@chewygumxx/secretlint-rule-preset",
      "rules": [
        {
          "id": "@secretlint/secretlint-rule-no-homedir",
          "allowMessageIds": ["HOMEDIR"]
        }
      ]
    }
  ]
}
```

secretlint 13 ignores `"disabled": true` on a rule inside any preset, its own
included, so `allowMessageIds` is the way to turn one off. A
`.secretlintignore` exempts whole files.

<!-- vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3: -->
