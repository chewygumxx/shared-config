// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
// ~chewygumxx/shared-config.git
// ::: :/scripts/release-approval.mjs
//

import { requireCI, requireReleaseArtifacts } from "./release-ci.mjs";
import { releaseManifest } from "./release-proposal.mjs";

export const branch = "main";
export const releaseBranch = "release-please--branches--main";

async function requireSameReleaseFiles(api, approved, merged) {
    const [before, after] = await Promise.all([
        api(`git/commits/${approved}`),
        api(`git/commits/${merged}`),
    ]);
    if (before.tree.sha === after.tree.sha) return;

    // A merge can pick up unrelated changes on main. Its release files must
    // still match the approved PR, and CI also checks the actual merge SHA.
    const files = async (sha) => {
        const { tree, truncated } = await api(`git/trees/${sha}?recursive=1`);
        if (truncated)
            throw new Error("Cannot compare a truncated release tree");
        return tree
            .filter(
                ({ path }) =>
                    path === "bun.lock" ||
                    path === "package.json" ||
                    path === ".config/release-please.json" ||
                    path === releaseManifest ||
                    /^packages\/[^/]+\/package\.json$/.test(path),
            )
            .map(({ path, sha }) => `${path}:${sha}`)
            .sort()
            .join("\n");
    };
    const [approvedFiles, mergedFiles] = await Promise.all([
        files(before.tree.sha),
        files(after.tree.sha),
    ]);
    if (approvedFiles !== mergedFiles)
        throw new Error(
            `Release files at ${merged} differ from approved PR head ${approved}`,
        );
}

export async function requireReleaseApproval(api, repository, candidates) {
    const merges = new Map(
        candidates.map(({ sha, pullRequest }) => [pullRequest.number, sha]),
    );
    for (const [number, sha] of merges) {
        const pr = await api(`pulls/${number}`);
        if (
            !pr.merged ||
            pr.merge_commit_sha !== sha ||
            pr.head.repo?.full_name !== repository ||
            pr.head.ref !== releaseBranch ||
            pr.base.ref !== branch
        ) {
            throw new Error(
                `Release #${number} does not match merged commit ${sha}`,
            );
        }
        await Promise.all([
            requireSameReleaseFiles(api, pr.head.sha, sha),
            requireCI(api, {
                event: "pull_request",
                sha: pr.head.sha,
                ref: releaseBranch,
                repository,
                jobs: ["release-preflight", "check / check"],
            }),
            requireReleaseArtifacts(api, repository, sha),
        ]);
    }
}
