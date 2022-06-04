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
pnpm test
```

## Node

```js
import { growPlant, rewrite, toSvgPolyline } from "@doki-land/fractal";

const plant = growPlant(4);
const svg = toSvgPolyline(plant.points);
console.log(plant.points.length, svg.viewBox);
```

```js
import { growFern, plotCanvas } from "@doki-land/fractal";

const fern = growFern(50_000, 42);
// plotCanvas(canvasEl, fern.points) in a browser / canvas host
console.log(fern.count);
```

```js
import { growSierpinski, sampleIfs } from "@doki-land/fractal";

const gasket = growSierpinski(40_000, 3);
console.log(gasket.count);
// sampleIfs(customMaps, iterations, seed, burnIn) for arbitrary affine IFS
```

```js
import { sampleClifford, sampleDejong } from "@doki-land/fractal";

const clifford = sampleClifford(-1.4, 1.6, 1.0, 0.7, 50_000);
const dejong = sampleDejong(-2, -2, -1.2, 2, 50_000);
console.log(clifford.count, dejong.count);
```

```js
import { sampleLorenz } from "@doki-land/fractal";

const lorenz = sampleLorenz(10, 28, 8 / 3, 0.01, 50_000, 200, "xy");
console.log(lorenz.count);
```

```js
import { mandelbrot, paintEscapeField } from "@doki-land/fractal";

const field = mandelbrot(640, 400, -0.5, 0, 3, 120);
// paintEscapeField(canvasEl, field) in a browser / canvas host
console.log(field.width, field.height, field.values.length);
```

```js
import { growMelody } from "@doki-land/fractal";

const melody = growMelody(3, 120, 60);
// playMelody(melody) in a browser with Web Audio
console.log(melody.count, melody.events[0]);
```

```js
import { growMelody, toMidiBytes } from "@doki-land/fractal";

const melody = growMelody(3, 120, 60);
const mid = toMidiBytes(melody, { tempoBpm: 120 });
// save `mid` as a .mid file in the host
console.log(mid.byteLength);
```

```js
import { boxCountingDimension, growFern } from "@doki-land/fractal";

const fern = growFern(20_000, 1);
console.log(boxCountingDimension(fern.points));
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
