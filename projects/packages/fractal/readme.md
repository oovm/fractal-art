# @doki-land/fractal

Node facade for the fractal / L-system engine.

Heavy compute lives in Rust and ships as `@doki-land/fractal-<platform>`
Node-API binaries (same layout as `@doki-land/nifty`).

```bash
pnpm build:napi
```

```js
import { growPlant, rewrite } from "@doki-land/fractal";

const plant = growPlant(4);
console.log(plant.sourceLength, plant.viewBox);

const next = rewrite("A", ["A", "AB", "B", "A"], 3);
```
