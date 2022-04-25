/**
 * Smoke: Node loads `@doki-land/fractal-wasm` (platform package).
 * Requires `pnpm build:wasm` first.
 */
import { growPlant, rewrite } from "@doki-land/fractal-wasm";

const algae = rewrite("A", ["A", "AB", "B", "A"], 3);
if (algae !== "ABAAB") {
    throw new Error(`rewrite smoke failed: got ${algae}`);
}

const plant = growPlant(3, 8, 25, 16);
if (!plant.points || !plant.viewBox || !(plant.sourceLength > 0)) {
    throw new Error(`growPlant smoke failed: ${JSON.stringify(plant)}`);
}

console.log("smoke ok", { algae, sourceLength: plant.sourceLength, viewBox: plant.viewBox });
