// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
// ~chewygumxx/shared-config.git
// ::: :/scripts/release-status.test.mjs
//

import { test } from "bun:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("release-status.mjs", import.meta.url));
const workspace = "packages/example-config";

function preflight({ staleTag = false, mismatchedManifest = false } = {}) {
    const cwd = mkdtempSync(join(tmpdir(), "release-preflight-"));
    const env = Object.fromEntries(
        Object.entries(process.env).filter(
            ([name]) => !name.startsWith("GIT_"),
        ),
    );
    const git = (...args) => {
        const result = Bun.spawnSync(["git", ...args], {
            cwd,
            env: { ...env, HK: "0" },
        });
        assert.equal(result.exitCode, 0, result.stderr.toString());
        return result.stdout.toString().trim();
    };
    const write = (path, value) =>
        writeFileSync(join(cwd, path), JSON.stringify(value));
    const versions = (workspaceVersion, releaseVersion) => {
        write(`${workspace}/package.json`, {
            name: "@chewygumxx/example-config",
            version: workspaceVersion,
            publishConfig: { access: "public" },
        });
        write("bun.lock", {
            workspaces: { [workspace]: { version: workspaceVersion } },
        });
        write(".config/release-please-manifest.json", {
            [workspace]: releaseVersion,
        });
    };

    try {
        mkdirSync(join(cwd, workspace), { recursive: true });
        mkdirSync(join(cwd, ".config"));
        git("init", "--quiet");
        git("remote", "add", "origin", cwd);
        versions("0.3.0", "0.3.0");
        git("add", ".");
        git(
            "-c",
            "user.name=Test",
            "-c",
            "user.email=test@example.com",
            "commit",
            "-qm",
            "Initial state",
        );
        const base = git("rev-parse", "HEAD");
        if (staleTag) git("tag", "example-config@0.3.1");

        versions("0.3.1", mismatchedManifest ? "0.3.0" : "0.3.1");
        const preload = join(cwd, "registry.mjs");
        writeFileSync(
            preload,
            "globalThis.fetch = async () => new Response(null, { status: 404 });\n",
        );
        const result = Bun.spawnSync(
            [
                process.execPath,
                "--preload",
                preload,
                script,
                "--base",
                base,
                "--check",
                "--json",
            ],
            { cwd, env },
        );
        assert.equal(result.stderr.toString(), "");
        const { packages } = JSON.parse(result.stdout.toString());
        assert.equal(packages.length, 1);
        return { code: result.exitCode, row: packages[0] };
    } finally {
        rmSync(cwd, { recursive: true, force: true });
    }
}

test("preflight accepts a fresh version with matching workspace and lockfile", () => {
    const { code, row } = preflight();
    assert.equal(code, 0);
    assert.equal(row.registry, "missing");
    assert.deepEqual(row.issues, []);
});

test("preflight rejects a stale tag even if npm never served the version", () => {
    const { code, row } = preflight({ staleTag: true });
    assert.equal(code, 1);
    assert.equal(row.registry, "missing");
    assert.match(
        row.issues[0],
        /Git tag example-config@0\.3\.1 already exists/,
    );
});

test("preflight detects a workspace version absent from the release manifest", () => {
    const { code, row } = preflight({ mismatchedManifest: true });
    assert.equal(code, 1);
    assert.equal(row.proposed, false);
    assert.deepEqual(row.issues, [
        "package.json is 0.3.1, expected 0.3.0",
        "bun.lock is 0.3.1, expected 0.3.0",
    ]);
});
