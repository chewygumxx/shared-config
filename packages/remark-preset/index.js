// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
//
// ~chewygumxx/shared-config.git
// ::: :/packages/remark-preset/index.js
//
//

// @ts-check
/// <reference types="remark-stringify" />

import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkLintMaximumLineLength from "remark-lint-maximum-line-length";
import remarkLintNoUndefinedReferences from "remark-lint-no-undefined-references";
import remarkPresetLintConsistent from "remark-preset-lint-consistent";
import remarkPresetLintRecommended from "remark-preset-lint-recommended";
import remarkLintNoEmDash from "./no-em-dash.js";

/** @type {import("unified").Preset} */
const preset = {
    settings: {
        bullet: "-",
    },
    plugins: [
        remarkFrontmatter,
        remarkGfm,
        remarkPresetLintRecommended,
        remarkPresetLintConsistent,
        // Stated explicitly: the plugin's docs disagree on its default.
        // remark-lint drops a warning positioned after the last node, so an
        // over-long final line of a file goes unreported.
        [remarkLintMaximumLineLength, 80],
        // GitHub renders `> [!NOTE]` and its siblings as alerts, not as
        // references.
        [
            remarkLintNoUndefinedReferences,
            { allow: [/^!(?:note|tip|important|warning|caution)$/i] },
        ],
        remarkLintNoEmDash,
    ],
};

export default preset;
