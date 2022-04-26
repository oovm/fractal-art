Fractal Art
===========

Rust fractal / L-system engine published like **Nifty**: Node facade + platform packages.
Heavy compute is **WASM** (not pure TypeScript).

| Package | Role |
|---------|------|
| `@doki-land/fractal` | Facade API for Node |
| `@doki-land/fractal-win32-x64` | Platform WASM (Windows x64) |
| `@doki-land/fractal-linux-x64` | Platform WASM (Linux x64) |
| `@doki-land/fractal-linux-arm64` | Platform WASM (Linux arm64) |
| `@doki-land/fractal-darwin-x64` | Platform WASM (macOS x64) |
| `@doki-land/fractal-darwin-arm64` | Platform WASM (macOS arm64) |

## Layout

```text
projects/
  crates/
    fractal/             # Rust core
    fractal-wasm/        # wasm-bindgen cdylib (binding crate)
  packages/
    fractal/             # @doki-land/fractal
    fractal-<platform>/  # platform WASM packages
    homepage/            # demo site (VMZ host shell)
```

## Build

```bash
cargo test --release -p fractal
pnpm build:wasm
# or: pnpm test:wasm
```

## Node

```js
import { growPlant, rewrite } from "@doki-land/fractal";

const plant = growPlant(4);
console.log(plant.sourceLength, plant.viewBox);
```

## Web

```bash
pnpm build:wasm   # also copies web artifacts → homepage/public/wasm
pnpm dev:web
```
