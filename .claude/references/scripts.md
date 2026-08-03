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

- `set-environment.ts` — genera environments de Angular (`pnpm config`). Emite `environment.indexable` (postura de indexado SEO): `true` solo en producción, o forzado con `SEO_INDEXABLE=true` para una build no productiva con URLs locales (lo usa el job de e2e para validar el HTML indexable del crawler contra el server SSR local).
- `backfill-reading-time.ts` — persiste el reading time faltante de las obras literarias (`pnpm backfill:reading-time`). **Corre en seco por defecto** y solo escribe con `--no-dry-run`; el patch va con `setIfMissing`, así que es idempotente y no pisa una duración cargada a mano. Su lógica vive en `backfill-reading-time.helpers.ts`, con spec propio.
  **Por qué es un script y no una migración** ([`sanity-migrations.md`](sanity-migrations.md)): una migración corrige de una vez un dataset que quedó desalineado con un cambio de schema. Esto es **recurrente** — cada obra nueva nace sin sus valores y hay que volver a correrlo—, y su cómputo depende de los helpers de dominio del kernel, que son de la app y no del Studio. Un backfill que se repite es una tarea de operación, no un cambio de forma del dato.
- `delete-unused-assets.ts` — borra assets huérfanos en Sanity (`pnpm delete-unused-assets`).
- `remove-all-unpublished-drafts.ts` — limpia drafts no publicados (operacional, no en package.json).
- `fix-index-file-name.mjs` — postbuild: renombra el index SSR.
- `vercel-environments.model.ts` — tipos compartidos con `cms/set-environment.ts`.
- `block-issue-refs-in-comments.ts` — hook `PreToolUse` de `Edit`/`Write` (registrado en `.claude/settings.json`): rechaza escribir un comentario de código bajo `src/` que cite un issue, salvo las dos excepciones de la Sección 3 de [`coding-agent-policies.md`](coding-agent-policies.md). El predicado vive en `block-issue-refs-in-comments.helpers.ts`, con spec propio; el runner solo lee stdin y traduce el resultado a un código de salida. **Es una ayuda local, no un gate**: solo ve el texto que la herramienta agrega, así que lo ya commiteado, o lo escrito por Bash o por otro editor, queda fuera de su alcance.
- `check-claude-docs.ts` — runner del gate `check-agents` (`pnpm check:agents`): agrega los fallos de `check-agent-frontmatter.ts` (frontmatter de agentes), `check-doc-refs.ts` (anclas a `CLAUDE.md` + rutas citadas) y `check-issue-refs.ts` (menciones a issues fuera de la allowlist de gobernanza) en una sola pasada.
