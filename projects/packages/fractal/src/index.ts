/**
 * `@doki-land/fractal` — thin Node facade.
 *
 * Rust (NAPI) owns rewrite / turtle geometry.
 * TypeScript owns SVG / Canvas rendering (`./render.js`).
 *
 * Build the binding first: `pnpm build:napi`
 */

export type { PlantPath, Point2 } from "./native.js";
export { loadFractalNative } from "./native.js";
export {
    fitBounds,
    strokeCanvas,
    toSvgPolyline,
    type CanvasStrokeOptions,
    type FitBounds,
    type SvgPolyline,
} from "./render.js";

import { loadFractalNative, type PlantPath } from "./native.js";

/** Parallel L-system rewrite. `rules` is a flat `[from, to, from, to, …]` list. */
export function rewrite(axiom: string, rules: string[], iterations: number): string {
    return loadFractalNative().rewrite(axiom, rules, iterations);
}

/** Grow the classic plant L-system and return turtle points (render separately). */
export function growPlant(iterations: number, step = 8, turnDegrees = 25): PlantPath {
    return loadFractalNative().growPlant(iterations, step, turnDegrees);
}
