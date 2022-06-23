/**
 * Publish 0.0.0 placeholder stubs:
 * - `nifty publish` for the facade + any platform package with a staged `.node`
 * - direct `npm publish` for other `@doki-land/fractal-*` platform packages (nifty skips without binary)
 */

import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packagesRoot = join(root, "projects/packages");

const PLATFORM_PACKAGES = [
    "@doki-land/fractal-win32-x64",
    "@doki-land/fractal-linux-x64",
    "@doki-land/fractal-linux-arm64",
    "@doki-land/fractal-darwin-x64",
    "@doki-land/fractal-darwin-arm64",
    "@doki-land/fractal-unknown-wasm32",
];

function hasStagedNative(dir) {
    const libDir = join(dir, "lib");
    try {
        return readdirSync(libDir).some((name) => name.endsWith(".node"));
    } catch {
        return false;
    }
}

function run(cmd, args, opts = {}) {
    const result = spawnSync(cmd, args, {
        cwd: opts.cwd ?? root,
        encoding: "utf8",
        shell: process.platform === "win32",
        stdio: "inherit",
        env: process.env,
    });
    if ((result.status ?? 1) !== 0) {
        process.exit(result.status ?? 1);
    }
}

function packageDir(name) {
    const short = name.replace("@doki-land/fractal-", "fractal-");
    return join(packagesRoot, short);
}

console.log("publish-placeholder: nifty publish (facade + staged native packages)…");
run("pnpm", ["exec", "nifty", "publish"]);

for (const name of PLATFORM_PACKAGES) {
    const dir = packageDir(name);
    if (hasStagedNative(dir)) {
        console.log(`publish-placeholder: skip ${name} (published via nifty with native binary)`);
        continue;
    }
    console.log(`publish-placeholder: npm publish stub ${name}@0.0.0…`);
    run("npm", ["publish", "--access", "public"], { cwd: dir });
}

console.log("publish-placeholder: done");
