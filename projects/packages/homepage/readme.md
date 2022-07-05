# homepage

Fractal demo site built with [VMZ](https://github.com/oovm/vmz-framework).

Runtime compute loads `@doki-land/fractal-unknown-wasm32` (pinned in `package.json`). Local dev may run `pnpm build:wasm` to refresh workspace WASM artifacts.

## Develop

```bash
pnpm install
pnpm dev:web
# or: pnpm --filter homepage dev
```

## Production build

```bash
pnpm --filter homepage build
```

Static output: `dist/cdn` (VMZ `static` delivery profile).

## Cloudflare Pages (Git integration)

Connect `oovm/fractal-art` in the Cloudflare dashboard. No Wrangler or GitHub Actions required.

| Setting | Value |
|---------|-------|
| Production branch | `dev` |
| Framework preset | None |
| Root directory | repository root |
| Build command | `corepack enable && corepack prepare pnpm@11.24.0 --activate && pnpm install --frozen-lockfile && pnpm --filter homepage build` |
| Build output directory | `projects/packages/homepage/dist/cdn` |
| `NODE_VERSION` (env) | `24` |

Do not enable SPA fallback. Routes are pre-rendered (`/turtle/index.html`, etc.) and `404.html` is emitted at the site root.
