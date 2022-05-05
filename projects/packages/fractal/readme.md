/**
 * `@doki-land/fractal` — thin Node facade.
 *
 * Heavy rewrite / turtle geometry runs in Rust (`@doki-land/fractal-<platform>`).
 * SVG / Canvas painting is TypeScript — see `src/render.ts`.
 *
 * ```bash
 * pnpm build:napi
 * ```
 *
 * ```js
 * import { growPlant, strokeCanvas, toSvgPolyline } from "@doki-land/fractal";
 *
 * const plant = growPlant(4);
 * const svg = toSvgPolyline(plant.points);
 * ```
 */
