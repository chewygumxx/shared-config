// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
// ~chewygumxx/shared-config.git
// ::: :/scripts/release-proposal.mjs
//

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { run } from "../packages/create-repo/lib/run.js";

export const releaseManifest = ".config/release-please-manifest.json";

export async function withDetachedCheckout(work) {
    const scratch = await mkdtemp(join(tmpdir(), "release-proposal-"));
    const cwd = join(scratch, "checkout");
    let added = false;
    try {
        await run("git", [
            "worktree",
            "add",
            "--detach",
            "--quiet",
            cwd,
            "HEAD",
        ]);
        added = true;
        return await work(cwd);
    } finally {
        if (added) await run("git", ["worktree", "remove", "--force", cwd]);
        await rm(scratch, { recursive: true, force: true });
    }
}

export async function applyReleaseChanges(cwd, changes) {
    for (const [path, { content, originalContent }] of changes) {
        const file = Bun.file(join(cwd, path));
        if ((await file.text()) !== originalContent)
            throw new Error(
                `Base changed while preparing ${path}. Run Release Please again.`,
            );
        await Bun.write(file, content);
    }
}

async function prepareReleaseLock(changes) {
    return withDetachedCheckout(async (cwd) => {
        await applyReleaseChanges(cwd, changes);
        const lockfile = Bun.file(join(cwd, "bun.lock"));
        const original = await lockfile.text();
        const { GH_TOKEN, RELEASE_TOKEN, ...env } = process.env;
        await run(
            process.execPath,
            ["install", "--lockfile-only", "--ignore-scripts"],
            { cwd, env },
        );
        await run(process.execPath, ["scripts/check-workspace-versions.mjs"], {
            cwd,
            env,
        });
        return { original, content: await lockfile.text() };
    });
}

/** Attach the lockfile before Release Please merges the package candidates. */
export function bunLockfilePlugin(github, branch, confirmBase) {
    return {
        preconfigure: (strategies) => strategies,
        processCommits: (commits) => commits,
        async run(candidates) {
            if (candidates.length === 0) return candidates;

            await confirmBase();
            const updates = candidates.flatMap(
                ({ pullRequest }) => pullRequest.updates,
            );
            const manifests = updates.filter(
                ({ path }) =>
                    path === releaseManifest ||
                    /^packages\/[^/]+\/package\.json$/.test(path),
            );
            const changes = await github.buildChangeSet(manifests, branch);
            const lock = await prepareReleaseLock(changes);
            await confirmBase();
            candidates[0].pullRequest.updates.push({
                path: "bun.lock",
                createIfMissing: false,
                updater: {
                    updateContent(previous) {
                        if (previous !== lock.original)
                            throw new Error(
                                "bun.lock changed while preparing the release. Run Release Please again.",
                            );
                        return lock.content;
                    },
                },
            });
            return candidates;
        },
    };
}
