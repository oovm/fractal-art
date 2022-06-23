import { defineConfig } from "@doki-land/nifty";

export default defineConfig({
    publish: {
        packages: [
            "@doki-land/fractal",
            "@doki-land/fractal-win32-x64",
            "@doki-land/fractal-linux-x64",
            "@doki-land/fractal-linux-arm64",
            "@doki-land/fractal-darwin-x64",
            "@doki-land/fractal-darwin-arm64",
            "@doki-land/fractal-unknown-wasm32",
        ],
    },
});
