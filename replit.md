# Deck Builder

A Rayana's Bistro presentation studio for editing brand styling, planning hospitality revenue, and exporting versioned A4 landscape investor decks.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (use its managed workflow)
- `pnpm --filter @workspace/deck-builder run dev` — frontend (use its managed workflow for preview)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `doc/spec/deck-builder.md` — user-provided product specification
- `doc/ref/gemini-example-deck.pdf` — original reference presentation
- `artifacts/deck-builder/` — web studio and client-side deck rendering
- `lib/api-spec/openapi.yaml` — typed API contracts
- `artifacts/api-server/src/routes/deck-exports.ts` — versioned PDF save/download endpoints
- `doc/decks/` — generated PDF history (excluded from Git and publishing bundles)

## Architecture decisions

- Local PDF downloads and native print requests also archive a project PDF so every export can receive a version from one shared history. Browsers cannot inspect a user's Downloads directory.
- PDF writes use atomic exclusive publication: concurrent saves must never overwrite earlier versions.
- Project-folder PDF output is intentional, as explicitly requested. It is a workspace feature, not a promise of persistent shared storage in a published app.
- Source inspection reads the two known Rayana brand domains only, preventing arbitrary server-side URL access.

## Product

Six studio tabs cover styling, website context, browser-local assets, pitch intake, financial modeling, and a nine-slide deck preview. Export supports A4 landscape printing, local downloads, and project PDF history.

## User preferences

Conversation language: English. Use the supplied specification and reference deck. Every generated PDF save must find the highest existing output version and increment it.

## Gotchas

- Run OpenAPI code generation after editing the API specification.
- Native print can suggest a versioned filename but cannot control the final local destination or detect whether the print dialog was cancelled.
- Keep generated PDF history out of Git and deployment bundles; download important outputs to retain an independent copy.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
