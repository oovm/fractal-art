/**
 * Smoke: NAPI returns turtle geometry; local TS-equivalent helper builds SVG.
 * Requires `pnpm build:napi` first.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const key = `${process.platform}-${process.arch}`;
const PLATFORM_PACKAGES = {
    "win32-x64": "@doki-land/fractal-win32-x64",
    "linux-x64": "@doki-land/fractal-linux-x64",
    "linux-arm64": "@doki-land/fractal-linux-arm64",
    "darwin-x64": "@doki-land/fractal-darwin-x64",
    "darwin-arm64": "@doki-land/fractal-darwin-arm64",
};
const pkg = PLATFORM_PACKAGES[key];
if (!pkg) {
    throw new Error(`Unsupported platform: ${key}`);
}

const binding = require(pkg).default;
const algae = binding.rewrite("A", ["A", "AB", "B", "A"], 3);
if (algae !== "ABAAB") {
    throw new Error(`rewrite smoke failed: got ${algae}`);
}

const plant = binding.growPlant(3, 8, 25);
if (!Array.isArray(plant.points) || plant.points.length < 2 || !(plant.sourceLength > 0)) {
    throw new Error(`growPlant smoke failed: ${JSON.stringify({ len: plant.points?.length, sourceLength: plant.sourceLength })}`);
}

const fern = binding.growFern(5_000, 42);
if (!Array.isArray(fern.points) || fern.points.length !== 5_000 || fern.count !== 5_000) {
    throw new Error(`growFern smoke failed: ${JSON.stringify({ len: fern.points?.length, count: fern.count })}`);
}
const fernAgain = binding.growFern(5_000, 42);
if (fern.points[0].x !== fernAgain.points[0].x || fern.points[0].y !== fernAgain.points[0].y) {
    throw new Error("growFern seed is not deterministic");
}

const field = binding.mandelbrot(48, 32, -0.5, 0.0, 3.0, 60);
if (field.width !== 48 || field.height !== 32 || field.values.length !== 48 * 32) {
    throw new Error(`mandelbrot smoke failed: ${JSON.stringify({ w: field.width, h: field.height, n: field.values?.length })}`);
}
if (field.values[16 * 48 + 24] !== 60) {
    throw new Error(`mandelbrot interior expected maxIter, got ${field.values[16 * 48 + 24]}`);
}

const melody = binding.growMelody(2, 120, 60);
if (!Array.isArray(melody.events) || melody.events.length < 1 || melody.count !== melody.events.length) {
    throw new Error(`growMelody smoke failed: ${JSON.stringify({ count: melody.count, len: melody.events?.length })}`);
}
if (typeof melody.events[0].time !== "number" || typeof melody.events[0].midi !== "number") {
    throw new Error(`growMelody event shape failed: ${JSON.stringify(melody.events[0])}`);
}
const melodyAgain = binding.growMelody(2, 120, 60);
if (melody.events[0].midi !== melodyAgain.events[0].midi || melody.events[0].time !== melodyAgain.events[0].time) {
    throw new Error("growMelody is not deterministic");
}

const dim = binding.boxCountingDimension(fern.points, 2);
if (typeof dim !== "number" || !(dim > 1 && dim < 2)) {
    throw new Error(`boxCountingDimension smoke failed: ${dim}`);
}

/** Mirrors `@doki-land/fractal` `toSvgPolyline` (compute ≠ paint). */
function toSvgPolyline(points, padding = 16) {
    if (points.length === 0) return { points: "", viewBox: "0 0 100 100" };
    let minX = points[0].x;
    let minY = points[0].y;
    let maxX = points[0].x;
    let maxY = points[0].y;
    for (const p of points) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
    }
    const width = Math.max(maxX - minX, 1) + padding * 2;
    const height = Math.max(maxY - minY, 1) + padding * 2;
    const serialized = points
        .map((p) => `${(p.x - minX + padding).toFixed(2)},${(p.y - minY + padding).toFixed(2)}`)
        .join(" ");
    return { points: serialized, viewBox: `0 0 ${width.toFixed(2)} ${height.toFixed(2)}` };
}

const svg = toSvgPolyline(plant.points, 16);
if (!svg.points || !svg.viewBox) {
    throw new Error(`toSvgPolyline failed: ${JSON.stringify(svg)}`);
}

console.log("smoke ok", {
    platform: pkg,
    algae,
    sourceLength: plant.sourceLength,
    pointCount: plant.points.length,
    fernCount: fern.count,
    mandelbrot: `${field.width}x${field.height}`,
    melodyCount: melody.count,
    fernDim: dim,
    viewBox: svg.viewBox,
});
