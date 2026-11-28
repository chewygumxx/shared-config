// vim:set expandtab shiftwidth=4 filetype=javascript:
// SPDX-License-Identifier: GPL-3.0-only

//
// ~chewygumxx/shared-config.git
// ::: :/scripts/npm-registry.mjs
//

import { createHash } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";

const registry = "https://registry.npmjs.org";

class IntegrityError extends Error {}

/**
 * A version can be listed before its tarball is available to install.
 * @param {string} name
 * @param {string} version
 * @param {typeof fetch} [request]
 * @param {string} [expectedIntegrity]
 * @returns {Promise<"missing" | "processing" | "downloadable">}
 */
export async function registryState(
    name,
    version,
    request = fetch,
    expectedIntegrity,
) {
    const metadata = await request(
        `${registry}/${encodeURIComponent(name)}/${encodeURIComponent(version)}`,
        { cache: "no-cache", signal: AbortSignal.timeout(10000) },
    );
    if (metadata.status === 404) return "missing";
    if (!metadata.ok)
        throw new Error(
            `npm metadata returned HTTP ${metadata.status} for ${name}@${version}`,
        );

    const {
        name: actualName,
        version: actualVersion,
        dist,
    } = await metadata.json();
    if (actualName !== name || actualVersion !== version || !dist?.integrity) {
        throw new Error(
            `npm returned unexpected metadata for ${name}@${version}`,
        );
    }
    const hashes = dist.integrity.split(/\s+/);
    if (expectedIntegrity && !hashes.includes(expectedIntegrity))
        throw new IntegrityError(
            `npm metadata for ${name}@${version} does not match the verified CI tarball`,
        );

    const url = new URL(dist.tarball);
    if (url.origin !== registry) {
        throw new Error(
            `npm tarball for ${name}@${version} is outside the registry`,
        );
    }
    const tarball = await request(url, {
        redirect: "error",
        signal: AbortSignal.timeout(10000),
    });
    if (tarball.status === 404) return "processing";
    if (!tarball.ok)
        throw new Error(
            `npm tarball returned HTTP ${tarball.status} for ${name}@${version}`,
        );

    const hash = createHash("sha512").update(
        Buffer.from(await tarball.arrayBuffer()),
    );
    const integrity = `sha512-${hash.digest("base64")}`;
    if (
        !hashes.includes(integrity) ||
        (expectedIntegrity && integrity !== expectedIntegrity)
    ) {
        throw new IntegrityError(
            `npm tarball integrity mismatch for ${name}@${version}`,
        );
    }
    return "downloadable";
}

/**
 * @param {{ name: string, version: string }[]} packages
 * @param {{ read?: typeof registryState, interval?: number, timeout?: number }} [options]
 */
export async function waitForRegistry(
    packages,
    { read = registryState, interval = 20000, timeout = 15 * 60 * 1000 } = {},
) {
    const pending = new Map(
        packages.map(({ name, version }) => [name, version]),
    );
    const deadline = Date.now() + timeout;
    while (pending.size) {
        const results = await Promise.allSettled(
            [...pending].map(async ([name, version]) => {
                const state = await read(name, version);
                console.log(`${name}@${version} | ${state}`);
                if (state === "downloadable") pending.delete(name);
            }),
        );
        for (const result of results) {
            if (result.status === "rejected") {
                if (result.reason instanceof IntegrityError)
                    throw result.reason;
                console.error(result.reason.message);
            }
        }
        if (!pending.size) return;
        if (Date.now() >= deadline) {
            const versions = [...pending].map(
                ([name, version]) => `${name}@${version}`,
            );
            throw new Error(
                `npm tarball verification timed out for ${versions.join(", ")}`,
            );
        }
        await delay(interval);
    }
}

// The registry job needs only Node and these two arguments.
if (import.meta.main) {
    const [name, version, integrity] = process.argv.slice(2);
    if (!name || !version || !/^sha512-[A-Za-z0-9+/]{86}==$/.test(integrity))
        throw new Error(
            "Usage: node scripts/npm-registry.mjs <package> <version> <integrity>",
        );
    await waitForRegistry([{ name, version }], {
        read: (packageName, packageVersion) =>
            registryState(packageName, packageVersion, fetch, integrity),
    });
}
