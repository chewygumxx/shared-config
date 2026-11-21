// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
//
// ~chewygumxx/shared-config.git
// ::: :/packages/commitlint-config/test.js
//
//

// @ts-check

import { test } from "bun:test";
import assert from "node:assert/strict";
import lint from "@commitlint/lint";
import load from "@commitlint/load";
import { defineConfig } from "./index.js";

/**
 * Lints `message` as commitlint's CLI would, under this package's config
 * restricted to the scope `hk`.
 *
 * @param {string} message
 */
async function check(message) {
    const config = await load(
        defineConfig({
            scopes: [{ name: "hk", fullName: "hk", description: "hk" }],
        }),
    );
    return lint(message, config.rules, {
        parserOpts: config.parserPreset?.parserOpts ?? {},
        ignores: config.ignores ?? [],
        defaultIgnores: config.defaultIgnores ?? true,
    });
}

/** @param {Awaited<ReturnType<typeof check>>} report */
const errors = (report) => report.errors.map((error) => error.name);

test("a plain header passes", async () => {
    const report = await check("feat(hk): Publish shared hk steps");
    assert.deepEqual(errors(report), []);
});

test("a breaking header with a scope passes", async () => {
    const report = await check("feat(hk)!: Publish shared hk steps");
    assert.deepEqual(errors(report), []);
});

test("a breaking header without a scope passes", async () => {
    const report = await check("fix!: Drop the old steps");
    assert.deepEqual(errors(report), []);
});

test("a BREAKING CHANGE footer passes", async () => {
    const report = await check(
        "feat(hk): Publish shared hk steps\n\nBREAKING CHANGE: Steps moved.",
    );
    assert.deepEqual(errors(report), []);
});

test("a breaking header still checks its type and scope", async () => {
    const report = await check("nope(other)!: Publish shared hk steps");
    assert.deepEqual(errors(report).sort(), ["scope-enum", "type-enum"]);
});
