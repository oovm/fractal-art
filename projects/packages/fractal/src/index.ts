/**
 * `@doki-land/fractal` — thin Node facade.
 *
 * Heavy rewrite / turtle work runs in Rust WASM published as
 * `@doki-land/fractal-<platform>` (today: `@doki-land/fractal-wasm`).
 * Pure TypeScript is not the compute path.
 *
 * Build the binary first: `pnpm build:wasm`
 */

export type { PlantGrowResult } from "@doki-land/fractal-wasm";

/** Platform package map — mirrors `@doki-land/nifty-<platform>` optionalDeps. */
const PLATFORM_PACKAGES = {
    wasm: "@doki-land/fractal-wasm",
} as const;

type PlatformModule = typeof import("@doki-land/fractal-wasm");

let cached: PlatformModule | null = null;

async function loadPlatform(): Promise<PlatformModule> {
    if (cached) return cached;
    const pkg = PLATFORM_PACKAGES.wasm;
    try {
        cached = await import(pkg);
        return cached;
    } catch (err) {
        throw new Error(
            `Failed to load \`${pkg}\`. Run \`pnpm build:wasm\` in the fractal-art workspace, then reinstall.`,
            { cause: err },
        );
    }
}

/** Parallel L-system rewrite. `rules` is a flat `[from, to, from, to, …]` list. */
export async function rewrite(axiom: string, rules: string[], iterations: number): Promise<string> {
    const platform = await loadPlatform();
    return platform.rewrite(axiom, rules, iterations);
}

/** Grow the classic plant L-system and return SVG polyline fields. */
export async function growPlant(
    iterations: number,
    step = 8,
    turnDegrees = 25,
    padding = 16,
): Promise<import("@doki-land/fractal-wasm").PlantGrowResult> {
    const platform = await loadPlatform();
    return platform.growPlant(iterations, step, turnDegrees, padding);
}
