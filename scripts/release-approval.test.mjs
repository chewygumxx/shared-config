// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
// ~chewygumxx/shared-config.git
// ::: :/scripts/release-approval.test.mjs
//

import { test } from "bun:test";
import assert from "node:assert/strict";
import { requireReleaseApproval } from "./release-approval.mjs";

const repository = "example/shared-config";
const candidates = [{ sha: "merged", pullRequest: { number: 42 } }];

function fixture({
    preflight = "success",
    lock = "approved-lock",
    expired = false,
} = {}) {
    const urls = [];
    const api = (path) => {
        urls.push(path);
        if (path === "pulls/42") {
            return {
                merged: true,
                merge_commit_sha: "merged",
                head: {
                    ref: "release-please--branches--main",
                    sha: "approved",
                    repo: { full_name: repository },
                },
                base: { ref: "main" },
            };
        }
        if (path.startsWith("git/commits/"))
            return { tree: { sha: path.split("/").at(-1) } };
        if (path.startsWith("git/trees/")) {
            return {
                tree: [
                    {
                        path: "bun.lock",
                        sha: path.includes("/approved?")
                            ? "approved-lock"
                            : lock,
                    },
                ],
            };
        }
        if (path.startsWith("actions/workflows/ci.yaml/runs?")) {
            const query = new URLSearchParams(path.split("?")[1]);
            const sha = query.get("head_sha");
            assert.equal(
                query.get("event"),
                sha === "approved" ? "pull_request" : "push",
            );
            assert.equal(
                query.get("branch"),
                sha === "approved" ? "release-please--branches--main" : "main",
            );
            return {
                workflow_runs: [
                    {
                        id: sha,
                        head_sha: sha,
                        status: "completed",
                        conclusion: "success",
                        head_repository: { full_name: repository },
                        html_url: `https://example.test/ci/${sha}`,
                    },
                ],
            };
        }
        if (path === "actions/runs/merged/artifacts?per_page=100")
            return {
                artifacts: [{ id: 9, name: "release-merged-1", expired }],
            };
        if (path.startsWith("actions/runs/")) {
            const jobs = [{ name: "check / check", conclusion: "success" }];
            if (path.includes("/approved/"))
                jobs.push({ name: "release-preflight", conclusion: preflight });
            else
                jobs.push({ name: "release-artifacts", conclusion: "success" });
            return { jobs };
        }
        throw new Error(`Unexpected fixture request ${path}`);
    };
    return { api, urls };
}

test("release approval checks the PR head and the exact merged commit", async () => {
    const { api, urls } = fixture();
    await requireReleaseApproval(api, repository, candidates);
    assert.ok(urls.includes("actions/runs/approved/jobs?per_page=100"));
    assert.ok(urls.includes("actions/runs/merged/jobs?per_page=100"));
});

test("release approval requires a successful preflight on the PR head", async () => {
    const { api } = fixture({ preflight: "skipped" });
    await assert.rejects(
        requireReleaseApproval(api, repository, candidates),
        /missing required checks/,
    );
});

test("release approval catches a change to the approved lockfile during merge", async () => {
    const { api } = fixture({ lock: "different-lock" });
    await assert.rejects(
        requireReleaseApproval(api, repository, candidates),
        /differ from approved PR head/,
    );
});

test("release approval requires a downloadable CI bundle for the merge", async () => {
    const { api } = fixture({ expired: true });
    await assert.rejects(
        requireReleaseApproval(api, repository, candidates),
        /No verified release artifact for merged/,
    );
});
