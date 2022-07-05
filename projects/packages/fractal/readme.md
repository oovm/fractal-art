# @doki-land/fractal

Thin Node facade over `@doki-land/fractal-<platform>` NAPI binaries.

Heavy rewrite and turtle geometry run in Rust. SVG and Canvas helpers live in TypeScript (`src/render.ts`).

## Build

```bash
pnpm build:napi
```

## Usage

```js
import { growPlant, strokeCanvas, toSvgPolyline } from "@doki-land/fractal";

const plant = growPlant(4);
const svg = toSvgPolyline(plant.points);
```
