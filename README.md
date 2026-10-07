# Uptime Monitor

pnpm monorepo: Express API + Vite/React/Tailwind web app, sharing types via `@uptime/shared`.

## Requirements

- Node `>=22.12` (see `.nvmrc`; Vite 8 requires 22.12+ on the 22 line)
- pnpm 10 (`corepack enable` picks up the pinned version)

## Getting started

```bash
pnpm install
pnpm dev          # api → http://localhost:3001, web → http://localhost:5173
```

Env files are optional in dev — both apps fall back to the values in their `.env.example`.
To override, copy them:

```bash
cp packages/api/.env.example packages/api/.env
cp packages/web/.env.example packages/web/.env
```

## Scripts

| Script           | What it does                                    |
| ---------------- | ----------------------------------------------- |
| `pnpm dev`       | Runs `api` (tsx watch) and `web` (Vite) together |
| `pnpm build`     | `api` → esbuild bundle, `web` → `vite build`    |
| `pnpm typecheck` | `tsc` (noEmit) in every package                 |

## Layout

```
packages/
  shared/   # types only, consumed as TS source (no build step)
  api/      # Express 5 — features/<name>/<name>.route.ts
  web/      # React 18 + Tailwind 4 — features/<name>/*.tsx, lib/api.ts
            # design tokens live in src/index.css (@theme); no tailwind/postcss config
```

## Conventions

- Feature folders only — no `controllers/`, `services/`, `utils/`, `helpers/`.
- One job per file. No wrappers, base classes, or DI.
- Shared contracts live in `@uptime/shared`.
- Backend env is parsed once in `packages/api/src/env.ts`; frontend uses `import.meta.env`.
- TypeScript strict everywhere (plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`).
