import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    boxCountingDimension,
    growFern,
    growMelody,
    growPlant,
    julia,
    mandelbrot,
    rewrite,
    toSvgPolyline,
} from "../src/index.ts";

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
