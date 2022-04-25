Fractal Art
===========

Rust fractal / L-system engine published as **Node + WASM** (not pure TypeScript):

| Package | Role |
|---------|------|
| `@doki-land/fractal` | Facade API for Node |
| `@doki-land/fractal-wasm` | Platform package (`@doki-land/fractal-<platform>`) |

## Layout

```text
projects/
  crates/
    fractal/             # Rust core
    fractal-wasm/        # wasm-bindgen cdylib
  packages/
    fractal/             # @doki-land/fractal
    fractal-wasm/        # @doki-land/fractal-wasm
    homepage/            # demo site (VMZ host shell)
```

## Build

```bash
cargo test --release -p fractal
pnpm build:wasm
# or: pnpm test
```

## Node

```js
import { growPlant, rewrite } from "@doki-land/fractal";

const plant = await growPlant(4);
console.log(plant.sourceLength, plant.viewBox);
```

## Web

```bash
pnpm build:wasm   # also copies lib-web → homepage/public/wasm
pnpm dev:web
```
