// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
//
// ~chewygumxx/shared-config.git
// ::: :/packages/secretlint-rule-preset/test.js
//
//

// @ts-check

import { test } from "bun:test";
import assert from "node:assert/strict";
import { homedir } from "node:os";
import { join } from "node:path";
import { lintSource } from "@secretlint/core";
import { creator } from "./index.js";

/**
 * The rule ids the preset reports for a file. Secrets in these tests are
 * assembled at run time, so this file holds none for secretlint to find.
 *
 * @param {string} filePath
 * @param {string} content
 * @param {{ id: string, allowMessageIds?: string[] }[]} [rules] settings of
 *     the preset's rules
 * @returns {Promise<string[]>}
 */
async function report(filePath, content, rules = []) {
    const { messages } = await lintSource({
        source: { filePath, content, contentType: "text" },
        options: {
            config: { rules: [{ id: creator.meta.id, rule: creator, rules }] },
        },
    });
    return messages.map((message) => message.ruleId);
}

test("reports a credential by its format, as the recommended preset does", async () => {
    const token = ["ghp", "_", "A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8"].join("");
    assert.deepEqual(await report("/repo/config.sh", `TOKEN=${token}\n`), [
        "@secretlint/secretlint-rule-github",
    ]);
});

test("reports a tracked .env file, whatever it holds", async () => {
    assert.deepEqual(await report("/repo/.env", "EDITOR=nvim\n"), [
        "@secretlint/secretlint-rule-no-dotenv",
    ]);
});

test("reports a path into the home directory", async () => {
    const path = join(homedir(), "dev", "notes.md");
    assert.deepEqual(await report("/repo/README.md", `See ${path}.\n`), [
        "@secretlint/secretlint-rule-no-homedir",
    ]);
});

test("allows a path into the home directory by its message id", async () => {
    const path = join(homedir(), ".zshrc");
    const rules = [
        {
            id: "@secretlint/secretlint-rule-no-homedir",
            allowMessageIds: ["HOMEDIR"],
        },
    ];
    assert.deepEqual(await report("/repo/README.md", path, rules), []);
});

test("reports nothing in an ordinary file", async () => {
    assert.deepEqual(await report("/repo/README.md", "# repo\n"), []);
});
