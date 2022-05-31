import { createRequire } from "node:module";

export type Point2 = { x: number; y: number };

export type PlantPath = {
    points: Point2[];
    source: string;
    sourceLength: number;
};

export type PointCloud = {
    points: Point2[];
    count: number;
};

export type Affine2 = {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
    weight: number;
};

export type EscapeField = {
    width: number;
    height: number;
    maxIter: number;
    values: number[] | Uint16Array;
};

export type NoteEvent = {
    time: number;
    midi: number;
    duration: number;
    velocity: number;
};

export type Melody = {
    events: NoteEvent[];
    count: number;
};

type FractalBinding = {
    rewrite: (axiom: string, rules: string[], iterations: number) => string;
    growPlant: (iterations: number, step: number, turnDegrees: number) => {
        points: Point2[];
        source: string;
        sourceLength: number;
    };
    growFern: (iterations: number, seed: number) => {
        points: Point2[];
        count: number;
    };
    sampleIfs: (
        maps: Affine2[],
        iterations: number,
        seed: number,
        burnIn: number,
    ) => {
        points: Point2[];
        count: number;
    };
    growSierpinski: (iterations: number, seed: number) => {
        points: Point2[];
        count: number;
    };
    sampleClifford: (
        a: number,
        b: number,
        c: number,
        d: number,
        iterations: number,
        burnIn: number,
    ) => {
        points: Point2[];
        count: number;
    };
    sampleDejong: (
        a: number,
        b: number,
        c: number,
        d: number,
        iterations: number,
        burnIn: number,
    ) => {
        points: Point2[];
        count: number;
    };
    mandelbrot: (
        width: number,
        height: number,
        centerX: number,
        centerY: number,
        scale: number,
        maxIter: number,
    ) => {
        width: number;
        height: number;
        maxIter: number;
        values: number[] | Uint16Array;
    };
    julia: (
        width: number,
        height: number,
        centerX: number,
        centerY: number,
        scale: number,
        cx: number,
        cy: number,
        maxIter: number,
    ) => {
        width: number;
        height: number;
        maxIter: number;
        values: number[] | Uint16Array;
    };
    growMelody: (iterations: number, tempoBpm: number, seedMidi: number) => {
        events: NoteEvent[];
        count: number;
    };
    boxCountingDimension: (points: Point2[], minBoxes: number) => number | null;
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
