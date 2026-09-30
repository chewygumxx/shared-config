// vim:set expandtab shiftwidth=4 filetype=typescript:
// SPDX-License-Identifier: GPL-3.0-only

//
//
// ~chewygumxx/shared-config.git
// ::: :/packages/cz-commitlint/index.d.ts
//
//

import type { UserPromptConfig } from "@commitlint/types";

/** The part of an inquirer question that {@link relabel} reads. */
export interface Question {
    name: string;
    choices?: unknown[];
    [key: string]: unknown;
}

export type PromptQuestions = NonNullable<UserPromptConfig["questions"]>;

/** The inquirer instance commitizen hands its adapter. */
export interface Inquirer {
    prompt(questions: Question[], ...rest: unknown[]): Promise<unknown>;
    [key: string]: unknown;
}

export declare function relabel(
    questions: Question[],
    promptQuestions?: PromptQuestions,
): Question[];

export declare function prompter(
    inquirer: Inquirer,
    commit: (message: string) => void,
): void;
