# @chewygumxx/commitlint-config

Conventional Commits with a 50-character header, a 72-character body, a fixed
list of types and an optional list of scopes. Dependabot's signed-off version
bumps are exempt.

```sh
npm install --save-dev @commitlint/cli @chewygumxx/commitlint-config
```

```ts
// .commitlintrc.mts
import { defineConfig } from "@chewygumxx/commitlint-config";

export default defineConfig({
    scopes: [{ name: "claude", fullName: "Claude", description: "Claude Code assets" }],
});
```

Without `scopes`, any scope is accepted, and
`extends: ["@chewygumxx/commitlint-config"]` works too. The `types` list is
exported for reuse.
