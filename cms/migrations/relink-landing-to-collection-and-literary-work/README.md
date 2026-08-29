# `relink-landing-to-collection-and-literary-work`

Puebla los campos de la página de inicio y del contenido rotativo que referencian **colecciones** y **obras literarias**, derivándolos de los que referencian storylists e historias. **No toca los campos de origen.**

| Documento         | Campo de origen | Campo que puebla        |
| ----------------- | --------------- | ----------------------- |
| `landingPage`     | `cards`         | `collections`           |
| `landingPage`     | `latestReads`   | `latestLiteraryWorks`   |
| `rotatingContent` | `mostRead`      | `mostReadLiteraryWorks` |

## Prerequisito

**Los documentos destino tienen que existir ya en el dataset.** Las referencias nuevas se derivan del identificador del documento migrado; si ese documento no existe y la referencia es fuerte, el content lake rechaza la transacción entera al escribir. Las migraciones que los crearon se dieron de baja una vez aplicadas en los tres datasets, así que el prerequisito hoy se verifica mirando el dataset, no corriéndolas.

El dry-run **no** lo detecta: imprime mutaciones sin llegar al servidor. Por eso la verificación de referencias colgadas es un paso obligatorio del procedimiento, no una sugerencia.

## Por qué campos nuevos y no un renombre

El Studio y la aplicación no despliegan a la vez. Si se reusaran los nombres de campo no habría orden seguro: desplegar el código primero lo deja leyendo documentos que todavía referencian el tipo viejo, y migrar primero deja al código todavía desplegado leyendo lo que ya cambió de forma. Con campos nuevos las dos formas conviven y ningún lector se queda sin fuente.

Los campos viejos quedan intactos. Su baja va en un PR de limpieza posterior, cuando ningún lector los consulte.

## Por qué también recorre los borradores

Sólo se sirve el documento publicado, así que migrar un borrador no cambia nada de lo que se lee. Pero **omitirlo sí quita**: publicar reemplaza el documento publicado por el contenido del borrador, y un borrador creado antes de la corrida no trae los campos nuevos. Dejarlos afuera convierte cada publicación pendiente en una pérdida silenciosa de lo ya migrado.

Conviene igual saber cuántos hay en vuelo antes de aplicar (consulta en el censo previo).

## Cuándo corre

Después de desplegar el Studio con los campos nuevos y **antes** de que la aplicación los lea. Es segura en toda esa ventana porque no modifica nada que alguien esté leyendo: los campos nuevos nacen vacíos y nadie los consulta hasta el despliegue que cambia el contrato.

**Se re-corre una vez más después de ese despliegue.** El endpoint que genera las semanas futuras copia hacia adelante los campos del último documento existente, y hasta ese despliegue arrastra sólo los viejos: cualquier semana generada en el medio nace sin los campos nuevos. La re-corrida cierra ese hueco.

Es re-corrible porque escribe con `setIfMissing` y no con `set`: un campo ya poblado —por la corrida anterior o por una edición hecha a mano en el Studio— no se pisa.

## Comandos

Desde `cms/`. El destino va siempre explícito: `--project` y `--dataset` son **inseparables** y pasar uno solo aborta. El identificador de proyecto se resuelve del entorno, nunca se escribe literal.

```bash
# Dry-run (es el comportamiento por defecto)
pnpm exec sanity migration run relink-landing-to-collection-and-literary-work \
  --project "$(node --env-file=.env -p 'process.env.SANITY_STUDIO_PROJECT_ID')" \
  --dataset <destino>

# Aplicar. `--no-confirm` hace falta cuando no hay TTY.
pnpm exec sanity migration run relink-landing-to-collection-and-literary-work \
  --project "$(node --env-file=.env -p 'process.env.SANITY_STUDIO_PROJECT_ID')" \
  --dataset <destino> --no-dry-run --no-confirm
```

Orden de datasets: `development` → `staging` → `production`, con censo antes y verificación después de cada uno.

## Consultas del procedimiento

Las cuatro viven en [`verification-queries.ts`](./verification-queries.ts) como constantes, y su spec las ejecuta contra un dataset con una referencia colgada deliberada. **No están acá como texto a propósito:** las dos primeras versiones de estas consultas estaban inertes —una contaba los nulos en vez de descartarlos, y las dos contaban de más un campo ausente— y ninguna de las dos cosas se veía leyéndolas.

Para correrlas, importarlas o copiarlas del módulo.

| Constante                     | Qué responde                                                              | Resultado esperado |
| ----------------------------- | ------------------------------------------------------------------------- | ------------------ |
| `DRAFTS_IN_FLIGHT_QUERY`      | Qué borradores hay sin publicar (censo previo)                            | informativo        |
| `PARITY_QUERY`                | Cuántas referencias tiene cada campo nuevo frente a su origen             | pares iguales      |
| `PER_DOCUMENT_MISMATCH_QUERY` | Qué documentos tienen un campo nuevo desparejo con su origen              | `[]`               |
| `DANGLING_QUERY`              | Cuántas referencias nuevas apuntan a un documento inexistente             | `0` en los tres    |
| `UNREVERTIBLE_QUERY`          | Qué documentos ya no se pueden revertir (antes de revertir, no de migrar) | `[]`               |

`PARITY_QUERY` sola no alcanza: es agregada, y un documento con dos de más compensa a otro con dos de menos. Por eso va acompañada de la de discrepancia por documento.

**Ningún gate de CI detecta un dataset sin migrar:** el job de e2e corre contra `staging` y pasaría en verde igual. Es responsabilidad de quien despliega.

## Reversión

`revert-relink-landing-to-collection-and-literary-work` da de baja los tres campos nuevos, y sólo cuando su contenido es exactamente lo que esta migración habría escrito. Aborta —sin borrar nada— en dos casos: si el campo de origen ya no está poblado (el campo nuevo pasó a ser la única copia) y si el contenido fue editado después de migrar (borrarlo perdería esa edición).

Como el aborto corta la corrida, conviene listar antes los documentos no revertibles con `UNREVERTIBLE_QUERY`: descubrirlo a mitad de camino deja unos documentos revertidos y otros no.

```bash
# Dry-run
pnpm exec sanity migration run revert-relink-landing-to-collection-and-literary-work \
  --project "$(node --env-file=.env -p 'process.env.SANITY_STUDIO_PROJECT_ID')" \
  --dataset <destino>

# Aplicar
pnpm exec sanity migration run revert-relink-landing-to-collection-and-literary-work \
  --project "$(node --env-file=.env -p 'process.env.SANITY_STUDIO_PROJECT_ID')" \
  --dataset <destino> --no-dry-run --no-confirm
```
