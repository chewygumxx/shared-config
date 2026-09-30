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

/**
 * Labels each enum choice with its prompt `title` rather than its value,
 * padded to the longest title. Upstream labels a choice as its emoji prefix,
 * then `<value>:` padded, then the description; the prefix is kept as is.
 * Choices without an entry in `enum`, such as separators and the "empty"
 * choice of a skippable question, are left alone.
 *
 * @param {Question[]} questions
 * @param {PromptQuestions} [promptQuestions]
 * @returns {Question[]}
 */
export function relabel(questions, promptQuestions = {}) {
    return questions.map((question) => {
        const entries = promptQuestions[question.name]?.enum;
        if (!question.choices || !entries) return question;

        /** @param {unknown} choice */
        const entryOf = (choice) =>
            choice &&
            typeof choice === "object" &&
            "value" in choice &&
            typeof choice.value === "string" &&
            "name" in choice &&
            typeof choice.name === "string" &&
            choice.name.includes(`${choice.value}:`) &&
            Object.hasOwn(entries, choice.value)
                ? entries[choice.value]
                : undefined;
        /** @param {string} value */
        const title = (value) => entries[value]?.title || value;

        const values = question.choices.flatMap((choice) =>
            entryOf(choice)
                ? [/** @type {{ value: string }} */ (choice).value]
                : [],
        );
        if (values.length === 0) return question;
        const longest = Math.max(...values.map((value) => title(value).length));

        return {
            ...question,
            choices: question.choices.map((choice) => {
                const entry = entryOf(choice);
                if (!entry) return choice;
                const { name, value } =
                    /** @type {{ name: string, value: string }} */ (choice);
                const prefix = name.slice(0, name.indexOf(`${value}:`));
                return {
                    ...choice,
                    name: `${prefix}${title(value).padEnd(longest + 4)}${entry.description ?? ""}`,
                };
            }),
        };
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
    load().then(({ prompt }) => {
        upstream(
            {
                ...inquirer,
                prompt: (questions, ...rest) =>
                    inquirer.prompt(
                        relabel(questions, prompt?.questions),
                        ...rest,
                    ),
            },
            commit,
        );
    });
}
