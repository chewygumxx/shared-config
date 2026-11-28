// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
// ~chewygumxx/shared-config.git
// ::: :/scripts/release-please.mjs
//

import { GitHub, Manifest } from "release-please";
import { run } from "../packages/create-repo/lib/run.js";
import { branch, requireReleaseApproval } from "./release-approval.mjs";
import { bunLockfilePlugin, releaseManifest } from "./release-proposal.mjs";

const repository = process.env.GITHUB_REPOSITORY;
const token = process.env.RELEASE_TOKEN;
if (!repository || !token)
    throw new Error(
        "Release Please requires GITHUB_REPOSITORY and RELEASE_TOKEN",
    );
const [owner, repo] = repository.split("/");
const api = async (path) => {
    const { stdout } = await run("gh", ["api", `repos/${repository}/${path}`], {
        capture: true,
    });
    return JSON.parse(stdout);
};
const { stdout: head } = await run("git", ["rev-parse", "HEAD"], {
    capture: true,
});
const confirmBase = async () => {
    const { object } = await api(`git/ref/heads/${branch}`);
    if (object.sha !== head.trim())
        throw new Error(
            "main advanced during release preparation. Run Release Please again.",
        );
};
await confirmBase();

const github = await GitHub.create({
    owner,
    repo,
    token,
    defaultBranch: branch,
});
const manifest = await Manifest.fromManifest(
    github,
    branch,
    ".config/release-please.json",
    releaseManifest,
);
manifest.plugins.push(bunLockfilePlugin(github, branch, confirmBase));

// Check the candidates that Release Please will actually hand to GitHub.
const buildReleases = manifest.buildReleases.bind(manifest);
manifest.buildReleases = async () => {
    const candidates = await buildReleases();
    await requireReleaseApproval(api, repository, candidates);
    return candidates;
};
await manifest.createReleases();
await confirmBase();
await manifest.createPullRequests();
