# packages

npm workspace members — same split as `npm-tools` / Nifty.

| Path | Role |
|------|------|
| `fractal/` | Facade `@doki-land/fractal` |
| `fractal-win32-x64/` | Platform Node-API |
| `fractal-linux-x64/` | Platform Node-API |
| `fractal-linux-arm64/` | Platform Node-API |
| `fractal-darwin-x64/` | Platform Node-API |
| `fractal-darwin-arm64/` | Platform Node-API |
| `homepage/` | Demo site (VMZ + browser WASM) |

Build platform binaries with `pnpm build:napi`. Manage the repo with `nifty` (`pnpm fmt` / `bump` / `publish` / `trust`).
