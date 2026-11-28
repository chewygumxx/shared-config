// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
// ~chewygumxx/shared-config.git
// ::: :/packages/create-repo/scripts/verify-templates.js
//

import { existsSync } from "node:fs";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { run } from "../lib/run.js";
import { combinations, getTemplate } from "../lib/templates.js";

const workspace = fileURLToPath(new URL("../../..", import.meta.url));
const packageDir = fileURLToPath(new URL("..", import.meta.url));

/** Point a scratch copy of the bundled layers at tarballs from this workspace.
 * @param {string} templates
 * @param {string} scratch
 */
async function useWorkspaceConfigs(templates, scratch) {
    const packages = join(workspace, "packages");
    /** @type {Map<string, string>} */
    const tarballs = new Map();
    for (const layer of await readdir(templates)) {
        const cwd = join(templates, layer);
        const manifest = Bun.file(join(cwd, "package.json"));
        if (!(await manifest.exists())) continue;
        const pkg = await manifest.json();
        for (const name of Object.keys(pkg.devDependencies)) {
            if (
                !name.startsWith("@chewygumxx/") ||
                name === "@chewygumxx/create-repo"
            )
                continue;
            const dir = join(packages, basename(name));
            if (!existsSync(join(dir, "package.json"))) continue;
            let tarball = tarballs.get(name);
            if (tarball === undefined) {
                tarball = join(scratch, `${basename(name)}.tgz`);
                await run(
                    "bun",
                    ["pm", "pack", "--ignore-scripts", "--filename", tarball],
                    {
                        cwd: dir,
                        capture: true,
                    },
                );
                tarballs.set(name, tarball);
            }
            pkg.devDependencies[name] = `file:${tarball}`;
        }
        await Bun.write(manifest, `${JSON.stringify(pkg, null, 4)}\n`);
        await run("bun", ["install", "--lockfile-only", "--ignore-scripts"], {
            cwd,
        });
    }
}

const { values } = parseArgs({
    options: {
        registry: { type: "boolean" },
        template: { type: "string" },
        tarball: { type: "string" },
    },
});
const scenarios =
    values.template === undefined
        ? combinations()
        : combinations({ [values.template]: getTemplate(values.template) });
const scratch = await mkdtemp(join(tmpdir(), "create-repo-verify-"));
try {
    const env = {
        ...process.env,
        GH_TOKEN: "",
        GITHUB_TOKEN: "",
        GH_CONFIG_DIR: join(scratch, "gh"),
        GIT_AUTHOR_NAME: "Create Repo Test",
        GIT_AUTHOR_EMAIL: "create-repo@example.com",
        GIT_COMMITTER_NAME: "Create Repo Test",
        GIT_COMMITTER_EMAIL: "create-repo@example.com",
    };
    let tarball = values.tarball && resolve(values.tarball);
    if (!tarball) {
        const { stdout } = await run(
            "npm",
            [
                "pack",
                "--json",
                "--ignore-scripts",
                "--pack-destination",
                scratch,
            ],
            { cwd: packageDir, capture: true },
        );
        const packed = JSON.parse(stdout);
        const [artifact] = Array.isArray(packed)
            ? packed
            : Object.values(packed);
        tarball = join(scratch, artifact.filename);
    }
    await run("tar", ["-xzf", tarball], { cwd: scratch });
    const installed = join(scratch, "package");
    await run("bun", ["install", "--production", "--ignore-scripts"], {
        cwd: installed,
    });
    if (!values.registry && !values.tarball)
        await useWorkspaceConfigs(join(installed, "templates"), scratch);

    for (const { template, features } of scenarios) {
        const name = [template, ...features].join("-");
        const scenario = await mkdtemp(join(scratch, `${name}-`));
        try {
            const dir = join(scenario, name);
            await run(
                "bun",
                [
                    join(installed, "bin", "create-repo.js"),
                    name,
                    "--template",
                    template,
                    "--with",
                    features.join(","),
                    "--description",
                    "A generated repository for validation.",
                    "--topics",
                    "ci",
                    "--scopes",
                    "api",
                    "--owner",
                    "example",
                    "--dir",
                    dir,
                    "--no-metadata",
                    "--dry-run",
                    "--yes",
                ],
                { env },
            );

            const clone = join(scenario, `${name}-fresh`);
            await run("git", ["clone", "--quiet", dir, clone], { env });
            // Free the first install before installing into the fresh clone.
            await rm(dir, { recursive: true, force: true });
            const local = {
                cwd: clone,
                env: { ...env, GITHUB_REPOSITORY: `example/${name}` },
            };
            await run("mise", ["trust", "--quiet"], local);
            await run("mise", ["install"], local);
            await run("mise", ["exec", "--", "bun", "ci"], local);
            await run("mise", ["exec", "--", "bun", "run", "check"], local);
        } finally {
            await rm(scenario, { recursive: true, force: true });
        }
    }
} finally {
    await rm(scratch, { recursive: true, force: true });
}
