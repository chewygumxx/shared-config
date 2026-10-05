// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
//
// ~chewygumxx/shared-config.git
// ::: :/packages/remark-preset/no-em-dash.js
//
//

// @ts-check

// Warns of each em dash (U+2014), which the house style prohibits. The file's
// text is searched rather than its tree, so front matter, code and HTML are
// held to the rule too, as the repositories' `git grep` check holds them.

import { lintRule } from "unified-lint-rule";
import { location } from "vfile-location";

// Escaped, so this file does not trip the check it implements.
const EM_DASH = "\u2014";

const remarkLintNoEmDash = lintRule(
    {
        origin: "remark-lint:no-em-dash",
        url: "https://github.com/chewygumxx/shared-config/tree/main/packages/remark-preset#readme",
    },
    (_tree, file) => {
        const value = String(file);
        const place = location(value);
        let index = value.indexOf(EM_DASH);
        while (index !== -1) {
            const start = place.toPoint(index);
            const end = place.toPoint(index + EM_DASH.length);
            file.message(
                "Unexpected em dash (U+2014), em dashes are prohibited",
                start && end ? { place: { start, end } } : undefined,
            );
            index = value.indexOf(EM_DASH, index + EM_DASH.length);
        }
    },
);

export default remarkLintNoEmDash;
