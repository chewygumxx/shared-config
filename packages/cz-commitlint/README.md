# @chewygumxx/cz-commitlint

[`@commitlint/cz-commitlint`](https://commitlint.js.org/reference/prompt.html),
listing each type and scope by the `title` its prompt configuration gives it,
padded to the longest title, rather than by its value.

```sh
npm install --save-dev commitizen @chewygumxx/cz-commitlint
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
inquirer shows them, so no patch to `node_modules` is needed. Emoji prefixes
and the value committed are unchanged.
