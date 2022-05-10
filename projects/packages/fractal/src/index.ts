/**
 * `@doki-land/fractal` — thin Node facade.
 *
 * Rust (NAPI) owns rewrite / turtle / IFS / escape geometry.
 * TypeScript owns SVG / Canvas rendering (`./render.js`).
 *
 * Build the binding first: `pnpm build:napi`
 */

export type { EscapeField, PlantPath, Point2, PointCloud } from "./native.js";
export { loadFractalNative } from "./native.js";
export {
    fitBounds,
    paintEscapeField,
    plotCanvas,
    strokeCanvas,
    toSvgPolyline,
    type CanvasPlotOptions,
    type CanvasStrokeOptions,
    type EscapeFieldLike,
    type EscapePaintOptions,
    type FitBounds,
    type SvgPolyline,
} from "./render.js";

import { loadFractalNative, type EscapeField, type PlantPath, type PointCloud } from "./native.js";

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

/** Sample a Mandelbrot escape-time field (paint with `paintEscapeField`). */
export function mandelbrot(
    width = 640,
    height = 400,
    centerX = -0.5,
    centerY = 0,
    scale = 3,
    maxIter = 120,
): EscapeField {
    return loadFractalNative().mandelbrot(width, height, centerX, centerY, scale, maxIter);
}

/** Sample a Julia escape-time field for fixed `c = (cx, cy)`. */
export function julia(
    width = 640,
    height = 400,
    centerX = 0,
    centerY = 0,
    scale = 3,
    cx = -0.8,
    cy = 0.156,
    maxIter = 120,
): EscapeField {
    return loadFractalNative().julia(width, height, centerX, centerY, scale, cx, cy, maxIter);
}
