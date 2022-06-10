import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    boxCountingDimension,
    correlationDimension,
    growFern,
    growMelody,
    growPlant,
    growSierpinski,
    julia,
    logisticLyapunov,
    logisticLyapunovScan,
    mandelbrot,
    rewrite,
    sampleClifford,
    sampleDejong,
    sampleIfs,
    sampleLorenz,
    toSvgPolyline,
} from "../src/index.ts";

/** Classic Barnsley fern maps — same coefficients as the Rust preset. */
const BARNSLEY = [
    { a: 0.0, b: 0.0, c: 0.0, d: 0.16, e: 0.0, f: 0.0, weight: 0.01 },
    { a: 0.85, b: 0.04, c: -0.04, d: 0.85, e: 0.0, f: 1.6, weight: 0.85 },
    { a: 0.2, b: -0.26, c: 0.23, d: 0.22, e: 0.0, f: 1.6, weight: 0.07 },
    { a: -0.15, b: 0.28, c: 0.26, d: 0.24, e: 0.0, f: 0.44, weight: 0.07 },
];

describe("rewrite / growPlant", () => {
    it("rewrites algae like Lindenmayer", () => {
        assert.equal(rewrite("A", ["A", "AB", "B", "A"], 3), "ABAAB");
    });

    it("returns turtle geometry without baking SVG in native", () => {
        const plant = growPlant(3, 8, 25);
        assert.ok(plant.points.length >= 2);
        assert.ok(plant.sourceLength > 0);
        assert.equal(plant.source.length, plant.sourceLength);
        const svg = toSvgPolyline(plant.points, 16);
        assert.ok(svg.points.includes(","));
        assert.match(svg.viewBox, /^0 0 /);
    });
});

describe("growFern", () => {
    it("samples a deterministic IFS point cloud", () => {
        const a = growFern(5_000, 42);
        const b = growFern(5_000, 42);
        assert.equal(a.count, 5_000);
        assert.equal(a.points.length, 5_000);
        assert.equal(a.points[0].x, b.points[0].x);
        assert.equal(a.points[0].y, b.points[0].y);
        const other = growFern(5_000, 99);
        assert.notEqual(a.points[0].x, other.points[0].x);
    });
});

describe("sampleIfs / growSierpinski", () => {
    it("matches growFern when given Barnsley maps", () => {
        const viaSample = sampleIfs(BARNSLEY, 2_000, 11, 20);
        const viaFern = growFern(2_000, 11);
        assert.equal(viaSample.count, viaFern.count);
        assert.equal(viaSample.points[0].x, viaFern.points[0].x);
        assert.equal(viaSample.points[0].y, viaFern.points[0].y);
        assert.equal(
            viaSample.points[viaSample.points.length - 1].x,
            viaFern.points[viaFern.points.length - 1].x,
        );
    });

    it("samples a deterministic Sierpiński cloud", () => {
        const a = growSierpinski(3_000, 3);
        const b = growSierpinski(3_000, 3);
        assert.equal(a.count, 3_000);
        assert.equal(a.points[0].x, b.points[0].x);
        assert.equal(a.points[0].y, b.points[0].y);
        for (const p of a.points) {
            assert.ok(p.x >= -0.05 && p.x <= 1.05);
            assert.ok(p.y >= -0.05 && p.y <= 1.0);
        }
    });
});

describe("sampleClifford / sampleDejong", () => {
    it("samples a deterministic Clifford cloud", () => {
        const a = sampleClifford(-1.4, 1.6, 1.0, 0.7, 4_000, 50);
        const b = sampleClifford(-1.4, 1.6, 1.0, 0.7, 4_000, 50);
        assert.equal(a.count, 4_000);
        assert.equal(a.points[0].x, b.points[0].x);
        assert.equal(a.points[0].y, b.points[0].y);
        for (const p of a.points) {
            assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y));
            assert.ok(Math.abs(p.x) < 3 && Math.abs(p.y) < 3);
        }
    });

    it("samples a non-degenerate de Jong cloud", () => {
        const cloud = sampleDejong(-2, -2, -1.2, 2, 2_000, 20);
        assert.equal(cloud.count, 2_000);
        assert.ok(cloud.points.some((p) => p.x !== cloud.points[0].x || p.y !== cloud.points[0].y));
    });
});

describe("sampleLorenz", () => {
    it("samples a deterministic xy projection", () => {
        const a = sampleLorenz(10, 28, 8 / 3, 0.01, 4_000, 200, "xy");
        const b = sampleLorenz(10, 28, 8 / 3, 0.01, 4_000, 200, "xy");
        assert.equal(a.count, 4_000);
        assert.equal(a.points[0].x, b.points[0].x);
        assert.equal(a.points[0].y, b.points[0].y);
        assert.ok(a.points.some((p) => Math.abs(p.x - a.points[0].x) > 1));
        for (const p of a.points) {
            assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y));
            assert.ok(Math.abs(p.x) < 40 && Math.abs(p.y) < 40);
        }
    });
});

describe("escape fields", () => {
    it("marks Mandelbrot cardioid interior as maxIter", () => {
        const field = mandelbrot(48, 32, -0.5, 0, 3, 60);
        assert.equal(field.width, 48);
        assert.equal(field.height, 32);
        assert.equal(field.values.length, 48 * 32);
        assert.equal(field.values[16 * 48 + 24], 60);
        assert.ok(field.values[16 * 48 + 0] < 10);
    });

    it("samples a Julia field with the same shape contract", () => {
        const field = julia(40, 30, 0, 0, 3, -0.8, 0.156, 50);
        assert.equal(field.width, 40);
        assert.equal(field.height, 30);
        assert.equal(field.values.length, 40 * 30);
        assert.ok(field.maxIter >= 50);
        assert.ok(field.values.some((v) => v < field.maxIter));
        assert.ok(field.values.some((v) => v === field.maxIter));
    });
});

describe("growMelody", () => {
    it("emits deterministic timed note events", () => {
        const a = growMelody(2, 120, 60);
        const b = growMelody(2, 120, 60);
        assert.ok(a.count >= 1);
        assert.equal(a.count, a.events.length);
        assert.equal(a.events[0].midi, b.events[0].midi);
        assert.equal(a.events[0].time, b.events[0].time);
        for (let i = 1; i < a.events.length; i++) {
            assert.ok(a.events[i].time >= a.events[i - 1].time);
        }
    });
});

describe("boxCountingDimension", () => {
    it("estimates fern dimension between 1 and 2", () => {
        const fern = growFern(5_000, 42);
        const dim = boxCountingDimension(fern.points, 2);
        assert.equal(typeof dim, "number");
        assert.ok(dim! > 1 && dim! < 2, `dim=${dim}`);
    });
});

describe("correlationDimension", () => {
    it("estimates fern correlation dimension between 1 and 2", () => {
        const fern = growFern(5_000, 42);
        const dim = correlationDimension(fern.points, 350);
        assert.equal(typeof dim, "number");
        assert.ok(dim! > 1 && dim! < 2, `dim=${dim}`);
    });
});

describe("logisticLyapunov", () => {
    it("is negative for stable r=2 and positive near r=3.9", () => {
        const stable = logisticLyapunov(2, 2_000, 200);
        const chaotic = logisticLyapunov(3.9, 4_000, 400);
        assert.equal(typeof stable, "number");
        assert.equal(typeof chaotic, "number");
        assert.ok(stable! < -0.5, `stable=${stable}`);
        assert.ok(chaotic! > 0, `chaotic=${chaotic}`);
    });

    it("scans a range with both signs", () => {
        const scan = logisticLyapunovScan(2.5, 4.0, 64, 1_500, 150);
        assert.ok(scan);
        assert.equal(scan!.steps, 64);
        assert.equal(scan!.values.length, 64);
        assert.ok([...scan!.values].some((v) => v < 0));
        assert.ok([...scan!.values].some((v) => v > 0));
    });
});
