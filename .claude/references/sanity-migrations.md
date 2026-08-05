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

### Una migración puede crear documentos de otro tipo

`migrate.document` no está limitado a parchear el documento que recibe: puede devolver mutaciones dirigidas a **otro** documento, incluso de otro tipo. Eso habilita migrar iterando un tipo y escribiendo otro — `documentTypes` acota qué se **recorre**, no qué se **escribe**.

Ejemplo vivo: [`cms/migrations/story-to-literary-work/`](../../cms/migrations/story-to-literary-work/) recorre `story` y emite `createIfNotExists` sobre `literaryWork`, sin tocar el cuento de origen.

Cuando una migración crea documentos, tres decisiones se resuelven juntas con **un `_id` derivado** del documento de origen:

| Necesidad                        | Cómo la resuelve el `_id` derivado                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| Correspondencia origen ↔ destino | El id dice de qué documento salió, sin sumar un campo al schema                    |
| Idempotencia                     | Con `createIfNotExists`, repetir la corrida es un no-op **del lado del servidor**  |
| Reversión                        | Una migración hermana filtra por el prefijo y borra **solo** lo que la de ida creó |

Preferir `createIfNotExists` sobre `createOrReplace`: el segundo refresca el contenido a costa de pisar lo que alguien haya editado a mano después de migrar.

El predicado que reconoce un documento migrado se declara **una sola vez** y lo importan ambas migraciones. Si cada una tuviera el suyo, una divergencia entre las dos definiciones podría dejar documentos sin borrar —o borrar de más—. Y el guard va **dentro** de `migrate.document`, no solo en el `filter`: el filtro es una optimización del recorrido, no la garantía.

### Migraciones que convierten contenido

Las que llevan rich text a Markdown consumen [`resources/portable-text-to-markdown/`](../../resources/portable-text-to-markdown/README.md), que **falla ante lo que no sabe traducir** en vez de descartarlo en silencio. Antes de correr una conversión sobre el corpus, censar qué construcciones usa realmente el dataset (ver `scripts/audit/`): descubrirlo con la migración la detendría en el primer documento raro, con los anteriores ya escritos.

Que una corrida reporte N mutaciones dice que **alcanzó** N documentos, no que no perdió contenido —ni, al aplicar, que haya escrito algo: el contador cuenta lo que la migración emite, no lo que el servidor termina aplicando—. La verificación de fidelidad se hace comparando el texto de origen contra el que produce el pipeline real, y la de idempotencia mirando si el contenido cambió, no contando mutaciones.

## Cómo correrlas

Desde `cms/` (la CLI toma `projectId`/`dataset` de las env `SANITY_STUDIO_*` vía `sanity.cli.ts`):

```bash
# Listar migraciones disponibles
pnpm exec sanity migration list

# Dry-run (por defecto): muestra las mutaciones sin aplicarlas
pnpm exec sanity migration run <slug>

# Aplicar de verdad
pnpm exec sanity migration run <slug> --no-dry-run
```

> `cms/package.json` no define un script `sanity`: la forma **`pnpm exec`** invoca el binario de `node_modules/.bin` de manera explícita. (`pnpm sanity …` también funciona hoy, porque pnpm cae al binario cuando no encuentra un script homónimo, pero esa resolución dejaría de aplicar si algún día se agregara un script con ese nombre.)

Correr siempre el dry-run antes de aplicar. Para un dataset u objetivo distinto usar los flags `--dataset` / `--project` de la CLI, como hace el skill [`release-workflow`](../skills/release-workflow/SKILL.md) al migrar contra producción.
