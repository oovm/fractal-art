/**
 * `@doki-land/fractal` — thin Node facade.
 *
 * Rust (NAPI) owns rewrite / turtle / IFS geometry.
 * TypeScript owns SVG / Canvas rendering (`./render.js`).
 *
 * Build the binding first: `pnpm build:napi`
 */

export type { PlantPath, Point2, PointCloud } from "./native.js";
export { loadFractalNative } from "./native.js";
export {
    fitBounds,
    plotCanvas,
    strokeCanvas,
    toSvgPolyline,
    type CanvasPlotOptions,
    type CanvasStrokeOptions,
    type FitBounds,
    type SvgPolyline,
} from "./render.js";

import { loadFractalNative, type PlantPath, type PointCloud } from "./native.js";

/** Parallel L-system rewrite. `rules` is a flat `[from, to, from, to, …]` list. */
export function rewrite(axiom: string, rules: string[], iterations: number): string {
    return loadFractalNative().rewrite(axiom, rules, iterations);
}

/** Grow the classic plant L-system and return turtle points (render separately). */
export function growPlant(iterations: number, step = 8, turnDegrees = 25): PlantPath {
    return loadFractalNative().growPlant(iterations, step, turnDegrees);
}

/** Sample the classic Barnsley fern IFS (geometry only; paint with `plotCanvas`). */
export function growFern(iterations = 50_000, seed = 1): PointCloud {
    return loadFractalNative().growFern(iterations, seed);
}
