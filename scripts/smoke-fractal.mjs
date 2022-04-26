/**
 * Smoke: Node loads `@doki-land/fractal-<platform>` WASM binding.
 * Requires `pnpm build:wasm` first.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const key = `${process.platform}-${process.arch}`;
const PLATFORM_PACKAGES = {
    "win32-x64": "@doki-land/fractal-win32-x64",
    "linux-x64": "@doki-land/fractal-linux-x64",
    "linux-arm64": "@doki-land/fractal-linux-arm64",
    "darwin-x64": "@doki-land/fractal-darwin-x64",
    "darwin-arm64": "@doki-land/fractal-darwin-arm64",
};
const pkg = PLATFORM_PACKAGES[key];
if (!pkg) {
    throw new Error(`Unsupported platform: ${key}`);
}

const binding = require(pkg).default;
const algae = binding.rewrite("A", ["A", "AB", "B", "A"], 3);
if (algae !== "ABAAB") {
    throw new Error(`rewrite smoke failed: got ${algae}`);
}

const plant = binding.growPlant(3, 8, 25, 16);
if (!plant.points || !plant.viewBox || !(plant.sourceLength > 0)) {
    throw new Error(`growPlant smoke failed: ${JSON.stringify(plant)}`);
}

console.log("smoke ok", { platform: pkg, algae, sourceLength: plant.sourceLength, viewBox: plant.viewBox });
