// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
//
// ~chewygumxx/shared-config.git
// ::: :/packages/prettier-config/index.js
//
//

// @ts-check

// https://prettier.io/docs/configuration
//
// The house style. prettier's defaults stand, with indentation, line endings
// and line length taken from `.editorconfig`, which prettier reads by
// default; Biome formats JavaScript, TypeScript and JSON, so in these
// repositories prettier mostly formats YAML.

/** @type {import("prettier").Config} */
const config = {
    overrides: [
        // prettier's jsonc parser adds trailing commas, which
        // @chewygumxx/biome-config's JSON `trailingCommas: "none"` removes
        // again, so the two would undo each other.
        {
            files: "*.jsonc",
            options: {
                trailingComma: "none",
            },
        },
    ],
};

export default config;
