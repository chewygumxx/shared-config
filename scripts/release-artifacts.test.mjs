// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
// ~chewygumxx/shared-config.git
// ::: :/scripts/release-artifacts.test.mjs
//

import { test } from "bun:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { registryState, waitForRegistry } from "./npm-registry.mjs";
import { selectReleaseTarball } from "./release-artifacts.mjs";
import { releaseManifest } from "./release-proposal.mjs";

test("Publish rejects an artifact for another commit or with changed bytes", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "release-artifact-test-"));
    try {
        const path = "packages/hk-config";
        const name = "@chewygumxx/hk-config";
        const version = "0.3.9";
        const filename = "hk-config.tgz";
        await mkdir(join(cwd, ".config"));
        await mkdir(join(cwd, path), { recursive: true });
        await Bun.write(
            join(cwd, releaseManifest),
            JSON.stringify({ [path]: version }),
        );
        await Bun.write(
            join(cwd, path, "package.json"),
            JSON.stringify({
                name,
                version,
                publishConfig: { access: "public" },
            }),
        );
        await Bun.write(join(cwd, filename), "different bytes");
        await Bun.write(
            join(cwd, "packages.json"),
            JSON.stringify({
                sha: "approved",
                packages: [
                    {
                        name,
                        version,
                        path,
                        filename,
                        integrity: "sha512-original",
                    },
                ],
            }),
        );
        const select = (sha) =>
            selectReleaseTarball(cwd, cwd, sha, `hk-config@${version}`);
        await assert.rejects(select("other"), /CI artifact is for approved/);
        await assert.rejects(
            select("approved"),
            /CI tarball integrity mismatch/,
        );
    } finally {
        await rm(cwd, { recursive: true, force: true });
    }
});

test("registry verification rejects a different integrity without retrying", async () => {
    const name = "@chewygumxx/hk-config";
    const version = "0.3.9";
    let requests = 0;
    const request = async () => {
        requests += 1;
        return Response.json({
            name,
            version,
            dist: { integrity: "sha512-other" },
        });
    };
    await assert.rejects(
        waitForRegistry([{ name, version }], {
            read: (name, version) =>
                registryState(name, version, request, "sha512-ci"),
            interval: 1,
            timeout: 1000,
        }),
        /does not match the verified CI tarball/,
    );
    assert.equal(requests, 1);
});
