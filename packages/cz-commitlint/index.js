// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
//
// ~chewygumxx/shared-config.git
// ::: :/packages/cz-commitlint/index.js
//
//

// @ts-check

import { prompter as upstream } from "@commitlint/cz-commitlint";
import load from "@commitlint/load";

/** @typedef {import("./index.d.ts").Question} Question */
/** @typedef {import("./index.d.ts").PromptQuestions} PromptQuestions */
/** @typedef {{ name: string, short: string }} EnumChoice */

/**
 * Upstream's enum key for a choice: `short` for a labelled choice, or the
 * choice itself for an enum entry without a description, which upstream lists
 * bare. Separators and the "empty" choice of a skippable question have none.
 *
 * @param {unknown} choice
 * @returns {string | undefined}
 */
function keyOf(choice) {
    if (typeof choice === "string") return choice;
    if (choice && typeof choice === "object" && "short" in choice) {
        return typeof choice.short === "string" ? choice.short : undefined;
    }
    return undefined;
}

/**
 * @param {unknown} choice
 * @returns {choice is EnumChoice}
 */
function isEnumChoice(choice) {
    return (
        typeof choice === "object" &&
        keyOf(choice) !== undefined &&
        "name" in /** @type {object} */ (choice) &&
        typeof (/** @type {{ name: unknown }} */ (choice).name) === "string"
    );
}

/**
 * Labels each enum choice with its prompt `title` rather than `<key>:`, padded
 * to the longest title. Upstream labels a choice as an emoji prefix, then
 * `<key>:` padded to the longest key, then the description; the prefix and
 * the description are kept, and an entry without a `title` keeps `<key>:`.
 * A question none of whose entries has a `title` is left as upstream built it.
 *
 * @param {Question[]} questions
 * @param {PromptQuestions} [promptQuestions]
 * @returns {Question[]}
 */
export function relabel(questions, promptQuestions = {}) {
    return questions.map((question) => {
        const entries = promptQuestions[question.name]?.enum;
        if (!question.choices || !entries) return question;
        if (!Object.values(entries).some((entry) => entry?.title)) {
            return question;
        }

        /** @param {string} key */
        const title = (key) =>
            Object.hasOwn(entries, key) ? entries[key]?.title : undefined;
        const keys = question.choices.flatMap((choice) => keyOf(choice) ?? []);
        const longest = Math.max(
            ...keys.map((key) => (title(key) ?? key).length),
        );

        let unrecognised = false;
        const choices = question.choices.map((choice) => {
            if (!isEnumChoice(choice)) return choice;
            const at = choice.name.indexOf(`${choice.short}:`);
            if (at < 0) {
                unrecognised = true;
                return choice;
            }
            const label = title(choice.short) ?? `${choice.short}:`;
            const description = entries[choice.short]?.description ?? "";
            return {
                ...choice,
                name: `${choice.name.slice(0, at)}${label.padEnd(longest + 4)}${description}`,
            };
        });

        if (unrecognised) {
            process.emitWarning(
                `@commitlint/cz-commitlint labelled a "${question.name}" choice in an unrecognised format; its title is not shown.`,
                "CzCommitlintWarning",
            );
        }
        return { ...question, choices };
    });
}

/**
 * Entry point for commitizen: `@commitlint/cz-commitlint`, with its enum
 * choices relabelled by {@link relabel}.
 *
 * @param {import("./index.d.ts").Inquirer} inquirer
 * @param {(message: string) => void} commit
 */
export function prompter(inquirer, commit) {
    // Loaded alongside upstream's own load rather than before it. A config
    // that fails to load fails upstream's load too, so this copy's rejection
    // is marked handled rather than reported a second time.
    const config = load();
    config.catch(() => {});

    upstream(
        {
            ...inquirer,
            prompt: async (questions, ...rest) => {
                const { prompt } = await config;
                return inquirer.prompt(
                    relabel(questions, prompt?.questions),
                    ...rest,
                );
            },
        },
        commit,
    );
}
