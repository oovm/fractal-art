# packages

npm workspace members and the public demo site live here.

| Path | Role |
|------|------|
| `fractal/` | Facade `@doki-land/fractal` (Node API) |
| `fractal-wasm/` | Platform `@doki-land/fractal-wasm` (`fractal-<platform>`, Node + web WASM) |
| `homepage/` | Demo site host ([VMZ](https://github.com/oovm/vmz-framework) + `@vmz/ui`) |

Heavy fractal work stays in Rust → WASM. Do not put rewrite / turtle compute in pure TypeScript packages.
