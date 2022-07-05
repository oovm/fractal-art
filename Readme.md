Fractal Art
===========

Rust fractal / L-system engine — same packaging layout as **Nifty**:

| Package                           | Role                          |
|-----------------------------------|-------------------------------|
| `@doki-land/fractal`              | Facade API for Node           |
| `@doki-land/fractal-win32-x64`    | Node-API binary (Windows x64) |
| `@doki-land/fractal-linux-x64`    | Node-API binary (Linux x64)   |
| `@doki-land/fractal-linux-arm64`  | Node-API binary (Linux arm64) |
| `@doki-land/fractal-darwin-x64`   | Node-API binary (macOS x64)   |
| `@doki-land/fractal-darwin-arm64` | Node-API binary (macOS arm64) |
| `@doki-land/fractal-unknown-wasm32` | WASM binding (browser / wasm32) |

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
import {growPlant, rewrite, toSvgPolyline} from "@doki-land/fractal";

const plant = growPlant(4);
const svg = toSvgPolyline(plant.points);
console.log(plant.points.length, svg.viewBox);
```

```js
import {growFern, plotCanvas} from "@doki-land/fractal";

const fern = growFern(50_000, 42);
// plotCanvas(canvasEl, fern.points) in a browser / canvas host
console.log(fern.count);
```

```js
import {growSierpinski, sampleIfs} from "@doki-land/fractal";

const gasket = growSierpinski(40_000, 3);
console.log(gasket.count);
// sampleIfs(customMaps, iterations, seed, burnIn) for arbitrary affine IFS
```

```js
import {sampleClifford, sampleDejong} from "@doki-land/fractal";

const clifford = sampleClifford(-1.4, 1.6, 1.0, 0.7, 50_000);
const dejong = sampleDejong(-2, -2, -1.2, 2, 50_000);
console.log(clifford.count, dejong.count);
```

```js
import {sampleLorenz} from "@doki-land/fractal";

const lorenz = sampleLorenz(10, 28, 8 / 3, 0.01, 50_000, 200, "xy");
console.log(lorenz.count);
```

```js
import {mandelbrot, paintEscapeField} from "@doki-land/fractal";

const field = mandelbrot(640, 400, -0.5, 0, 3, 120);
// paintEscapeField(canvasEl, field) in a browser / canvas host
console.log(field.width, field.height, field.values.length);
```

```js
import {growMelody} from "@doki-land/fractal";

const melody = growMelody(3, 120, 60);
// playMelody(melody) in a browser with Web Audio
console.log(melody.count, melody.events[0]);
```

```js
import {growMelody, toMidiBytes} from "@doki-land/fractal";

const melody = growMelody(3, 120, 60);
const mid = toMidiBytes(melody, {tempoBpm: 120});
// save `mid` as a .mid file in the host
console.log(mid.byteLength);
```

```js
import {boxCountingDimension, correlationDimension, growFern} from "@doki-land/fractal";

const fern = growFern(20_000, 1);
console.log(boxCountingDimension(fern.points), correlationDimension(fern.points));
```

```js
import {logisticLyapunov, logisticLyapunovScan} from "@doki-land/fractal";

console.log(logisticLyapunov(3.9));
const scan = logisticLyapunovScan(2.5, 4.0, 256);
console.log(scan?.steps, scan?.values[0]);
```

## Web (homepage)

```bash
pnpm dev:web
```

Static production build: `pnpm --filter homepage build` → `projects/packages/homepage/dist/cdn`.

Cloudflare Pages: connect the Git repo in the dashboard (build command and output path are documented in `projects/packages/homepage/readme.md`). No Wrangler or extra CI workflow is required.

## Nifty

```bash
pnpm fmt
pnpm bump
pnpm placeholder:publish
pnpm trust
```
