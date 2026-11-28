// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
// ~chewygumxx/shared-config.git
// ::: :/scripts/rehearse-release.mjs
//

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { run } from "../packages/create-repo/lib/run.js";
import { registryState, waitForRegistry } from "./npm-registry.mjs";
import {
    applyReleaseChanges,
    bunLockfilePlugin,
    releaseManifest,
    withDetachedCheckout,
} from "./release-proposal.mjs";

const paths = ["packages/cspell-config", "packages/biome-config"];

function updateJson(path, key, value) {
    return {
        path,
        createIfMissing: false,
        updater: {
            updateContent(content) {
                const json = JSON.parse(content);
                json[key] = value;
                return `${JSON.stringify(json, null, 4)}\n`;
            },
        },
    };
}

async function prepare(output) {
    const { GitHub } = await import("release-please");
    const manifest = await Bun.file(releaseManifest).json();
    const candidates = paths.map((path) => {
        const [major, minor, patch] = manifest[path]
            .split(/[+-]/)[0]
            .split(".")
            .map(Number);
        const version = `${major}.${minor}.${patch + 1}-rehearsal.0`;
        return {
            pullRequest: {
                updates: [
                    updateJson(`${path}/package.json`, "version", version),
                    updateJson(releaseManifest, path, version),
                ],
            },
        };
    });
    // Release Please renders its normal combined changes against local files.
    const github = {
        buildChangeSet: GitHub.prototype.buildChangeSet,
        async getFileContentsOnBranch(path) {
            const content = await Bun.file(path).text();
            return {
                content: Buffer.from(content).toString("base64"),
                parsedContent: content,
            };
        },
    };
    await bunLockfilePlugin(github, "main", () => {}).run(candidates);
    const updates = candidates.flatMap(
        ({ pullRequest }) => pullRequest.updates,
    );
    const changes = await github.buildChangeSet(updates, "main");
    await mkdir(output, { recursive: true });

    await withDetachedCheckout(async (cwd) => {
        await applyReleaseChanges(cwd, changes);
        const { stdout: patch } = await run(
            "git",
            ["diff", "--binary", "--no-textconv", "--no-ext-diff"],
            { cwd, capture: true },
        );
        await Bun.write(join(output, "release.patch"), patch);
        const packages = [];
        for (const path of paths) {
            const { stdout } = await run(
                "npm",
                [
                    "pack",
                    "--json",
                    "--ignore-scripts",
                    "--workspace",
                    path,
                    "--pack-destination",
                    output,
                ],
                { cwd, capture: true },
            );
            const packed = JSON.parse(stdout);
            const [{ name, version, filename, integrity }] = Array.isArray(
                packed,
            )
                ? packed
                : Object.values(packed);
            packages.push({ path, name, version, filename, integrity });
            console.log(`Packed ${name}@${version}`);
        }
        await Bun.write(
            join(output, "packages.json"),
            JSON.stringify(packages),
        );
    });
}

async function verify(output) {
    const packages = await Bun.file(join(output, "packages.json")).json();
    assert.deepEqual(
        packages.map(({ path }) => path),
        paths,
    );
    const preload = join(output, "registry.mjs");
    await Bun.write(
        preload,
        "globalThis.fetch = async () => new Response(null, { status: 404 });\n",
    );
    await run(process.execPath, [
        "--preload",
        preload,
        "scripts/release-status.mjs",
        "--check",
        "--base",
        "HEAD",
    ]);

    for (const { path, name, version, filename, integrity } of packages) {
        const tarball = join(output, filename);
        const { stdout } = await run(
            "tar",
            ["-xOzf", tarball, "package/package.json"],
            { capture: true },
        );
        const packed = JSON.parse(stdout);
        const workspace = await Bun.file(`${path}/package.json`).json();
        assert.equal(name, workspace.name);
        assert.equal(version, workspace.version);
        assert.equal(packed.name, name);
        assert.equal(packed.version, version);
        const bytes = await Bun.file(tarball).arrayBuffer();
        const digest = createHash("sha512")
            .update(Buffer.from(bytes))
            .digest("base64");
        assert.equal(integrity, `sha512-${digest}`);

        const metadata = `https://registry.npmjs.org/${encodeURIComponent(name)}/${version}`;
        const url = `https://registry.npmjs.org/${name}/-/${filename}`;
        let metadataReads = 0;
        let tarballReads = 0;
        const request = async (input) => {
            if (String(input) === metadata) {
                if (++metadataReads === 1)
                    return new Response(null, { status: 404 });
                return Response.json({
                    name,
                    version,
                    dist: { integrity, tarball: url },
                });
            }
            assert.equal(String(input), url);
            if (++tarballReads === 1)
                return new Response(null, { status: 404 });
            return new Response(bytes);
        };
        await waitForRegistry([{ name, version }], {
            read: (name, version) => registryState(name, version, request),
            interval: 1,
            timeout: 1000,
        });
        assert.equal(metadataReads, 3);
        assert.equal(tarballReads, 2);
    }
}

const [mode, directory] = process.argv.slice(2);
if (!directory || !["prepare", "verify"].includes(mode))
    throw new Error(
        "Usage: bun scripts/rehearse-release.mjs prepare|verify <artifact directory>",
    );
await (mode === "prepare" ? prepare : verify)(resolve(directory));
