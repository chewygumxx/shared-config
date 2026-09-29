// vim:set expandtab shiftwidth=4 filetype=typescript:
// SPDX-License-Identifier: GPL-3.0-only

//
//
// ~chewygumxx/shared-config.git
// ::: :/packages/commitlint-config/index.d.ts
//
//

import type { UserConfig } from "@commitlint/types";

/** A commit type or scope, as listed by the rules and the commit prompt. */
export interface Enumerable {
    name: string;
    fullName: string;
    description: string;
}

export interface Options {
    /** Permitted scopes; when empty or omitted, any scope is accepted. */
    scopes?: Enumerable[];
}

export declare const types: Enumerable[];

export declare function defineConfig(options?: Options): UserConfig;

declare const config: UserConfig;
export default config;
