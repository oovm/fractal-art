import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const crateDir = join(root, "projects/crates/fractal-wasm");
const nodeOut = join(root, "projects/packages/fractal-wasm/lib");
const webOut = join(root, "projects/packages/fractal-wasm/lib-web");
const homepagePublic = join(root, "projects/packages/homepage/public/wasm");

function buildTarget(target, stagingName, dest) {
    const staging = join(crateDir, stagingName);
    rmSync(staging, { recursive: true, force: true });
    rmSync(dest, { recursive: true, force: true });
    mkdirSync(dest, { recursive: true });

    execSync(
        `wasm-pack build --mode no-install --target ${target} --release --out-dir ${stagingName} --out-name fractal_wasm`,
        { cwd: crateDir, stdio: "inherit", shell: true },
    );

    const required = [
        ["fractal_wasm.js", target === "nodejs" ? "fractal_wasm.cjs" : "fractal_wasm.js"],
        ["fractal_wasm_bg.wasm", "fractal_wasm_bg.wasm"],
        ["fractal_wasm.d.ts", "fractal_wasm.d.ts"],
    ];
    for (const [srcName, destName] of required) {
        const src = join(staging, srcName);
        if (!existsSync(src)) {
            throw new Error(`wasm-pack (${target}) missing artifact: ${srcName}`);
        }
        cpSync(src, join(dest, destName));
    }

    writeFileSync(
        join(dest, "package-marker.json"),
        JSON.stringify({ builtAt: new Date().toISOString(), target }, null, 4) + "\n",
    );

    const pkgJson = JSON.parse(readFileSync(join(staging, "package.json"), "utf8"));
    writeFileSync(
        join(dest, "wasm-pack.meta.json"),
        JSON.stringify({ name: pkgJson.name, files: pkgJson.files ?? [] }, null, 4) + "\n",
    );

    console.log(`wasm (${target}) -> ${dest}`);
}

buildTarget("nodejs", "pkg-node", nodeOut);
buildTarget("web", "pkg-web", webOut);

rmSync(homepagePublic, { recursive: true, force: true });
mkdirSync(homepagePublic, { recursive: true });
for (const name of ["fractal_wasm.js", "fractal_wasm_bg.wasm"]) {
    cpSync(join(webOut, name), join(homepagePublic, name));
}
console.log(`homepage public wasm -> ${homepagePublic}`);
