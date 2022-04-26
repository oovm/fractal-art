import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const crateDir = join(root, "projects/crates/fractal-wasm");
const homepagePublic = join(root, "projects/packages/homepage/public/wasm");

/** Same platform dirs as `npm-tools` / `@doki-land/nifty-<platform>`. */
const PLATFORM_PACKAGES = [
    "fractal-win32-x64",
    "fractal-linux-x64",
    "fractal-linux-arm64",
    "fractal-darwin-x64",
    "fractal-darwin-arm64",
];

function buildTarget(target, stagingName) {
    const staging = join(crateDir, stagingName);
    rmSync(staging, { recursive: true, force: true });

    execSync(
        `wasm-pack build --mode no-install --target ${target} --release --out-dir ${stagingName} --out-name fractal_wasm`,
        { cwd: crateDir, stdio: "inherit", shell: true },
    );

    const required =
        target === "nodejs"
            ? [
                  ["fractal_wasm.js", "fractal_wasm.cjs"],
                  ["fractal_wasm_bg.wasm", "fractal_wasm_bg.wasm"],
              ]
            : [
                  ["fractal_wasm.js", "fractal_wasm.js"],
                  ["fractal_wasm_bg.wasm", "fractal_wasm_bg.wasm"],
              ];

    for (const [srcName] of required) {
        const src = join(staging, srcName);
        if (!existsSync(src)) {
            throw new Error(`wasm-pack (${target}) missing artifact: ${srcName}`);
        }
    }

    return { staging, required };
}

function copyIntoLib(staging, required, libDir) {
    rmSync(libDir, { recursive: true, force: true });
    mkdirSync(libDir, { recursive: true });
    for (const [srcName, destName] of required) {
        cpSync(join(staging, srcName), join(libDir, destName));
    }
}

const node = buildTarget("nodejs", "pkg-node");
for (const packageDir of PLATFORM_PACKAGES) {
    const libDir = join(root, "projects/packages", packageDir, "lib");
    copyIntoLib(node.staging, node.required, libDir);
    console.log(`wasm (nodejs) -> ${packageDir}/lib`);
}

const web = buildTarget("web", "pkg-web");
rmSync(homepagePublic, { recursive: true, force: true });
mkdirSync(homepagePublic, { recursive: true });
for (const [srcName, destName] of web.required) {
    cpSync(join(web.staging, srcName), join(homepagePublic, destName));
}
console.log(`homepage public wasm -> ${homepagePublic}`);
