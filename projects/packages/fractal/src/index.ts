/**
 * `@doki-land/fractal` — thin Node facade.
 *
 * Heavy rewrite / turtle work runs in Rust WASM and ships as
 * `@doki-land/fractal-<platform>` (same layout as `@doki-land/nifty`).
 * Pure TypeScript is not the compute path.
 *
 * Build the binding first: `pnpm build:wasm`
 */

export type { PlantGrowResult } from "./native.js";
export { loadFractalNative } from "./native.js";

import { loadFractalNative, type PlantGrowResult } from "./native.js";

/** Parallel L-system rewrite. `rules` is a flat `[from, to, from, to, …]` list. */
export function rewrite(axiom: string, rules: string[], iterations: number): string {
    return loadFractalNative().rewrite(axiom, rules, iterations);
}

/** Grow the classic plant L-system and return SVG polyline fields. */
export function growPlant(
    iterations: number,
    step = 8,
    turnDegrees = 25,
    padding = 16,
): PlantGrowResult {
    return loadFractalNative().growPlant(iterations, step, turnDegrees, padding);
}
