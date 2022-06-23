/**
 * Shared browser WASM handle — one init for the whole SPA session.
 * Delegates to `@doki-land/fractal-unknown-wasm32` (same surface as NAPI platform packages).
 */

import type { Affine2, EscapeField, LyapunovScan, Melody, PlantPath, PointCloud } from "@doki-land/fractal";

export type FractalWasm = {
  rewrite: (axiom: string, rules: string[], iterations: number) => string;
  growPlant: (iterations: number, step: number, turnDegrees: number) => PlantPath;
  growFern: (iterations: number, seed: number) => PointCloud;
  growSierpinski: (iterations: number, seed: number) => PointCloud;
  sampleIfs: (maps: Affine2[], iterations: number, seed: number, burnIn: number) => PointCloud;
  sampleClifford: (
    a: number,
    b: number,
    c: number,
    d: number,
    iterations: number,
    burnIn: number,
  ) => PointCloud;
  sampleDejong: (
    a: number,
    b: number,
    c: number,
    d: number,
    iterations: number,
    burnIn: number,
  ) => PointCloud;
  sampleLorenz: (
    sigma: number,
    rho: number,
    beta: number,
    dt: number,
    iterations: number,
    burnIn: number,
    plane: string,
  ) => PointCloud;
  mandelbrot: (
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    scale: number,
    maxIter: number,
  ) => EscapeField;
  julia: (
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    scale: number,
    cx: number,
    cy: number,
    maxIter: number,
  ) => EscapeField;
  logisticLyapunov: (r: number, iterations: number, burnIn: number) => number | null;
  logisticLyapunovScan: (
    rMin: number,
    rMax: number,
    steps: number,
    iterations: number,
    burnIn: number,
  ) => LyapunovScan | null;
  growMelody: (iterations: number, tempoBpm: number, seedMidi: number) => Melody;
  boxCountingDimension: (points: unknown, minBoxes: number) => number | null;
  correlationDimension: (points: unknown, maxPoints: number) => number | null;
};

let ready: Promise<FractalWasm> | null = null;
let resolved: FractalWasm | null = null;

export function isFractalWasmReady(): boolean {
  return resolved !== null;
}

export const FRACTAL_WASM_LOADING = "Loading…";

/** True until the shared WASM module has finished its first init. */
export function needsWasmLoadUi(): boolean {
  return resolved === null;
}

type WasmLoadCalloutTarget = {
  calloutTone: string;
  calloutTitle: string;
  status: string;
};

/** Show a loading callout only while WASM is still cold-starting. */
export function applyWasmLoadCallout(target: WasmLoadCalloutTarget): void {
  if (needsWasmLoadUi()) {
    target.calloutTone = "info";
    target.calloutTitle = "Loading";
    target.status = FRACTAL_WASM_LOADING;
    return;
  }
  target.status = "";
  target.calloutTitle = "";
}

export function loadFractalWasm(): Promise<FractalWasm> {
  if (!ready) {
    ready = import("@doki-land/fractal-unknown-wasm32").then((mod) => {
      resolved = mod.default as FractalWasm;
      return resolved;
    });
  }
  return ready;
}

/** Fire-and-forget warm-up from Application so studio routes skip cold init. */
export function prefetchFractalWasm(): void {
  void loadFractalWasm().catch(() => {
    /* studio panels surface the error on first draw */
  });
}
