import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const libDir = join(dirname(fileURLToPath(import.meta.url)), "lib");
const bindingPath = join(libDir, "fractal_wasm.cjs");

if (!existsSync(bindingPath)) {
    throw new Error(
        `Missing WASM binding at ${bindingPath}. Run \`pnpm build:wasm\` from the fractal-art workspace root.`,
    );
}

const binding = require(bindingPath);

export const rewrite = binding.rewrite;
export const growPlant = binding.growPlant;
export default binding;
