/** Shared browser WASM handle — one init for the whole SPA session. */

export type FractalWasm = {
  default: (input?: RequestInfo | URL | Response | BufferSource | WebAssembly.Module) => Promise<unknown>;
  growPlant: (iterations: number, step: number, turnDegrees: number) => any;
  growFern: (iterations: number, seed: number) => any;
  growSierpinski: (iterations: number, seed: number) => any;
  sampleIfs: (maps: unknown, iterations: number, seed: number, burnIn: number) => any;
  sampleClifford: (
    a: number,
    b: number,
    c: number,
    d: number,
    iterations: number,
    burnIn: number,
  ) => any;
  sampleDejong: (
    a: number,
    b: number,
    c: number,
    d: number,
    iterations: number,
    burnIn: number,
  ) => any;
  sampleLorenz: (
    sigma: number,
    rho: number,
    beta: number,
    dt: number,
    iterations: number,
    burnIn: number,
    plane: string,
  ) => any;
  mandelbrot: (
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    scale: number,
    maxIter: number,
  ) => any;
  julia: (
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    scale: number,
    cx: number,
    cy: number,
    maxIter: number,
  ) => any;
  logisticLyapunov: (r: number, iterations: number, burnIn: number) => number | null;
  logisticLyapunovScan: (
    rMin: number,
    rMax: number,
    steps: number,
    iterations: number,
    burnIn: number,
  ) => any;
  growMelody: (iterations: number, tempoBpm: number, seedMidi: number) => any;
  boxCountingDimension: (points: unknown, minBoxes: number) => number | null;
  correlationDimension: (points: unknown, maxPoints: number) => number | null;
};

const WASM_JS = "/wasm/fractal_wasm.js";
const WASM_BIN = "/wasm/fractal_wasm_bg.wasm";

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
    ready = import(/* @vite-ignore */ WASM_JS).then(async (mod: FractalWasm) => {
      await mod.default(WASM_BIN);
      resolved = mod;
      return mod;
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
