/**
 * `@doki-land/fractal` — thin Node facade.
 *
 * Rust (NAPI) owns rewrite / turtle / IFS / escape / note-event / analysis geometry.
 * TypeScript owns SVG / Canvas / WebAudio (`./render.ts`, `./audio.ts`).
 *
 * Build the binding first: `pnpm build:napi`
 */

export type { Affine2, EscapeField, Melody, NoteEvent, PlantPath, Point2, PointCloud } from "./native.ts";
export { loadFractalNative } from "./native.ts";
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
} from "./render.ts";
export {
    playMelody,
    toMidiBytes,
    type MelodyLike,
    type MidiExportOptions,
    type NoteEventLike,
    type PlayMelodyOptions,
} from "./audio.ts";

import {
    loadFractalNative,
    type Affine2,
    type EscapeField,
    type Melody,
    type PlantPath,
    type PointCloud,
} from "./native.ts";

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

/** Sample an arbitrary IFS via the chaos game (geometry only). */
export function sampleIfs(
    maps: Affine2[],
    iterations = 50_000,
    seed = 1,
    burnIn = 20,
): PointCloud {
    return loadFractalNative().sampleIfs(maps, iterations, seed, burnIn);
}

/** Sample the classic Sierpiński gasket IFS (geometry only). */
export function growSierpinski(iterations = 50_000, seed = 1): PointCloud {
    return loadFractalNative().growSierpinski(iterations, seed);
}

/** Sample a Clifford attractor (geometry only; paint with `plotCanvas`). */
export function sampleClifford(
    a = -1.4,
    b = 1.6,
    c = 1.0,
    d = 0.7,
    iterations = 50_000,
    burnIn = 50,
): PointCloud {
    return loadFractalNative().sampleClifford(a, b, c, d, iterations, burnIn);
}

/** Sample a Peter de Jong attractor (geometry only; paint with `plotCanvas`). */
export function sampleDejong(
    a = -2.0,
    b = -2.0,
    c = -1.2,
    d = 2.0,
    iterations = 50_000,
    burnIn = 20,
): PointCloud {
    return loadFractalNative().sampleDejong(a, b, c, d, iterations, burnIn);
}

/** Sample a Lorenz attractor projected to `xy` / `xz` / `yz`. */
export function sampleLorenz(
    sigma = 10,
    rho = 28,
    beta = 8 / 3,
    dt = 0.01,
    iterations = 50_000,
    burnIn = 200,
    plane: "xy" | "xz" | "yz" = "xy",
): PointCloud {
    return loadFractalNative().sampleLorenz(sigma, rho, beta, dt, iterations, burnIn, plane);
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

/** Grow an L-system melody as note events (play with `playMelody` in a browser). */
export function growMelody(iterations = 3, tempoBpm = 120, seedMidi = 60): Melody {
    return loadFractalNative().growMelody(iterations, tempoBpm, seedMidi);
}

/** Box-counting fractal dimension for a 2D point cloud (`null` if degenerate). */
export function boxCountingDimension(
    points: { x: number; y: number }[],
    minBoxes = 2,
): number | null {
    return loadFractalNative().boxCountingDimension(points, minBoxes);
}

/** Correlation dimension for a 2D point cloud (`null` if degenerate). */
export function correlationDimension(
    points: { x: number; y: number }[],
    maxPoints = 400,
): number | null {
    return loadFractalNative().correlationDimension(points, maxPoints);
}
