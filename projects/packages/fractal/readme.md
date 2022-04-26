# `@doki-land/fractal`

Node facade for the fractal / L-system engine.

Heavy compute lives in Rust WASM and ships as platform packages
`@doki-land/fractal-<platform>` (same pattern as `@doki-land/nifty`).

```bash
pnpm build:wasm
```

```js
import { growPlant, rewrite } from "@doki-land/fractal";

const plant = growPlant(4);
console.log(plant.sourceLength, plant.viewBox);

const next = rewrite("A", ["A", "AB", "B", "A"], 3);
```
