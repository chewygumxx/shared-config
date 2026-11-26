// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
//
// ~chewygumxx/shared-config.git
// ::: :/packages/commitlint-config/index.js
//
//

//
// https://commitlint.js.org/reference/configuration.html
//

// @ts-check

import { fileURLToPath } from "node:url";
import { RuleConfigSeverity } from "@commitlint/types";
import createPreset from "conventional-changelog-conventionalcommits";

/** @typedef {import("./index.d.ts").Enumerable} Enumerable */
/** @typedef {import("./index.d.ts").Options} Options */
/** @typedef {import("@commitlint/types").UserConfig} UserConfig */

/** @type {Enumerable[]} */
export const types = [
    {
        name: "feat",
        fullName: "Feature",
        description: "New functionality implementation",
    },
    {
        name: "fix",
        fullName: "Fix",
        description: "Malfunction correction",
    },

    {
        name: "chore",
        fullName: "Chore",
        description: "Repository administration",
    },
    {
        name: "docs",
        fullName: "Docs",
        description: "Documentation and inline comments (excludes AGENTS.md)",
    },
    {
        name: "build",
        fullName: "Build",
        description: "Development environment and utility specification",
    },
    {
        name: "test",
        fullName: "Test",
        description: "Integrity assertion and validation architecture",
    },
    {
        name: "style",
        fullName: "Style",
        description: "Inline formatting and whitespace amendment",
    },
    {
        name: "ci",
        fullName: "CI",
        description: "Declarative configuration and execution of CI",
    },
    {
        name: "perf",
        fullName: "Performance",
        description: "Performance improvement",
    },
    {
        // Consider whether this may be subsumed build/docs
        name: "ai",
        fullName: "Agent",
        description: "Agentic assets eg. skills, hooks, mcp, AGENTS.md",
    },

    {
        // This is too similar to refactor.
        // It's intended for changing URLs, appearance settings and configuration of programmatic
        // function in a manner too minor to be considered a feature or fix.
        name: "tweak",
        fullName: "Tweak",
        description:
            "Adjustment that neither adds, nor fixes, functional operation (eg. config key=val)",
    },
    {
        // This is too similar to tweak.
        // It's intended for code restructure, simplification, and technical debt control.
        name: "refactor",
        fullName: "Refactor",
        description:
            "Structural re-arrangement of code that does not affect function",
    },
    {
        // I don't remember ever using this
        name: "revert",
        fullName: "Revert",
        description: "It's rewind time, rollback to previous commit",
    },
    {
        // Proposed new commit type
        // Current convention: 'chore: Release 1.2.3'
        name: "release",
        fullName: "Release",
        description: "Publish a new release",
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
 * Builds the shared configuration with optional type and scope lists.
 * With no scopes given, any scope is accepted.
 *
 * @param {Options} [options]
 * @returns {UserConfig}
 */
export function defineConfig({ types: customTypes, scopes = [] } = {}) {
    const configuredTypes = customTypes?.length ? customTypes : types;
    return {
        // Resolved here, against this package's own dependencies, so the
        // consuming repository need not install the preset itself.
        extends: [
            fileURLToPath(
                import.meta.resolve("@commitlint/config-conventional"),
            ),
        ],
        // Given as parser options, not as a path: commitlint only calls a
        // preset's factory when the preset is named
        // conventional-changelog-*, which an absolute path is not. Without
        // the factory's breakingHeaderPattern, `type!:` headers fail to parse.
        parserPreset: {
            name: "conventional-changelog-conventionalcommits",
            parserOpts: createPreset().parser,
        },

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
            "type-enum": [
                lvl.err,
                "always",
                configuredTypes.map((type) => type.name),
            ],
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
                    enum: promptQuestionEnum(configuredTypes),
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
