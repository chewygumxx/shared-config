// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
//
// ~chewygumxx/shared-config.git
// ::: :/scripts/check-workspace-versions.mjs
//
//

import { dirname } from "node:path";

const lockfile = Bun.JSONC.parse(await Bun.file("bun.lock").text());
const manifests = new Bun.Glob("packages/*/package.json");

for await (const path of manifests.scan()) {
    const { version } = await Bun.file(path).json();
    const lockedVersion = lockfile.workspaces[dirname(path)]?.version;
    if (lockedVersion !== version) {
        console.error(
            `${path} is ${version}, but bun.lock records ${lockedVersion ?? "no version"}.`,
        );
        process.exitCode = 1;
    }
}
