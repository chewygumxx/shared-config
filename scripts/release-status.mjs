// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
// ~chewygumxx/shared-config.git
// ::: :/scripts/release-status.mjs
//

import { basename } from "node:path";
import { parseArgs } from "node:util";
import { run } from "../packages/create-repo/lib/run.js";
import { registryState } from "./npm-registry.mjs";

const manifestPath = ".config/release-please-manifest.json";
const releaseBranch = "release-please--branches--main";

const output = async (file, args) =>
    (await run(file, args, { capture: true })).stdout.trim();
const github = async (args) => JSON.parse(await output("gh", args));

async function readRef(ref, repo) {
    if (
        repo &&
        !Bun.spawnSync(["git", "cat-file", "-e", `${ref}^{commit}`]).success
    ) {
        return async (path) => {
            const { content } = await github([
                "api",
                `repos/${repo}/contents/${path}?ref=${ref}`,
            ]);
            return Buffer.from(content, "base64").toString("utf8");
        };
    }
    const commit = await output("git", [
        "rev-parse",
        "--verify",
        "--end-of-options",
        `${ref}^{commit}`,
    ]);
    return (path) => output("git", ["show", `${commit}:${path}`]);
}

async function select(base, main) {
    if (base) {
        return {
            source: "working tree",
            base: await readRef(base),
            head: (path) => Bun.file(path).text(),
        };
    }
    const { nameWithOwner: repo } = await github([
        "repo",
        "view",
        "--json",
        "nameWithOwner",
    ]);
    const pullRequests = main
        ? []
        : await github([
              "pr",
              "list",
              "--repo",
              repo,
              "--base",
              "main",
              "--head",
              releaseBranch,
              "--json",
              "baseRefOid,headRefOid,isCrossRepository,number,url",
          ]);
    const pr = pullRequests.find(({ isCrossRepository }) => !isCrossRepository);
    if (pr) {
        return {
            source: `release PR #${pr.number}`,
            url: pr.url,
            repo,
            base: await readRef(pr.baseRefOid, repo),
            head: await readRef(pr.headRefOid, repo),
        };
    }

    const { sha } = await github(["api", `repos/${repo}/commits/main`]);
    return { source: "main", repo, head: await readRef(sha, repo) };
}

async function publishStates(repo, rows) {
    const runs = await github([
        "run",
        "list",
        "--repo",
        repo,
        "--workflow",
        "publish.yaml",
        "--event",
        "release",
        "--limit",
        "100",
        "--json",
        "headBranch,databaseId,status,conclusion,url",
    ]);
    for (const row of rows) {
        const latest = runs.find((run) => run.headBranch === row.tag);
        if (!latest) continue;

        let accepted = latest.conclusion === "success";
        if (!accepted) {
            const { jobs } = await github([
                "run",
                "view",
                String(latest.databaseId),
                "--repo",
                repo,
                "--json",
                "jobs",
            ]);
            accepted = jobs.some(
                (job) => job.name === "publish" && job.conclusion === "success",
            );
        }
        row.publish = {
            state: accepted ? "accepted" : latest.conclusion || latest.status,
            url: latest.url,
        };
    }
}

async function main() {
    const { values } = parseArgs({
        options: {
            base: { type: "string" },
            check: { type: "boolean" },
            json: { type: "boolean" },
            main: { type: "boolean" },
        },
    });
    const { source, url, repo, head, base } = await select(
        values.base,
        values.main,
    );
    if (values.check && !base) throw new Error("No proposed release to check");

    const [versions, lockfile, previous, tags] = await Promise.all([
        head(manifestPath).then(JSON.parse),
        head("bun.lock").then(Bun.JSONC.parse),
        base ? base(manifestPath).then(JSON.parse) : {},
        output("git", ["ls-remote", "--tags", "--refs", "origin"]).then(
            (refs) =>
                new Map(
                    refs
                        .split("\n")
                        .filter(Boolean)
                        .map((line) => {
                            const [sha, name] = line.split("\t");
                            return [name, sha];
                        }),
                ),
        ),
    ]);
    const allRows = await Promise.all(
        Object.entries(versions).map(async ([path, version]) => {
            const proposed = Boolean(base && previous[path] !== version);
            const component = basename(path);
            const name = `@chewygumxx/${component}`;
            const tag = `${component}@${version}`;
            const workspace = JSON.parse(await head(`${path}/package.json`));
            const lockfileVersion = lockfile.workspaces[path]?.version ?? null;
            const tagSha = tags.get(`refs/tags/${tag}`) ?? null;
            const issues = [];
            if (
                workspace.name !== name ||
                workspace.private ||
                workspace.publishConfig?.access !== "public"
            ) {
                issues.push(`Expected public workspace ${name}`);
            }
            if (workspace.version !== version)
                issues.push(
                    `package.json is ${workspace.version}, expected ${version}`,
                );
            if (lockfileVersion !== version)
                issues.push(
                    `bun.lock is ${lockfileVersion ?? "missing"}, expected ${version}`,
                );
            if (proposed && tagSha)
                issues.push(`Git tag ${tag} already exists at ${tagSha}`);

            let registry = null;
            if (!base || proposed) {
                try {
                    registry = await registryState(name, version);
                    if (proposed && registry !== "missing")
                        issues.push(`npm already lists ${name}@${version}`);
                } catch (error) {
                    registry = "error";
                    issues.push(error.message);
                }
            }
            return {
                path,
                name,
                version,
                tag,
                tagSha,
                registry,
                issues,
                proposed,
                workspaceVersion: workspace.version,
                lockfileVersion,
                publish: null,
            };
        }),
    );
    const rows = allRows.filter(
        (row) => !base || row.proposed || row.issues.length,
    );
    if (repo && !values.check && !base) await publishStates(repo, rows);

    if (values.json)
        console.log(JSON.stringify({ source, url, packages: rows }, null, 2));
    else {
        console.log(url ? `${source} | ${url}` : source);
        for (const row of rows) {
            const tag = row.tagSha
                ? `Git tag ${row.tagSha.slice(0, 12)}`
                : "Git tag absent";
            const publish = row.publish
                ? `, publish ${row.publish.state} (${row.publish.url})`
                : "";
            const registry = row.registry ? `, registry ${row.registry}` : "";
            console.log(
                `${row.name}@${row.version} | ${tag}${registry}${publish}`,
            );
            for (const issue of row.issues) console.log(`  ${issue}`);
        }
        if (!rows.length) console.log("No package version changes");
    }
    if (values.check && rows.some(({ issues }) => issues.length))
        process.exitCode = 1;
}

try {
    await main();
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
}
