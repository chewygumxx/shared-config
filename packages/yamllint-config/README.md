# @chewygumxx/yamllint-config

yamllint rules that agree with prettier's YAML output: yamllint's defaults, with
one space allowed before a trailing comment, no `---` required, no line length
limit, and `on:` accepted as a key. yamllint is a Python tool, so install it
with mise or pip; this package only carries the configuration.

```sh
npm install --save-dev @chewygumxx/yamllint-config
```

Name the file in `YAMLLINT_CONFIG_FILE` rather than extending it from a
`.yamllint`, so that no configuration file is needed in the repository. Pass
tracked files only; yamllint would otherwise descend into `node_modules`.

```json
{
    "scripts": {
        "lint:yaml": "git ls-files -z '*.yaml' '*.yml' | YAMLLINT_CONFIG_FILE=node_modules/@chewygumxx/yamllint-config/config.yaml xargs -0 -r yamllint --strict"
    }
}
```

yamllint reads that variable only when the repository has no `.yamllint`,
`.yamllint.yaml` or `.yamllint.yml`, so a repository can still override it. A
repository that wants the house style with a few changes can extend it:

```yaml
extends: node_modules/@chewygumxx/yamllint-config/config.yaml
```
