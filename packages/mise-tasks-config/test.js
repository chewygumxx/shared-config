// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
//
// ~chewygumxx/shared-config.git
// ::: :/packages/mise-tasks-config/test.js
//
//

// @ts-check

import { afterAll, beforeAll, test } from "bun:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmod, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("bin/cgxx-hk", import.meta.url));

/** @type {string} */
let dir;
/** @type {string} */
let repo;

// A stand-in hk that prints its arguments, then the files it reads from
// stdin under --files0-from, one per line.
const fakeHk = `#!/bin/sh
echo "$*"
case " $* " in
*" --files0-from - "*) tr '\\0' '\\n' ;;
esac
`;

// Without git's own variables, which a git hook running these tests sets,
// so git acts on the scratch repository rather than the hook's.
const env = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_")),
);

/** @param {string[]} args */
function git(...args) {
    const result = spawnSync("git", args, { cwd: repo, encoding: "utf8", env });
    assert.equal(result.status, 0, result.stderr);
}

beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), "cgxx-hk-"));
    const bin = join(dir, "bin");
    repo = join(dir, "repo");
    await mkdir(bin);
    await mkdir(repo);
    await writeFile(join(bin, "hk"), fakeHk);
    await chmod(join(bin, "hk"), 0o755);
    git("init", "--quiet");
    await writeFile(join(repo, "bun.lock"), "{}\n");
    await writeFile(join(repo, "a.md"), "a\n");
    git("add", ".");
    git("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-qm", "init");
});

afterAll(async () => {
    await rm(dir, { recursive: true, force: true });
});

/**
 * Runs cgxx-hk with the given mise flag variables and returns hk's lines.
 *
 * @param {string} hook
 * @param {Record<string, string>} [env]
 */
function run(hook, env = {}) {
    const result = spawnSync(script, [hook], {
        cwd: repo,
        encoding: "utf8",
        env: {
            PATH: `${join(dir, "bin")}:${process.env.PATH}`,
            HOME: dir,
            ...env,
        },
    });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trimEnd().split("\n");
}

/**
 * Runs `body` with `bun.lock` changed, staged or not, and an untracked
 * file present, restoring the repository afterwards.
 *
 * @param {boolean} stage
 * @param {() => void} body
 */
async function withLockChange(stage, body) {
    await writeFile(join(repo, "bun.lock"), "{ }\n");
    await writeFile(join(repo, "untracked.md"), "u\n");
    if (stage) git("add", "bun.lock");
    try {
        body();
    } finally {
        git("reset", "--quiet", "--hard");
        git("clean", "--quiet", "--force");
    }
}

test("no flag selects the changed files", () => {
    assert.deepEqual(run("check"), ["check --quiet --no-fail-fast"]);
});

test("--staged selects the staged files", () => {
    assert.deepEqual(run("check", { usage_staged: "true" }), [
        "check --staged --quiet --no-fail-fast",
    ]);
});

test("--all selects every file", () => {
    assert.deepEqual(run("check", { usage_all: "true" }), [
        "check --all --quiet --no-fail-fast",
    ]);
});

test("fix never stages, and steps are passed on", () => {
    assert.deepEqual(run("fix", { usage_step: "biome tombi" }), [
        "fix --step biome --step tombi --quiet --no-fail-fast --no-stage",
    ]);
});

test("--verbose shows hk debug output", () => {
    assert.deepEqual(run("check", { usage_verbose: "true" }), [
        "check --verbose --no-fail-fast",
    ]);
});

test("a changed lockfile widens to every file", async () => {
    await withLockChange(false, () => {
        assert.deepEqual(run("check"), ["check --all --quiet --no-fail-fast"]);
    });
});

test("a staged lockfile widens --staged to the index alone", async () => {
    await withLockChange(true, () => {
        assert.deepEqual(run("check", { usage_staged: "true" }), [
            "check --files0-from - --quiet --no-fail-fast",
            "a.md",
            "bun.lock",
        ]);
    });
});

test("an unstaged lockfile leaves --staged narrow", async () => {
    await withLockChange(false, () => {
        assert.deepEqual(run("check", { usage_staged: "true" }), [
            "check --staged --quiet --no-fail-fast",
        ]);
    });
});

test("--staged and --all exclude each other", () => {
    const result = spawnSync(script, ["check"], {
        cwd: repo,
        env: { ...env, usage_staged: "true", usage_all: "true" },
    });
    assert.equal(result.status, 2);
});
