// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
//
// ~chewygumxx/shared-config.git
// ::: :/packages/commitlint-config/index.js
//
//

// @ts-check

import { fileURLToPath } from "node:url";
import { RuleConfigSeverity } from "@commitlint/types";

/** @typedef {import("./index.d.ts").Enumerable} Enumerable */
/** @typedef {import("./index.d.ts").Options} Options */
/** @typedef {import("@commitlint/types").UserConfig} UserConfig */

/** @type {Enumerable[]} */
export const types = [
    {
        name: "feat",
        fullName: "Feature",
        description: "Implementing new functionality/tool",
    },
    {
        name: "fix",
        fullName: "Fix",
        description: "Correct misconfiguration",
    },
    {
        name: "tweak",
        fullName: "Tweak",
        description: "Minor preference adjustment",
    },

    {
        name: "chore",
        fullName: "Chore",
        description: "Repository maintenance, organisation and management",
    },
    {
        name: "style",
        fullName: "Style",
        description: "Formatting, whitespace, indentation",
    },
    {
        name: "docs",
        fullName: "Docs",
        description: "Documentation and comments",
    },
    {
        name: "ai",
        fullName: "Agents",
        description: "Agentic assets",
    },
    {
        name: "ci",
        fullName: "CI",
        description: "Continuous integration/deployment",
    },

    {
        name: "refactor",
        fullName: "Refactor",
        description: "Purely structural",
    },
    {
        name: "perf",
        fullName: "Performance",
        description: "Performance improvement",
    },
    {
        name: "build",
        fullName: "Build",
        description: "Compilation, toolchain and dependencies",
    },
    {
        name: "test",
        fullName: "Test",
        description: "Test utilities eg. JSONschema validation",
    },
    {
        name: "revert",
        fullName: "Revert",
        description: "It's rewind time, rollback",
    },
];

const delimiters = ["/"];

const lvl = {
    off: RuleConfigSeverity.Disabled,
    wrn: RuleConfigSeverity.Warning,
    err: RuleConfigSeverity.Error,
};

/** @param {Enumerable[]} enumerable */
function promptQuestionEnum(enumerable) {
    return Object.fromEntries(
        enumerable.map((item) => [
            item.name,
            {
                title: item.fullName,
                description: item.description,
            },
        ]),
    );
}

/**
 * Builds the shared configuration, restricting scopes to `options.scopes`.
 * With no scopes given, any scope is accepted.
 *
 * @param {Options} [options]
 * @returns {UserConfig}
 */
export function defineConfig({ scopes = [] } = {}) {
    return {
        // Resolved here, against this package's own dependencies, so the
        // consuming repository need not install the preset itself.
        extends: [
            fileURLToPath(
                import.meta.resolve("@commitlint/config-conventional"),
            ),
        ],
        parserPreset: fileURLToPath(
            import.meta.resolve("conventional-changelog-conventionalcommits"),
        ),

        // Dependabot headers name the package and both versions, and its
        // bodies carry release-note URLs; neither fits the limits below. An
        // ignored message skips every rule, so require Dependabot's sign-off
        // trailer as well as its header rather than trusting the header alone.
        ignores: [
            (message) =>
                /^(build|ci): bump /i.test(message) &&
                /^Signed-off-by: dependabot\[bot\]/m.test(message),
        ],

        rules: {
            "header-max-length": [lvl.err, "always", 50],
            "type-enum": [lvl.err, "always", types.map((type) => type.name)],
            "scope-delimiter-style": [lvl.err, "always", delimiters],
            "scope-enum": [
                lvl.err,
                "always",
                scopes.map((scope) => scope.name),
            ],
            "subject-case": [
                lvl.wrn,
                "always",
                ["start-case", "sentence-case"],
            ],
            "subject-empty": [lvl.err, "never"],
            "body-max-line-length": [lvl.err, "always", 72],
        },

        prompt: {
            settings: {
                useExclamationMark: true,
                enableMultipleScopes: true,
                scopeEnumSeparator: delimiters.at(0),
            },
            messages: {
                skip: "(optional)",
                max: "(max %d)",
                min: "(min %d)",
                emptyWarning: "%s must not be empty",
                upperLimitWarning: "%s over max: %d",
                lowerLimitWarning: "%s below min: %d",
            },
            questions: {
                type: {
                    description: "Select Type",
                    enum: promptQuestionEnum(types),
                },
                scope: {
                    description: "Select Scope",
                    enum: promptQuestionEnum(scopes),
                },
                subject: { description: "Subject" },
                body: { description: "Body" },
                isBreaking: { description: "Breaking Changes?" },
                breakingBody: {
                    description: "Breaking change commits require a body",
                },
                breaking: { description: "Breaking Changes Description" },
                isIssueAffected: { description: "Relevant Issues?" },
                issuesBody: {
                    description:
                        "If issues are closed, the commit requires a body",
                },
                issues: {
                    description: 'Issue References (eg. "fix #123", "re #456")',
                },
            },
        },
    };
}

export default defineConfig();
