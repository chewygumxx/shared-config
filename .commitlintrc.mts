// vim:set expandtab shiftwidth=4 filetype=typescript:
// SPDX-License-Identifier: GPL-3.0-only

//
//
// ~chewygumxx/shared-config.git
// ::: :/.commitlintrc.mts
//
//

import { defineConfig } from "@chewygumxx/commitlint-config";

// One scope per published package.
export default defineConfig({
    scopes: [
        {
            name: "commitlint",
            fullName: "commitlint",
            description: "@chewygumxx/commitlint-config",
        },
        {
            name: "cz",
            fullName: "commitizen",
            description: "@chewygumxx/cz-commitlint",
        },
        {
            name: "biome",
            fullName: "Biome",
            description: "@chewygumxx/biome-config",
        },
        {
            name: "remark",
            fullName: "remark",
            description: "@chewygumxx/remark-preset",
        },
        {
            name: "markdownlint",
            fullName: "markdownlint",
            description: "@chewygumxx/markdownlint-cli2-config",
        },
        {
            name: "yamllint",
            fullName: "yamllint",
            description: "@chewygumxx/yamllint-config",
        },
        {
            name: "tsconfig",
            fullName: "TypeScript",
            description: "@chewygumxx/tsconfig",
        },
        {
            name: "prettier",
            fullName: "Prettier",
            description: "@chewygumxx/prettier-config",
        },
        {
            name: "cspell",
            fullName: "CSpell",
            description: "@chewygumxx/cspell-config",
        },
        {
            name: "secretlint",
            fullName: "secretlint",
            description: "@chewygumxx/secretlint-rule-preset",
        },
        {
            name: "shellcheck",
            fullName: "ShellCheck",
            description: "@chewygumxx/shellcheck-config",
        },
        {
            name: "editorconfig",
            fullName: "EditorConfig",
            description: "@chewygumxx/editorconfig-checker-config",
        },
        {
            name: "actionlint",
            fullName: "actionlint",
            description: "@chewygumxx/actionlint-config",
        },
    ],
});
