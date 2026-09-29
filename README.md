# shared-config

Shared tooling configuration for `chewygumxx` repositories, published to npm so
that each repository's local hooks and its CI apply the same rules.

| Package                                                       | Configures                                   |
| ------------------------------------------------------------- | -------------------------------------------- |
| [`@chewygumxx/commitlint-config`](packages/commitlint-config) | commitlint rules and the commitizen prompt   |
| [`@chewygumxx/biome-config`](packages/biome-config)           | Biome formatting, linting and import sorting |
| [`@chewygumxx/remark-preset`](packages/remark-preset)         | remark-lint rules for Markdown               |

Shared CI lives in
[`chewygumxx/.github`](https://github.com/chewygumxx/.github); new repositories
start from [`chewygumxx/repo-tmpl`](https://github.com/chewygumxx/repo-tmpl),
which consumes these packages.

## Development

This repository consumes its own packages through npm workspaces, so every
change is exercised here before it is published.

```sh
mise install
npm ci
npm run check
```

## Publishing

Each package is versioned independently. Bump its `version`, commit, and push a
tag named `<package>@<version>`, such as `biome-config@1.1.0`; the publish
workflow releases that package with provenance.
