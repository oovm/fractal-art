# packages

npm workspace members — same split as Nifty (`npm-tools`).

| Path | Role |
|------|------|
| `fractal/` | Facade `@doki-land/fractal` |
| `fractal-win32-x64/` | Platform Node-API |
| `fractal-linux-x64/` | Platform Node-API |
| `fractal-linux-arm64/` | Platform Node-API |
| `fractal-darwin-x64/` | Platform Node-API |
| `fractal-darwin-arm64/` | Platform Node-API |
| `fractal-unknown-wasm32/` | Browser / wasm32 binding |
| `homepage/` | Demo site (VMZ + WASM) |

Build platform `.node` binaries with `pnpm build:napi`. Refresh browser WASM with `pnpm build:wasm`.

Repo tooling: `nifty` (`pnpm fmt`, `bump`, `publish`, `trust`).
