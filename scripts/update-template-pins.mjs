// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
// ~chewygumxx/shared-config.git
// ::: :/scripts/update-template-pins.mjs
//

import { mkdir, mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { parseArgs } from "node:util";
import { run } from "../packages/create-repo/lib/run.js";
import { waitForRegistry } from "./npm-registry.mjs";

const templates = "packages/create-repo/templates";
const biomeConfig = "@chewygumxx/biome-config";
const biome = "@biomejs/biome";
const stable = /^\d+\.\d+\.\d+$/;

const { values } = parseArgs({ options: { "dry-run": { type: "boolean" } } });
const manifest = await Bun.file(".config/release-please-manifest.json").json();
const released = new Map(
    Object.entries(manifest)
        .filter(
            ([path, version]) =>
                path !== "packages/create-repo" && stable.test(version),
        )
        .map(([path, version]) => [`@chewygumxx/${basename(path)}`, version]),
);
const pending = new Map();
const layers = [];
for (const layer of (await readdir(templates)).sort()) {
    const dir = join(templates, layer);
    const file = Bun.file(join(dir, "package.json"));
    if (!(await file.exists())) continue;
    const packageJson = await file.text();
    const pkg = JSON.parse(packageJson);
    const changes = new Map();
    for (const [name, range] of Object.entries(pkg.devDependencies)) {
        const version = released.get(name);
        if (!version) continue;
        const current = /^(\^?)(\d+\.\d+\.\d+)$/.exec(range);
        if (!current)
            throw new Error(
                `${layer} has an unsupported pin for ${name}: ${range}`,
            );
        if (Bun.semver.order(version, current[2]) <= 0) continue;

        pending.set(name, version);
        changes.set(name, `${current[1]}${version}`);
        console.log(`${layer} | ${name} ${range} to ${changes.get(name)}`);
    }
    if (changes.size) {
        const original = {
            "package.json": packageJson,
            "bun.lock": await Bun.file(join(dir, "bun.lock")).text(),
        };
        layers.push({ layer, dir, pkg, changes, original });
    }
}

if (pending.size && !values["dry-run"]) {
    await waitForRegistry(
        [...pending].map(([name, version]) => ({ name, version })),
    );

    // The published Biome config's schema names the matching CLI version.
    let biomeVersion;
    if (pending.has(biomeConfig)) {
        const ref = `refs/tags/biome-config@${pending.get(biomeConfig)}`;
        const { stdout } = await run(
            "git",
            ["show", `${ref}:packages/biome-config/config.json`],
            { capture: true },
        );
        const config = JSON.parse(stdout);
        biomeVersion =
            /^https:\/\/biomejs\.dev\/schemas\/(\d+\.\d+\.\d+)\/schema\.json$/.exec(
                config.$schema,
            )?.[1];
        if (!biomeVersion)
            throw new Error(
                `Cannot determine the Biome CLI version from ${ref}`,
            );
    }

    const scratch = await mkdtemp(join(tmpdir(), "template-pins-"));
    try {
        for (const { layer, dir, pkg, changes, original } of layers) {
            if (
                changes.has(biomeConfig) &&
                biomeVersion &&
                pkg.devDependencies[biome] &&
                Bun.semver.order(biomeVersion, pkg.devDependencies[biome]) > 0
            ) {
                console.log(
                    `${layer} | ${biome} ${pkg.devDependencies[biome]} to ${biomeVersion}`,
                );
                changes.set(biome, biomeVersion);
            }
            for (const [name, version] of changes)
                pkg.devDependencies[name] = version;

            const cwd = join(scratch, layer);
            await mkdir(cwd);
            await Bun.write(
                join(cwd, "package.json"),
                `${JSON.stringify(pkg, null, 4)}\n`,
            );
            await Bun.write(join(cwd, "bun.lock"), original["bun.lock"]);
            const bunfig = Bun.file(join(dir, "bunfig.toml"));
            if (await bunfig.exists())
                await Bun.write(join(cwd, "bunfig.toml"), bunfig);
            await run(
                process.execPath,
                ["install", "--lockfile-only", "--ignore-scripts"],
                { cwd },
            );

            const lock = Bun.JSONC.parse(
                await Bun.file(join(cwd, "bun.lock")).text(),
            );
            for (const [name, pin] of changes) {
                const resolved = lock.packages[name]?.[0];
                if (resolved !== `${name}@${pin.replace(/^\^/, "")}`) {
                    throw new Error(
                        `${layer} resolved ${resolved ?? "no version"} for ${name}, expected ${pin}`,
                    );
                }
            }
        }

        // Keep every template on its old pins until all lockfiles are ready.
        for (const { dir, original } of layers) {
            for (const [file, contents] of Object.entries(original)) {
                const path = join(dir, file);
                if ((await Bun.file(path).text()) !== contents) {
                    throw new Error(
                        `${path} changed while refreshing pins, run again`,
                    );
                }
            }
        }
        for (const { layer, dir } of layers) {
            for (const file of ["package.json", "bun.lock"]) {
                await Bun.write(
                    join(dir, file),
                    Bun.file(join(scratch, layer, file)),
                );
            }
        }
    } finally {
        await rm(scratch, { recursive: true, force: true });
    }
} else if (!pending.size) {
    console.log("Template pins already include the released versions");
}
