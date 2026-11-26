// vim:set expandtab shiftwidth=4 filetype=typescript:
// SPDX-License-Identifier: GPL-3.0-only

//
//
// ~chewygumxx/repo-tmpl.git
// ::: :/.commitlintrc.mts
//
//

import { defineConfig } from "@chewygumxx/commitlint-config";
import type { UserConfig } from "cz-git";

// Types, limits and the prompt are shared; only the scopes are this
// repository's own.
const config = defineConfig({
    scopes: [
        {
            name: "agents",
            fullName: "Agents",
            description: "Agent instructions and skills",
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
