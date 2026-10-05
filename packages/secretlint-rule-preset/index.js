// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
//
// ~chewygumxx/shared-config.git
// ::: :/packages/secretlint-rule-preset/index.js
//
//

// @ts-check

// https://github.com/secretlint/secretlint#configuration
//
// The house rules: secretlint's recommended preset, which finds credentials
// by their format, and two rules for what these repositories should never
// track: a `.env` file, and a path into the author's home directory.

import { creator as noDotenv } from "@secretlint/secretlint-rule-no-dotenv";
import { creator as noHomedir } from "@secretlint/secretlint-rule-no-homedir";
import { rules as recommended } from "@secretlint/secretlint-rule-preset-recommend";

/** @typedef {import("@secretlint/types").SecretLintRulePresetCreator} SecretLintRulePresetCreator */
/** @typedef {import("@secretlint/types").SecretLintRuleCreator<unknown>} SecretLintRuleCreator */

/** @type {SecretLintRuleCreator[]} */
export const rules = [...recommended, noDotenv, noHomedir];

/** @type {SecretLintRulePresetCreator} */
export const creator = {
    meta: {
        id: "@chewygumxx/secretlint-rule-preset",
        type: "preset",
        recommended: true,
        docs: {
            url: "https://github.com/chewygumxx/shared-config/tree/main/packages/secretlint-rule-preset#readme",
        },
    },
    rules,
    create(context) {
        for (const rule of rules) {
            context.registerRule(rule);
        }
    },
};
