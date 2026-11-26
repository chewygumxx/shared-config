// vim:set expandtab shiftwidth=4 filetype=typescript:
// SPDX-License-Identifier: GPL-3.0-only

//
//
// ~chewygumxx/shared-config.git
// ::: :/.commitlintrc.mts
//
//

import { defineConfig } from "@chewygumxx/commitlint-config";
import type { UserConfig } from "cz-git";

// One scope per published package.
const config = defineConfig({
    scopes: [
        {
            name: "create-repo",
            fullName: "Repository scaffolder",
            description: "@chewygumxx/create-repo",
        },
        {
            name: "commitlint",
            fullName: "commitlint",
            description: "@chewygumxx/commitlint-config",
        },
        {
            name: "tombi",
            fullName: "tombi",
            description: "@chewygumxx/tombi-config",
        },
        {
            name: "cz",
            fullName: "commitizen",
            description: "@chewygumxx/cz-commitlint",
        },
        {
            name: "biome",
            fullName: "Biome",
            description: "@chewygumxx/biome-config",
        },
        {
            name: "remark",
            fullName: "remark",
            description: "@chewygumxx/remark-preset",
        },
        {
            name: "markdownlint",
            fullName: "markdownlint",
            description: "@chewygumxx/markdownlint-cli2-config",
        },
        {
            name: "yamllint",
            fullName: "yamllint",
            description: "@chewygumxx/yamllint-config",
        },
        {
            name: "tsconfig",
            fullName: "TypeScript",
            description: "@chewygumxx/tsconfig",
        },
        {
            name: "prettier",
            fullName: "Prettier",
            description: "@chewygumxx/prettier-config",
        },
        {
            name: "cspell",
            fullName: "CSpell",
            description: "@chewygumxx/cspell-config",
        },
        {
            name: "secretlint",
            fullName: "secretlint",
            description: "@chewygumxx/secretlint-rule-preset",
        },
        {
            name: "shellcheck",
            fullName: "ShellCheck",
            description: "@chewygumxx/shellcheck-config",
        },
        {
            name: "editorconfig",
            fullName: "EditorConfig",
            description: "@chewygumxx/editorconfig-checker-config",
        },
        {
            name: "actionlint",
            fullName: "actionlint",
            description: "@chewygumxx/actionlint-config",
        },
        {
            name: "hk",
            fullName: "hk",
            description: "@chewygumxx/hk-config",
        },
        {
            name: "mise",
            fullName: "mise",
            description: "@chewygumxx/mise-tasks-config",
        },
    ],
});

const typeChoices = Object.entries(config.prompt?.questions?.type?.enum ?? {});
const scopeChoices = Object.entries(
    config.prompt?.questions?.scope?.enum ?? {},
);

const { settings } = config.prompt ?? {};

const prompt = {
    types: typeChoices.map(([value, { title, description }]) => ({
        value,
        name: `${title ?? value}    ${description ?? ""}`.trimEnd(),
    })),
    scopes: scopeChoices.map(([value, { title, description }]) => ({
        value,
        name: `${title ?? value}    ${description ?? ""}`.trimEnd(),
    })),
    typesSearchValue: true,
    scopesSearchValue: true,
    enableMultipleScopes: settings?.enableMultipleScopes,
    scopeEnumSeparator: settings?.scopeEnumSeparator,
    upperCaseSubject: true,
    markBreakingChangeMode: true,
    allowBreakingChanges: typeChoices.map(([value]) => value),
} satisfies NonNullable<UserConfig["prompt"]>;

export default { ...config, prompt: { ...config.prompt, ...prompt } };
