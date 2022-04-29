import { createRequire } from "node:module";

export type PlantGrowResult = {
    points: string;
    viewBox: string;
    source: string;
    sourceLength: number;
};

type FractalBinding = {
    rewrite: (axiom: string, rules: string[], iterations: number) => string;
    growPlant: (
        iterations: number,
        step: number,
        turnDegrees: number,
        padding: number,
    ) => PlantGrowResult;
};

/** Platform package map — same shape as `@doki-land/nifty-<platform>`. */
const PLATFORM_PACKAGES: Record<string, string> = {
    "win32-x64": "@doki-land/fractal-win32-x64",
    "linux-x64": "@doki-land/fractal-linux-x64",
    "linux-arm64": "@doki-land/fractal-linux-arm64",
    "darwin-x64": "@doki-land/fractal-darwin-x64",
    "darwin-arm64": "@doki-land/fractal-darwin-arm64",
};

let cached: FractalBinding | undefined;

/** Load the platform Node-API binary from `@doki-land/fractal-<platform>`. */
export function loadFractalNative(): FractalBinding {
    if (cached) {
        return cached;
    }
    const key = `${process.platform}-${process.arch}`;
    const pkg = PLATFORM_PACKAGES[key];
    if (!pkg) {
        throw new Error(`Unsupported platform for Fractal native bindings: ${key}`);
    }
    const require = createRequire(import.meta.url);
    try {
        cached = require(pkg).default as FractalBinding;
    } catch (err) {
        throw new Error(
            `Failed to load \`${pkg}\`. Run \`pnpm build:napi\` in the fractal-art workspace, then reinstall.`,
            { cause: err },
        );
    }
    return cached;
}
