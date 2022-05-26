import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fitBounds, toSvgPolyline } from "../src/render.ts";

describe("fitBounds", () => {
    it("pads an empty path with a unit box", () => {
        assert.deepEqual(fitBounds([]), { minX: 0, minY: 0, width: 100, height: 100 });
    });

    it("includes padding around a diagonal segment", () => {
        const box = fitBounds(
            [
                { x: 0, y: 0 },
                { x: 10, y: 20 },
            ],
            5,
        );
        assert.equal(box.minX, -5);
        assert.equal(box.minY, -5);
        assert.equal(box.width, 20);
        assert.equal(box.height, 30);
    });
});

describe("toSvgPolyline", () => {
    it("serializes points into SVG polyline + viewBox", () => {
        const svg = toSvgPolyline(
            [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
            ],
            0,
        );
        assert.equal(svg.points, "0.00,0.00 10.00,0.00");
        assert.equal(svg.viewBox, "0 0 10.00 1.00");
    });

    it("returns an empty polyline for no points", () => {
        const svg = toSvgPolyline([]);
        assert.equal(svg.points, "");
        assert.equal(svg.viewBox, "0 0 100 100");
    });
});
