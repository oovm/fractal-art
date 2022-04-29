import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Browser-only WASM for homepage. Node uses `pnpm build:napi` + platform `.node` packages. */

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const crateDir = join(root, "projects/crates/fractal-wasm");
const homepagePublic = join(root, "projects/packages/homepage/public/wasm");
const staging = join(crateDir, "pkg-web");

rmSync(staging, { recursive: true, force: true });
execSync(
    "wasm-pack build --mode no-install --target web --release --out-dir pkg-web --out-name fractal_wasm",
    { cwd: crateDir, stdio: "inherit", shell: true },
);

for (const name of ["fractal_wasm.js", "fractal_wasm_bg.wasm"]) {
    const src = join(staging, name);
    if (!existsSync(src)) {
        throw new Error(`wasm-pack (web) missing artifact: ${name}`);
    }
}

rmSync(homepagePublic, { recursive: true, force: true });
mkdirSync(homepagePublic, { recursive: true });
cpSync(join(staging, "fractal_wasm.js"), join(homepagePublic, "fractal_wasm.js"));
cpSync(join(staging, "fractal_wasm_bg.wasm"), join(homepagePublic, "fractal_wasm_bg.wasm"));
console.log(`homepage public wasm -> ${homepagePublic}`);
