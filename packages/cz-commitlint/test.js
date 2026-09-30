// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
//
// ~chewygumxx/shared-config.git
// ::: :/packages/cz-commitlint/test.js
//
//

// @ts-check

import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { prompter as upstream } from "@commitlint/cz-commitlint";
import { prompter, relabel } from "./index.js";

const root = fileURLToPath(new URL("../..", import.meta.url));

/**
 * The choices of the `type` question an adapter asks, with commitlint's
 * config loaded from `cwd`. The prompt never answers, so nothing is committed.
 *
 * @param {(inquirer: { prompt(questions: never[]): Promise<never> }, commit: () => void) => void} adapter
 *   upstream's or this package's `prompter`
 * @param {string} cwd
 * @returns {Promise<unknown[]>}
 */
async function typeChoices(adapter, cwd) {
    const previous = process.cwd();
    process.chdir(cwd);
    try {
        /** @type {PromiseWithResolvers<import("./index.d.ts").Question[]>} */
        const asked = Promise.withResolvers();
        adapter(
            {
                prompt: (questions) => {
                    asked.resolve(questions);
                    return new Promise(() => {});
                },
            },
            () => {},
        );
        const questions = await asked.promise;
        return (
            questions.find((question) => question.name === "type")?.choices ??
            []
        );
    } finally {
        process.chdir(previous);
    }
}

/**
 * The type choices each adapter asks under a commitlint config whose `type`
 * rules and prompt are `types` and `prompt`.
 *
 * @param {string[]} types
 * @param {object} prompt
 */
async function withConfig(types, prompt) {
    const dir = await mkdtemp(join(tmpdir(), "cz-commitlint-"));
    try {
        const config = {
            rules: { "type-enum": [2, "always", types] },
            prompt: { questions: { type: prompt } },
        };
        await writeFile(
            join(dir, "commitlint.config.mjs"),
            `export default ${JSON.stringify(config)};\n`,
        );
        return {
            upstream: await typeChoices(upstream, dir),
            relabelled: await typeChoices(prompter, dir),
        };
    } finally {
        await rm(dir, { recursive: true, force: true });
    }
}

/** @param {unknown[]} choices */
const names = (choices) =>
    choices.map((choice) =>
        choice && typeof choice === "object" && "name" in choice
            ? choice.name
            : choice,
    );

test("upstream labels choices as <prefix><key>: <description>", async () => {
    const { upstream } = await withConfig(["feat", "fix"], {
        enum: {
            feat: { description: "A feature", emoji: "✨" },
            fix: { description: "A fix", emoji: "🐛" },
        },
    });
    assert.deepEqual(names(upstream).slice(0, 2), [
        "✨  feat:   A feature",
        "🐛  fix:    A fix",
    ]);
});

test("titles replace keys, keeping emoji prefixes and values", async () => {
    const { relabelled } = await withConfig(["feat", "fix"], {
        enum: {
            feat: { title: "Features", description: "A feature", emoji: "✨" },
            fix: { title: "Bug Fixes", description: "A fix", emoji: "🐛" },
        },
    });
    assert.deepEqual(relabelled.slice(0, 2), [
        { name: "✨  Features     A feature", value: "feat", short: "feat" },
        { name: "🐛  Bug Fixes    A fix", value: "fix", short: "fix" },
    ]);
});

test("choices are relabelled when emoji lead their values", async () => {
    const { relabelled } = await withConfig(["feat"], {
        emojiInHeader: true,
        enum: {
            feat: { title: "Features", description: "A feature", emoji: "✨" },
        },
    });
    assert.deepEqual(relabelled[0], {
        name: "✨  Features    A feature",
        value: "✨ feat",
        short: "feat",
    });
});

test("untitled entries keep <key>: and bare entries count towards the width", async () => {
    const { relabelled } = await withConfig(["feat", "chore", "wip"], {
        enum: {
            feat: { title: "Features", description: "A feature" },
            chore: { description: "Maintenance" },
            wip: { title: "Work in progress, unfinished" },
        },
    });
    assert.deepEqual(names(relabelled).slice(0, 3), [
        "Features                        A feature",
        "chore:                          Maintenance",
        "wip",
    ]);
});

test("a question without titles is left as upstream built it", async () => {
    const { upstream, relabelled } = await withConfig(["feat", "fix"], {
        enum: {
            feat: { description: "A feature" },
            fix: { description: "A fix" },
        },
    });
    assert.deepEqual(relabelled, upstream);
});

test("separators and the empty choice are left alone", async () => {
    const { upstream, relabelled } = await withConfig(["feat"], {
        enum: { feat: { title: "Features", description: "A feature" } },
    });
    assert.deepEqual(relabelled.slice(1), upstream.slice(1));
    assert.deepEqual(names(relabelled).at(-1), "empty");
});

test("this repository's own config lists types by title", async () => {
    const choices = names(await typeChoices(prompter, root));
    assert.ok(
        choices.some((name) => /^✨ {2}Feature {4,}\S/u.test(String(name))),
    );
    assert.ok(!choices.some((name) => /\bfeat:/.test(String(name))));
});

test("an unrecognised label is kept, with a warning", (t) => {
    const warn = t.mock.method(process, "emitWarning", () => {});
    const choice = { name: "feat - A feature", value: "feat", short: "feat" };
    const [question] = relabel([{ name: "type", choices: [choice] }], {
        type: {
            enum: { feat: { title: "Features", description: "A feature" } },
        },
    });
    assert.deepEqual(question?.choices, [choice]);
    assert.equal(warn.mock.callCount(), 1);
});
