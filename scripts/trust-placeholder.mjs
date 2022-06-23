/**
 * Configure npm Trusted Publisher for fractal-art workspace packages.
 * Sets trust contract env before delegating to `nifty trust`.
 */

import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cachePath = join(root, ".cache", "npm-placeholder.json");
const cacheExample = join(root, ".cache", "npm-placeholder.json.example");

if (!existsSync(cachePath) && existsSync(cacheExample)) {
    copyFileSync(cacheExample, cachePath);
    console.log("trust-placeholder: initialized .cache/npm-placeholder.json from example");
}

const env = {
    ...process.env,
    NIFTY_TRUST_REPO: process.env.NIFTY_TRUST_REPO || "oovm/fractal-art",
    NIFTY_TRUST_FILE: process.env.NIFTY_TRUST_FILE || "publish-npm.yml",
    NIFTY_TRUST_ENV: process.env.NIFTY_TRUST_ENV || "NPM_PUBLISH",
};

const args = ["exec", "nifty", "trust", ...process.argv.slice(2)];
const result = spawnSync("pnpm", args, {
    cwd: root,
    encoding: "utf8",
    shell: process.platform === "win32",
    stdio: "inherit",
    env,
});

process.exit(result.status ?? 1);
