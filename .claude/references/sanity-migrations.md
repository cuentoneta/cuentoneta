# Migraciones de datos (Sanity)

> Convención para agentes y colaboradores sobre migraciones de datos del contenido. Las migraciones **no** viven en `scripts/` (ver [`scripts.md`](scripts.md)): se delegan a la infraestructura de migrations de Sanity, versionada en `cms/migrations/`.

## Dónde viven

| Qué                | Dónde                                                          |
| ------------------ | -------------------------------------------------------------- |
| Migración de datos | `cms/migrations/<slug>/index.ts` (un directorio por migración) |
| Definición         | `export default defineMigration({...})` de `sanity/migrate`    |

A diferencia de los scripts one-off (que se borran del working tree tras correr), las migraciones **se versionan y se conservan** en `cms/migrations/`: quedan como registro reproducible del cambio aplicado al contenido.

## Convención

- Un directorio por migración con un `index.ts` que exporta por defecto una `defineMigration`.
- El `title` describe la intención en español; `documentTypes` acota los tipos afectados.
- Preferir las utilidades declarativas (`at`, `setIfMissing`, `set`, `unset`, …) sobre mutaciones crudas.
- Comentar el **porqué** de la migración (qué la motiva, qué caso cubre que `initialValue` no cubre), no el qué.
- Migraciones idempotentes cuando sea posible (p. ej. `setIfMissing` para backfills).

Ejemplo vivo: [`cms/migrations/set-default-story-coverimage/index.ts`](../../cms/migrations/set-default-story-coverimage/index.ts) — backfill de `coverImage` (ahora requerido) en historias previas al campo.

## Cómo correrlas

Desde `cms/` (la CLI toma `projectId`/`dataset` de las env `SANITY_STUDIO_*` vía `sanity.cli.ts`):

```bash
# Listar migraciones disponibles
pnpm sanity migration list

# Dry-run (por defecto): muestra las mutaciones sin aplicarlas
pnpm sanity migration run <slug>

# Aplicar de verdad
pnpm sanity migration run <slug> --no-dry-run
```

Correr siempre el dry-run antes de aplicar. Para un dataset u objetivo distinto usar los flags `--dataset` / `--project` de la CLI.
