Fractal Art
===========

Rust fractal / L-system engine — same packaging layout as **Nifty**:

| Package | Role |
|---------|------|
| `@doki-land/fractal` | Facade API for Node |
| `@doki-land/fractal-win32-x64` | Node-API binary (Windows x64) |
| `@doki-land/fractal-linux-x64` | Node-API binary (Linux x64) |
| `@doki-land/fractal-linux-arm64` | Node-API binary (Linux arm64) |
| `@doki-land/fractal-darwin-x64` | Node-API binary (macOS x64) |
| `@doki-land/fractal-darwin-arm64` | Node-API binary (macOS arm64) |

Heavy compute stays in Rust. Repo tooling uses [`@doki-land/nifty`](https://www.npmjs.com/package/@doki-land/nifty).

## Layout

```text
projects/
  crates/
    fractal/             # Rust core
    fractal-napi/        # Node-API cdylib (like nifty-napi)
    fractal-wasm/        # browser WASM for homepage only
  packages/
    fractal/             # @doki-land/fractal
    fractal-<platform>/  # platform Node-API packages
    homepage/            # demo site (VMZ + browser WASM)
```

## Build

```bash
pnpm install
pnpm build:napi
cargo test --release -p fractal
pnpm test:napi
```

## Node

```js
import { growPlant, rewrite } from "@doki-land/fractal";

const plant = growPlant(4);
console.log(plant.sourceLength, plant.viewBox);
```

## Web (homepage)

```bash
pnpm build:wasm
pnpm dev:web
```

## Nifty

```bash
pnpm fmt
pnpm bump
pnpm publish
pnpm trust
```
