# Crear una obra en Markdown por cada cuento publicado

Migra el contenido editorial de `story` a `literaryWork`, convirtiendo de Portable Text a Markdown. Cada obra nace **mono-sección**.

No modifica los cuentos: itera `story` y crea documentos al lado. La baja del schema `story` es un trabajo aparte, y hasta entonces conviven.

## Mapeo

| `story`                  | `literaryWork`                    | Nota                                                                      |
| ------------------------ | --------------------------------- | ------------------------------------------------------------------------- |
| —                        | `_id`                             | `lw-from-story-<story._id>`                                               |
| `title`, `slug`          | igual                             | 1:1                                                                       |
| `author` (referencia)    | `authors` (array)                 | Array de un elemento; `_key` derivado del `_ref`                          |
| `body`                   | `content[0].body`                 | Convertido a Markdown                                                     |
| `epigraphs[]`            | `content[0].epigraphs[]`          | `_key` de origen preservado; `reference` se omite si falta                |
| —                        | `content[0].title`                | **Ausente**: no tiene origen. El schema lo declara opcional               |
| `review`                 | `editorialNote`                   | Campo **de documento**, no de sección. Se omite si la reseña está vacía   |
| `publishedAt`            | `publishedAt`                     | Cae al `_createdAt` **del cuento** cuando falta (581 de 613 lo necesitan) |
| `approximateReadingTime` | —                                 | **No se copia**: otro algoritmo de conteo                                 |
| —                        | `readingTime`, `totalReadingTime` | **No se escriben**: los puebla `pnpm backfill:reading-time`               |

El resto (`coverImage`, `tags`, `mediaSources`, `resources`, `badLanguage`, `originalPublication`) viaja sin transformar, y la clave se omite cuando el cuento no la tiene: las factories del dominio rechazan contenido vacío, así que un valor en blanco haría fallar la construcción del agregado al leerlo.

## Procedimiento

Los comandos se corren desde `cms/`. Sin `--project`/`--dataset` toman los de `sanity.cli.ts`; con ellos, **hay que pasar los dos**.

### 1. Censar el corpus

```bash
pnpm exec tsx --env-file=.env scripts/audit/audit-story-portable-text.ts   # desde la raíz
```

Read-only. Reporta construcciones de Portable Text fuera de lo que el conversor traduce, conteos, colisiones de slug, miembros de array sin `_key` y el baseline de fidelidad.

Si aparece una construcción no cubierta, se agrega **en el conversor** con su caso de prueba —no en esta migración—, según el protocolo de [su README](../../../resources/portable-text-to-markdown/README.md).

### 2. Dry-run

```bash
pnpm exec sanity migration run story-to-literary-work --project <id> --dataset <ds> > dry-run.log
```

Redirigir a archivo: son 613 documentos con el cuerpo completo, más de 26.000 líneas.

### 3. Contrastar fidelidad

Comparar el texto del origen contra el que produce el pipeline real (Markdown → HTML), **no** contar mutaciones: que el dry-run reporte 613 dice que alcanzó 613 documentos, no que no perdió nada.

Contrastar también los conteos contra el censo: obras con nota editorial, con epígrafes, con fecha de publicación, y que no se escriba ningún tiempo de lectura.

### 4. Aplicar

```bash
pnpm exec sanity migration run story-to-literary-work --project <id> --dataset <ds> --no-dry-run
```

Repetir la corrida después, para probar la idempotencia. El contador de la CLI **no** sirve como criterio: cuenta las mutaciones que la migración **emite**, no las que el servidor aplica, así que una segunda corrida vuelve a reportar 613. `createIfNotExists` descarta la mutación del lado del servidor cuando el `_id` ya existe, y eso se comprueba en el contenido:

- El documento no se reescribe: `_updatedAt` no avanza (`_rev` sí, por el toque de la transacción).
- Una corrección editorial posterior sobrevive: editar una obra migrada, republicarla y volver a correr la migración la deja intacta.

### 5. Poblar los tiempos de lectura

```bash
pnpm backfill:reading-time                 # en seco
pnpm backfill:reading-time --no-dry-run    # persiste
```

### 6. Verificar la lectura

Sobre una muestra representativa —una obra con epígrafes, una sin reseña, una con multimedia, una con enlaces en el cuerpo—: `/read/<slug>` debe renderizar cuerpo, epígrafes y nota editorial.

## Revertir

```bash
pnpm exec sanity migration run revert-story-to-literary-work --project <id> --dataset <ds>
pnpm exec sanity migration run revert-story-to-literary-work --project <id> --dataset <ds> --no-dry-run
```

Borra **solo** las obras cuyo `_id` lleva el prefijo derivado. Las nacidas en el Studio no se tocan: el predicado se comparte con la migración de ida y se comprueba documento por documento, no solo en el filtro.

Alcanza también a las obras **en borrador** que crea [`draft-story-to-literary-work`](../draft-story-to-literary-work/README.md), cuyo identificador lleva el mismo prefijo detrás del de path. O sea: descarta el corpus migrado entero. Para deshacer solo el lote de borradores está `revert-draft-story-to-literary-work`, que deja intactas las publicadas.

No restaura nada en los cuentos, porque la migración de ida no los tocó.

## Advertencia sobre `development`

El job `sync-datasets.yml` **borra y reimporta** `development` desde `production`. Una corrida de prueba puede desaparecer en la siguiente sincronización: conviene ejecutar la secuencia completa de una sentada.
