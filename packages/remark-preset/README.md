# @chewygumxx/remark-preset

remark-lint's recommended and consistency presets with frontmatter and GFM
support, `-` list bullets, and an 80-column limit on prose. Code, headings,
tables and unbreakable links may exceed it.

```sh
npm install --save-dev remark-cli @chewygumxx/remark-preset
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
