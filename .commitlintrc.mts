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
            name: "yamllint",
            fullName: "yamllint",
            description: "@chewygumxx/yamllint-config",
        },
    ],
});
