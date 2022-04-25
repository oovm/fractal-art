# @doki-land/fractal

Node facade for the fractal / L-system engine.

Heavy compute lives in Rust and ships as the platform package
`@doki-land/fractal-wasm` (`@doki-land/fractal-<platform>`). Do not expect a pure-TS rewrite path.

```bash
pnpm build:wasm
```

```js
import { growPlant, rewrite } from "@doki-land/fractal";

const plant = await growPlant(4);
console.log(plant.sourceLength, plant.viewBox);

const next = await rewrite("A", ["A", "AB", "B", "A"], 3);
```
