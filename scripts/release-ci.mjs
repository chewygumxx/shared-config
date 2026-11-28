// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
// ~chewygumxx/shared-config.git
// ::: :/scripts/release-ci.mjs
//

import { setTimeout as delay } from "node:timers/promises";
import { run } from "../packages/create-repo/lib/run.js";

export async function requireCI(api, { event, sha, ref, jobs, repository }) {
    const deadline = Date.now() + 4 * 60 * 1000;
    const query = new URLSearchParams({
        event,
        head_sha: sha,
        branch: ref,
        per_page: "10",
    });
    while (true) {
        const {
            workflow_runs: [ci],
        } = await api(`actions/workflows/ci.yaml/runs?${query}`);
        if (ci?.status === "completed") {
            if (
                ci.head_sha !== sha ||
                ci.conclusion !== "success" ||
                ci.head_repository?.full_name !== repository
            )
                throw new Error(
                    `CI did not pass for ${sha}. See ${ci.html_url}`,
                );
            const { jobs: results } = await api(
                `actions/runs/${ci.id}/jobs?per_page=100`,
            );
            if (
                !jobs.every((name) =>
                    results.some(
                        (job) =>
                            job.name === name && job.conclusion === "success",
                    ),
                )
            )
                throw new Error(
                    `CI for ${sha} is missing required checks. See ${ci.html_url}`,
                );
            console.error(`CI approved ${sha} at ${ci.html_url}`);
            return ci.id;
        }
        if (Date.now() >= deadline)
            throw new Error(
                `Timed out waiting for CI on ${sha}. Run Release Please again after CI passes.`,
            );
        await delay(10000);
    }
}

export async function requireReleaseArtifacts(api, repository, sha) {
    const runId = await requireCI(api, {
        event: "push",
        sha,
        ref: "main",
        repository,
        jobs: ["check / check", "release-artifacts"],
    });
    const { artifacts } = await api(
        `actions/runs/${runId}/artifacts?per_page=100`,
    );
    const prefix = `release-${sha}-`;
    // Prefer the original bundle. A rerun may supply a replacement after expiry.
    const artifact = artifacts
        .filter(
            ({ name, expired }) =>
                !expired &&
                name.startsWith(prefix) &&
                /^\d+$/.test(name.slice(prefix.length)),
        )
        .sort((a, b) => a.id - b.id)[0];
    if (!artifact)
        throw new Error(
            `No verified release artifact for ${sha} in CI run ${runId}`,
        );
    return { runId, artifactId: artifact.id };
}

if (import.meta.main) {
    const [sha] = process.argv.slice(2);
    const repository = process.env.GITHUB_REPOSITORY;
    if (!repository || !/^[a-f0-9]{40}$/.test(sha))
        throw new Error(
            "Release artifact lookup requires GITHUB_REPOSITORY and a release SHA",
        );
    const api = async (path) => {
        const { stdout } = await run(
            "gh",
            ["api", `repos/${repository}/${path}`],
            { capture: true },
        );
        return JSON.parse(stdout);
    };
    console.log(
        JSON.stringify(await requireReleaseArtifacts(api, repository, sha)),
    );
}
