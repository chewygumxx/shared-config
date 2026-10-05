// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
//
// ~chewygumxx/shared-config.git
// ::: :/packages/remark-preset/test.js
//
//

// @ts-check

import { test } from "bun:test";
import assert from "node:assert/strict";
import { remark } from "remark";
import preset from "./index.js";

// Escaped, so this file does not trip the check it tests.
const EM_DASH = "\u2014";

/**
 * Each message the preset reports for a document, as `line:column rule`.
 *
 * @param {string} document
 * @returns {Promise<string[]>}
 */
async function report(document) {
    const file = await remark().use(preset).process(document);
    return file.messages.map(
        (message) => `${message.line}:${message.column} ${message.ruleId}`,
    );
}

test("reports each em dash where it is", async () => {
    const document = `# Title\n\nOne ${EM_DASH} two ${EM_DASH} three.\n`;
    assert.deepEqual(await report(document), [
        "3:5 no-em-dash",
        "3:11 no-em-dash",
    ]);
});

test("reports an em dash in front matter and code", async () => {
    const document = [
        "---",
        `title: a ${EM_DASH} b`,
        "---",
        "",
        "# Title",
        "",
        "```sh",
        `echo ${EM_DASH}`,
        "```",
        "",
    ].join("\n");
    assert.deepEqual(await report(document), [
        "2:10 no-em-dash",
        "8:6 no-em-dash",
    ]);
});

test("accepts en dashes and hyphens", async () => {
    assert.deepEqual(await report("# Title\n\n1–2, a-b.\n"), []);
});
