# packages

npm workspace members and the public demo site live here.

| Path | Role |
|------|------|
| `fractal/` | Facade `@doki-land/fractal` |
| `fractal-win32-x64/` | Platform `@doki-land/fractal-win32-x64` |
| `fractal-linux-x64/` | Platform `@doki-land/fractal-linux-x64` |
| `fractal-linux-arm64/` | Platform `@doki-land/fractal-linux-arm64` |
| `fractal-darwin-x64/` | Platform `@doki-land/fractal-darwin-x64` |
| `fractal-darwin-arm64/` | Platform `@doki-land/fractal-darwin-arm64` |
| `homepage/` | Demo site host ([VMZ](https://github.com/oovm/vmz-framework) + `@vmz/ui`) |

Same split as `npm-tools` / Nifty: facade + `@doki-land/*-<platform>`. Heavy fractal work stays in Rust → WASM.
