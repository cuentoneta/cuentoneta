# Scripts del monorepo

> Convención para agentes y colaboradores sobre qué vive en `scripts/` y qué no. Detalle de auditoría/diagnóstico Sanity: [`scripts/audit/README.md`](../../scripts/audit/README.md).

## Convención

| Qué                                | Dónde                                                                             |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| Build / config de la app           | raíz de `scripts/` (p. ej. `set-environment.ts`, `fix-index-file-name.mjs`)       |
| Operaciones reusables sobre Sanity | raíz de `scripts/` o npm script en `package.json` (p. ej. `delete-unused-assets`) |
| Auditoría / diagnóstico one-off    | `scripts/audit/` — **no** se agregan a `package.json`                             |

**No** viven en `scripts/` las migraciones de datos: se delegan exclusivamente a la infraestructura de migrations de Sanity → [`sanity-migrations.md`](sanity-migrations.md).

## Scripts en la raíz (vivos)

- `set-environment.ts` — genera environments de Angular (`pnpm config`).
- `delete-unused-assets.ts` — borra assets huérfanos en Sanity (`pnpm delete-unused-assets`).
- `remove-all-unpublished-drafts.ts` — limpia drafts no publicados (operacional, no en package.json).
- `fix-index-file-name.mjs` — postbuild: renombra el index SSR.
- `vercel-environments.model.ts` — tipos compartidos con `cms/set-environment.ts`.
- `check-agent-frontmatter.ts` — valida el frontmatter de `.claude/agents/` (`pnpm check:agents`, gate de CI `check-agents`).
