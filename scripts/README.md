# Scripts

Utilidades operacionales y de build del monorepo. **No** se versionan aquí migraciones one-off de datos ya corridas en producción: viven en el historial de git (p. ej. buscar commits previos a #1754).

## Convención

| Qué                                | Dónde                                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Build / config de la app           | raíz de `scripts/` (p. ej. `set-environment.ts`, `fix-index-file-name.mjs`)                                   |
| Operaciones reusables sobre Sanity | raíz de `scripts/` o npm script en `package.json` (p. ej. `delete-unused-assets`)                             |
| Auditoría / diagnóstico one-off    | [`scripts/audit/`](audit/README.md) — **no** se agregan a `package.json`                                      |
| Migración de datos one-off         | se escribe, se corre, se borra del working tree tras confirmar producción; el historial de git es el registro |

Para una migración nueva, copiá el patrón de un script histórico en git (p. ej. `delete-day-property-in-story.ts` en commits anteriores a #1754): cliente de Sanity, fetch por lotes, patches con `ifRevisionID`, dry-run cuando aplique.

## Scripts en la raíz (vivos)

- `set-environment.ts` — genera environments de Angular (`pnpm config`).
- `delete-unused-assets.ts` — borra assets huérfanos en Sanity (`pnpm delete-unused-assets`).
- `remove-all-unpublished-drafts.ts` — limpia drafts no publicados (operacional, no en package.json).
- `fix-index-file-name.mjs` — postbuild: renombra el index SSR.
- `vercel-environments.model.ts` — tipos compartidos con `cms/set-environment.ts`.
