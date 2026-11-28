// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
// ~chewygumxx/shared-config.git
// ::: :/scripts/release-artifacts.mjs
//

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { run } from "../packages/create-repo/lib/run.js";
import { releaseManifest } from "./release-proposal.mjs";

const componentPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const number = "(0|[1-9][0-9]*)";
const identifier = `(${number}|[0-9]*[a-zA-Z-][a-zA-Z0-9-]*)`;
const versionPattern = new RegExp(
    String.raw`^${number}\.${number}\.${number}(-${identifier}(\.${identifier})*)?(\+[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*)?$`,
);
const root = fileURLToPath(new URL("..", import.meta.url));
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const integrityOf = (bytes) =>
    `sha512-${createHash("sha512").update(bytes).digest("base64")}`;

function verifyManifest(pkg, name, version) {
    if (pkg.name !== name || pkg.version !== version)
        throw new Error(
            `Expected ${name}@${version}, got ${pkg.name}@${pkg.version}`,
        );
    if (
        (pkg.private != null && pkg.private !== false) ||
        pkg.publishConfig?.access !== "public"
    )
        throw new Error(`${name}@${version} must be public`);
}

export function npmResult(stdout) {
    const json = JSON.parse(stdout);
    const records = Array.isArray(json)
        ? json
        : json.name
          ? [json]
          : Object.values(json);
    if (records.length !== 1 || !records[0]?.name)
        throw new Error("Expected one package in the npm result");
    return records[0];
}

async function workspace(cwd, component, version) {
    if (!componentPattern.test(component) || !versionPattern.test(version))
        throw new Error(`Invalid release tag ${component}@${version}`);
    const path = `packages/${component}`;
    const name = `@chewygumxx/${component}`;
    const pkg = await readJson(join(cwd, path, "package.json"));
    verifyManifest(pkg, name, version);
    return { path, name, version, filename: `${component}.tgz` };
}

async function verifyTarball(record, directory) {
    const tarball = join(directory, record.filename);
    if (integrityOf(await readFile(tarball)) !== record.integrity)
        throw new Error(
            `CI tarball integrity mismatch for ${record.name}@${record.version}`,
        );
    const { stdout } = await run(
        "tar",
        ["-xOzf", tarball, "package/package.json"],
        { capture: true },
    );
    verifyManifest(JSON.parse(stdout), record.name, record.version);
    return tarball;
}

export async function packReleaseArtifacts(cwd, base, directory) {
    const { stdout: before } = await run(
        "git",
        ["show", `${base}:${releaseManifest}`],
        { cwd, capture: true },
    );
    const previous = JSON.parse(before);
    const versions = await readJson(join(cwd, releaseManifest));
    const { stdout: head } = await run("git", ["rev-parse", "HEAD"], {
        cwd,
        capture: true,
    });
    const packages = [];
    await mkdir(directory, { recursive: true });
    for (const [path, version] of Object.entries(versions)) {
        if (version === previous[path]) continue;

        const record = await workspace(cwd, basename(path), version);
        if (record.path !== path)
            throw new Error(`Invalid release workspace ${path}`);
        const { stdout } = await run(
            "npm",
            [
                "pack",
                "--json",
                "--ignore-scripts",
                "--workspace",
                path,
                "--pack-destination",
                directory,
            ],
            { cwd, capture: true },
        );
        const artifact = npmResult(stdout);
        if (artifact.name !== record.name || artifact.version !== version)
            throw new Error(
                `npm did not pack exactly ${record.name}@${version}`,
            );
        if (
            basename(artifact.filename) !== artifact.filename ||
            !artifact.filename.endsWith(".tgz")
        )
            throw new Error(
                `Invalid npm tarball filename ${artifact.filename}`,
            );
        await rename(
            join(directory, artifact.filename),
            join(directory, record.filename),
        );
        record.integrity = artifact.integrity;
        const tarball = await verifyTarball(record, directory);
        // Use the same checks as workspace lint, against this archive.
        await run("bun", ["run", "publint", "--level", "warning", tarball], {
            cwd: root,
        });
        if (existsSync(join(cwd, path, "index.d.ts"))) {
            await run(
                "bun",
                ["run", "attw", tarball, "--profile", "esm-only"],
                { cwd: root },
            );
        }
        if (record.path === "packages/create-repo") {
            await run(
                "bun",
                [
                    "packages/create-repo/scripts/verify-templates.js",
                    "--registry",
                    "--tarball",
                    tarball,
                ],
                { cwd: root },
            );
        }
        packages.push(record);
        console.log(`Verified ${record.name}@${version} | ${record.integrity}`);
    }
    if (!packages.length) throw new Error("No changed versions to pack");
    const bundle = { sha: head.trim(), packages };
    await writeFile(
        join(directory, "packages.json"),
        `${JSON.stringify(bundle, null, 4)}\n`,
    );
    return bundle;
}

export async function selectReleaseTarball(cwd, directory, sha, tag) {
    const [component, version, extra] = tag.split("@");
    if (!version || extra !== undefined)
        throw new Error(`Invalid release tag ${tag}`);
    const record = await workspace(cwd, component, version);
    const versions = await readJson(join(cwd, releaseManifest));
    if (versions[record.path] !== version)
        throw new Error(`Release manifest does not contain ${tag}`);
    const bundle = await readJson(join(directory, "packages.json"));
    if (bundle.sha !== sha)
        throw new Error(`CI artifact is for ${bundle.sha}, expected ${sha}`);
    const matches = bundle.packages.filter(({ path }) => path === record.path);
    if (matches.length !== 1)
        throw new Error(`Expected one verified tarball for ${tag}`);
    const [match] = matches;
    if (
        match.name !== record.name ||
        match.version !== version ||
        match.filename !== record.filename
    )
        throw new Error(`CI tarball record does not match ${tag}`);
    record.integrity = match.integrity;
    const tarball = await verifyTarball(record, directory);
    return { ...record, tarball };
}

if (import.meta.main) {
    const [mode, destination, ...args] = process.argv.slice(2);
    if (mode === "pack" && destination && args.length === 1) {
        await packReleaseArtifacts(
            process.cwd(),
            args[0],
            resolve(destination),
        );
    } else if (mode === "select" && destination && args.length === 2) {
        console.log(
            JSON.stringify(
                await selectReleaseTarball(
                    process.cwd(),
                    resolve(destination),
                    ...args,
                ),
            ),
        );
    } else {
        throw new Error(
            "Use pack <directory> <base> or select <directory> <sha> <tag>",
        );
    }
}
