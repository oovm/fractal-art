import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toMidiBytes } from "../src/audio.ts";

describe("toMidiBytes", () => {
    it("writes an SMF header and at least one note-on/off pair", () => {
        const bytes = toMidiBytes(
            [
                { time: 0, midi: 60, duration: 0.5, velocity: 0.8 },
                { time: 0.5, midi: 64, duration: 0.5, velocity: 0.6 },
            ],
            { tempoBpm: 120, ppq: 480 },
        );
        assert.equal(bytes[0], 0x4d); // M
        assert.equal(bytes[1], 0x54); // T
        assert.equal(bytes[2], 0x68); // h
        assert.equal(bytes[3], 0x64); // d
        const asStr = String.fromCharCode(...bytes.slice(0, 4));
        assert.equal(asStr, "MThd");
        assert.ok(bytes.includes(0x90), "note-on");
        assert.ok(bytes.includes(0x80), "note-off");
        assert.ok(bytes.length > 30);
    });

    it("encodes an empty melody as a valid empty track", () => {
        const bytes = toMidiBytes([]);
        assert.equal(String.fromCharCode(...bytes.slice(0, 4)), "MThd");
        assert.ok(bytes.length >= 22);
    });
});
