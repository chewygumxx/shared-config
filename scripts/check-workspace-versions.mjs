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

// hk-config runs the root's linter CLIs as its optional peers: each version
// bun.lock resolves for the root must fall within the peer range consumers
// are told, so a bump here prompts the range to follow.
const hkConfig = await Bun.file("packages/hk-config/package.json").json();
for (const [name, range] of Object.entries(hkConfig.peerDependencies ?? {})) {
    const resolved = lockfile.packages[name]?.[0];
    const version = resolved?.slice(resolved.lastIndexOf("@") + 1);
    if (!version) {
        console.error(`bun.lock resolves no ${name}, an hk-config peer.`);
        process.exitCode = 1;
    } else if (!Bun.semver.satisfies(version, range)) {
        console.error(
            `bun.lock resolves ${name} ${version}, outside hk-config's peer range ${range}.`,
        );
        process.exitCode = 1;
    }
}
