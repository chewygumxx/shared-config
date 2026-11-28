// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
//
// ~chewygumxx/shared-config.git
// ::: :/packages/create-repo/test/paradigm.test.js
//
//

// @ts-check

// This repository, and every repository a template creates, is set up as
// shared-config and agentic-library are: mise is the switchboard, its tasks
// extend the cgxx: templates of @chewygumxx/mise-tasks-config, and lint and
// format run the hk steps of @chewygumxx/hk-config. These tests hold each
// to that.

import assert from "node:assert/strict";
import { readFileSync, readlinkSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "jsonc-parser";
import { compose, RENAMED, TASKS_LINKS } from "../lib/template.js";
import { combinations, label, TEMPLATES } from "../lib/templates.js";

const ROOT = fileURLToPath(new URL("../../..", import.meta.url));

/**
 * A repository's files, as this checkout holds them or as a template
 * composes them.
 * @typedef {object} View
 * @property {string} name
 * @property {string[]} files relative paths, as the repository names them
 * @property {(file: string) => string} read
 */

/** @returns {View[]} each template, with each combination of features */
function templateViews() {
    return combinations().map(({ template, features }) => {
        const sources = compose(TEMPLATES[template].layers(new Set(features)));
        const generated = new Map(
            [...sources].map(([file, source]) => [
                RENAMED[file] ?? file,
                source,
            ]),
        );
        return {
            name: label(template, features),
            files: [...generated.keys()],
            read: (file) =>
                readFileSync(
                    generated.get(file) ?? assert.fail(`no ${file}`),
                    "utf8",
                ),
        };
    });
}

const VIEWS = templateViews();

/**
 * Runs `body` for each repository, naming it in any failure.
 * @param {(view: View) => void} body
 */
function eachView(body) {
    for (const view of VIEWS) {
        try {
            body(view);
        } catch (error) {
            if (error instanceof Error) {
                error.message = `${view.name}: ${error.message}`;
            }
            throw error;
        }
    }
}

const MISE_SCHEMA = "https://mise.jdx.dev/schema/mise.json";
const TASK_SCHEMA = "https://mise.jdx.dev/schema/mise-task.json";

/**
 * The schema a TOML file names on its third line, by its path.
 * @param {string} file
 */
function schemaOf(file) {
    if (/^\.config\/mise\/(?:config|conf\.d\/[^/]+)\.toml$/.test(file)) {
        return MISE_SCHEMA;
    }
    if (/^\.config\/mise\/tasks(?:\.toml|\/[^/]+\.task\.toml)$/.test(file)) {
        return TASK_SCHEMA;
    }
    return {
        ".config/tombi.toml": "tombi://www.schemastore.org/tombi.json",
        "bunfig.toml": "https://www.schemastore.org/bunfig.json",
    }[file];
}

/** TOML files whose tools publish no schema. */
const SCHEMALESS = new Set([".moxide.toml"]);

// tombi validates each TOML file by the schema it names, rather than
// leaving tombi to look one up by name.
test("every TOML file names its schema", () =>
    eachView(({ files, read }) => {
        const problems = files
            .filter((file) => file.endsWith(".toml") && !SCHEMALESS.has(file))
            .flatMap((file) => {
                const schema = schemaOf(file);
                if (schema === undefined) return [`${file}: no known schema`];
                const line = read(file).split("\n")[2];
                return line === `#:schema ${schema}`
                    ? []
                    : [`${file}: ${line}`];
            });
        assert.deepEqual(problems, []);
    }));

test("package.json scripts are check and lifecycle scripts alone", () =>
    eachView(({ read }) => {
        const pkg = JSON.parse(read("package.json"));
        const { check, ...lifecycle } = pkg.scripts;
        assert.equal(check, "mise run check --all");
        for (const name of Object.keys(lifecycle)) {
            assert.match(name, /^(?:pre|post)?(?:pack|prepare|publish)$/);
        }
        assert.deepEqual(pkg.engines, { bun: ">=1.4" });
        for (const field of ["prettier", "remarkConfig", "cspell"]) {
            assert.equal(pkg[field], undefined, field);
        }
    }));

test("husky is gone; hk installs the hooks from mise", () =>
    eachView(({ files, read }) => {
        const pkg = JSON.parse(read("package.json"));
        assert.equal(pkg.devDependencies.husky, undefined);
        assert.ok(!files.some((file) => file.startsWith(".husky/")));
        assert.match(
            read(".config/mise/config.toml"),
            /^run = 'test -n "\$\{CI-\}" \|\| \{ bun ci && hk install --mise; \}'$/m,
        );
    }));

// The 0.x shared packages and the Biome CLI are pinned for each template.
test("the shared hk steps, mise tasks and Biome are pinned exactly", () =>
    eachView(({ read }) => {
        const { devDependencies: deps } = JSON.parse(read("package.json"));
        for (const name of [
            "@chewygumxx/hk-config",
            "@chewygumxx/mise-tasks-config",
            "@biomejs/biome",
        ]) {
            assert.match(deps[name] ?? "", /^\d+\.\d+\.\d+$/, name);
        }
    }));

// What hk-config's steps run: each optional peer it names, publint and
// attw only where the package check runs, and each configuration read.
test("every package the shared steps run is a devDependency", () => {
    const peers = Object.keys(
        JSON.parse(
            readFileSync(join(ROOT, "packages/hk-config/package.json"), "utf8"),
        ).peerDependencies,
    );
    eachView(({ read }) => {
        const { devDependencies: deps } = JSON.parse(read("package.json"));
        const hk = read(".config/hk.pkl");
        const packages = !hk.includes('.remove("packages")');
        for (const peer of peers) {
            if (peer === "publint") assert.equal(peer in deps, packages);
            else if (peer === "@arethetypeswrong/cli") {
                assert.equal(peer in deps, hk.includes("attw"));
            } else assert.ok(peer in deps, peer);
        }
        for (const config of [
            "actionlint-config",
            "biome-config",
            "commitlint-config",
            "cspell-config",
            "editorconfig-checker-config",
            "markdownlint-cli2-config",
            "prettier-config",
            "remark-preset",
            "secretlint-rule-preset",
            "shellcheck-config",
            "tombi-config",
            "tsconfig",
            "yamllint-config",
        ]) {
            assert.ok(`@chewygumxx/${config}` in deps, config);
        }
    });
});

test("each configuration the shared steps read is where they read it", () =>
    eachView(({ files, read }) => {
        for (const file of [
            ".config/cspell.json",
            ".config/prettierrc.json",
            ".config/remarkrc.json",
            ".config/tombi.toml",
            ".secretlintrc.json",
            ".markdownlint-cli2.jsonc",
        ]) {
            assert.ok(files.includes(file), file);
        }
        for (const file of [".tombi.toml", ".yamllint.yaml", "mise.toml"]) {
            assert.ok(!files.includes(file), file);
        }
        assert.deepEqual(parse(read(".config/cspell.json")).import, [
            "@chewygumxx/cspell-config",
        ]);
        assert.equal(
            JSON.parse(read(".config/prettierrc.json")),
            "@chewygumxx/prettier-config",
        );
        assert.deepEqual(JSON.parse(read(".config/remarkrc.json")).plugins, [
            "@chewygumxx/remark-preset",
        ]);
        assert.deepEqual(parse(read(".secretlintrc.json")).rules, [
            { id: "@chewygumxx/secretlint-rule-preset" },
        ]);
        assert.equal(
            parse(read(".markdownlint-cli2.jsonc")).config.extends,
            "@chewygumxx/markdownlint-cli2-config",
        );
    }));

test("generated mise links track the workspace task templates", () => {
    for (const { path, target } of TASKS_LINKS) {
        assert.equal(
            readlinkSync(join(ROOT, path)).replace(
                "packages/",
                "node_modules/@chewygumxx/",
            ),
            target,
        );
    }
});

test("standard tasks use the canonical shared templates", () => {
    const own = readFileSync(join(ROOT, ".config/mise/tasks.toml"), "utf8");
    const definitions = /^\[([^\]]+)\]\nextends += "(cgxx:[^"]+)"$/gm;
    const expected = [...own.matchAll(definitions)].filter(
        ([, , template]) => template !== "cgxx:install:vendir",
    );
    eachView(({ read }) => {
        const mise = read(".config/mise/config.toml");
        assert.ok(mise.includes('".config/mise/tasks.toml"'));
        const tasks = read(".config/mise/tasks.toml");
        const standard = read(".config/mise/tasks/standard.task.toml");
        const actual = new Map(
            [...`${tasks}\n${standard}`.matchAll(definitions)].map(
                ([, task, template]) => [task, template],
            ),
        );
        for (const [, task, template] of expected) {
            assert.equal(actual.get(task), template, task);
        }
        assert.match(standard, /^run\s+= ".+"$/m);
    });
});

// hk's steps.pkl and each hk.pkl name an hk version, and mise installs one:
// all three must agree.
test("hk's version agrees across mise, hk.pkl and the shared steps", () => {
    const shared = readFileSync(
        join(ROOT, "packages/hk-config/steps.pkl"),
        "utf8",
    );
    eachView(({ read }) => {
        const pinned = /^hk {0,2}= "(\d+\.\d+\.\d+)"$/m.exec(
            read(".config/mise/config.toml"),
        )?.[1];
        assert.ok(pinned);
        const own = read(".config/hk.pkl");
        for (const [name, text] of [
            ["hk.pkl", own],
            ["steps.pkl", shared],
        ]) {
            assert.ok(
                text.includes(`/v${pinned}/hk@${pinned}#/Config.pkl`),
                `${name} names hk ${pinned}`,
            );
        }
        assert.match(
            own,
            /^import "\.\.\/node_modules\/@chewygumxx\/hk-config\/steps\.pkl" as shared$/m,
        );
        assert.match(own, /^ {16}check = "mise run check --staged"$/m);
        assert.match(own, /mise run commit:lint/);
    });
});

test("template tool pins match the workspace", () => {
    const toolPins = (/** @type {string} */ config) =>
        /** @type {{ tools: Record<string, unknown> }} */ (
            Bun.TOML.parse(config)
        ).tools;
    const root = readFileSync(join(ROOT, ".config/mise/config.toml"), "utf8");
    const { vendir, ...sharedTools } = toolPins(root);
    eachView(({ read }) => {
        const mise = read(".config/mise/config.toml");
        assert.deepEqual(toolPins(mise), sharedTools);
        assert.doesNotMatch(mise, /lazy\s*=\s*true/);
        assert.match(mise, /^CGXX_WIDEN_ON = "bun\.lock \.config /m);
    });
});

test("the generated Commitizen prompt uses the workspace adapter", () => {
    const manifest = JSON.parse(
        readFileSync(join(ROOT, "package.json"), "utf8"),
    );
    const rootConfig = readFileSync(join(ROOT, ".commitlintrc.mts"), "utf8");
    eachView(({ read }) => {
        const pkg = JSON.parse(read("package.json"));
        assert.deepEqual(pkg.config.commitizen, manifest.config.commitizen);
        assert.equal(
            pkg.devDependencies["cz-git"],
            manifest.devDependencies["cz-git"],
        );
        const boundary = "const typeChoices";
        assert.ok(rootConfig.includes(boundary));
        assert.equal(
            read(".commitlintrc.mts").split(boundary)[1],
            rootConfig.split(boundary)[1],
        );
    });
});

test("the guidance for agents is AGENTS.md, not .claude/", () =>
    eachView(({ files }) => {
        assert.ok(files.includes("AGENTS.md"));
        assert.ok(!files.some((file) => file.startsWith(".claude/")));
    }));

// A new repository's agents learn its setup from the skill, linked from
// node_modules on every install, so the links are never committed.
test("every template links the creating-bun-repositories skill", () =>
    eachView(({ files, read }) => {
        const pkg = JSON.parse(read("package.json"));
        assert.match(
            pkg.devDependencies["@chewygumxx/skill-creating-bun-repositories"],
            /^\d+\.\d+\.\d+$/,
        );
        assert.ok("skills" in pkg.devDependencies);
        assert.match(pkg.scripts.prepare, /skills experimental_sync /);
        assert.ok(files.includes("skills-lock.json"));
        const lock = JSON.parse(read("skills-lock.json"));
        assert.equal(
            lock.skills["creating-bun-repositories"].version,
            pkg.devDependencies["@chewygumxx/skill-creating-bun-repositories"],
        );
        const ignore = read(".gitignore").split("\n");
        for (const dir of [".agents/skills/", ".claude/skills/"]) {
            assert.ok(ignore.includes(dir), dir);
        }
    }));
