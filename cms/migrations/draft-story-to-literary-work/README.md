# Crear una obra en borrador por cada cuento en borrador

Complemento de [`story-to-literary-work`](../story-to-literary-work/README.md), que solo alcanza a los cuentos publicados. El **mapeo campo por campo es el mismo** y vive allá: acá se documenta únicamente lo que cambia.

Nada se publica. El identificador derivado conserva el prefijo de path del origen, así que un cuento inédito produce una obra inédita.

## Qué migra

El filtro admite un cuento en borrador que tenga título, slug, autor y cuerpo con contenido:

```
_id in path('drafts.**') && defined(title) && defined(slug.current) && defined(author._ref) && count(body) > 0
```

La exclusión es **declarativa a propósito**: un borrador a medio escribir es un estado legítimo del dataset, no un error, así que no corresponde ni abortar la corrida entera ni saltearlo desde el mapeo. Así queda a la vista en el diff, y el censo dice exactamente qué quedó afuera. El armado del documento sigue lanzando ante un dato que no permite construir una obra válida, ahora como defensa en profundidad.

Corte de `production` al relevarlo:

|                                | Cuentos |
| ------------------------------ | ------: |
| Borradores                     |      95 |
| Admitidos por el filtro        |  **63** |
| — sin versión publicada        |      49 |
| — sobre un cuento ya publicado |      14 |
| Excluidos                      |      32 |

Los 32 excluidos son 9 ediciones abandonadas sobre cuentos vivos (sin autor), 21 fichas con título, slug y autor pero sin cuerpo, y 2 vacías. Ninguno tiene contenido que traducir: limpiarlos es trabajo editorial, no de esta migración.

## La forma del identificador

`drafts.lw-from-story-<uuid>`, con el prefijo de path **encabezando**.

No es un detalle de estilo: Sanity lee `drafts.` como borrador solo cuando abre el identificador. Concatenarlo detrás del origen —`lw-from-story-drafts.<uuid>`— produce un documento **publicado** con nombre de borrador, y publicaría contenido inédito sin que nada lo señale.

De ahí se sigue que **los 14 cuentos con versión publicada y borrador producen el borrador de su misma obra**, porque ambos identificadores derivan del mismo uuid. No nace una obra distinta ni se toca la publicada.

## Referencias a autores inéditos

Quince de los cuentos admitidos referencian autores que solo existen como borrador. Es válido: el content lake acepta una referencia fuerte a un documento inédito mientras el documento que la contiene sea un borrador. Lo que Sanity bloquea es **publicar** con referencias a inéditos.

Corolario: esta migración **no exige publicar nada** — ni cuentos ni fichas de autor.

## Tres consecuencias operativas

**Los 14 con contraparte publicada quedan con cambios pendientes que nadie hizo.** Al crear el borrador de una obra que ya estaba publicada, el Studio la muestra con modificaciones sin publicar. Publicarlas reemplaza el contenido de la versión publicada — incluida cualquier corrección editorial hecha después de la migración original, que es justamente lo que `createIfNotExists` protege al escribir. Antes de publicar una de esas 14, conviene comparar ambas versiones: si el borrador no aporta nada, corresponde descartarlo, no publicarlo.

**Publicar el cuento no publica su obra.** Son documentos distintos. Al publicar un cuento más adelante hay que publicar también su obra, o aceptar que queda rezagada respecto del cuento. Automatizarlo —por webhook o por una migración de sincronización— es un trabajo aparte.

**El backfill de tiempo de lectura no las alcanza.** `readingTimeBackfillCandidatesQuery` excluye borradores, así que `pnpm backfill:reading-time` no puebla estas obras. No rompe nada mientras estén en borrador: el repository deriva el tiempo cuando falta. Pero al publicar una conviene volver a correr el backfill para persistirlo.

## Advertencias

**`scripts/remove-all-unpublished-drafts.ts` borra todos los borradores del dataset.** Correrlo después de esta migración se lleva puestas las obras que creó, junto con los cuentos de origen.

**`development` se borra y reimporta** desde `production` por `sync-datasets.yml`: una corrida de prueba puede desaparecer en la sincronización siguiente. Conviene ejecutar la secuencia completa de una sentada.

Y como cada dataset es independiente, la migración corre **por dataset**: ningún gate de CI detecta uno sin migrar.

## Procedimiento

Los comandos se corren desde `cms/`. Sin `--project`/`--dataset` toman los de `sanity.cli.ts`; con ellos, hay que pasar los dos.

### 1. Censar el corpus

```bash
pnpm exec tsx --env-file=.env scripts/audit/audit-story-portable-text.ts   # desde la raíz
```

Read-only. Reporta, para publicados y borradores, las construcciones de Portable Text fuera de lo que el conversor traduce, los conteos por causa de exclusión y cuántos borradores admite el filtro.

### 2. Dry-run

```bash
pnpm exec sanity migration run draft-story-to-literary-work --project <id> --dataset <ds> > dry-run.log
```

Redirigir a archivo: son decenas de documentos con el cuerpo completo.

### 3. Contrastar

Verificar en el log que cada identificador de destino **arranca con `drafts.`**, y que el conteo de mutaciones coincide con los admitidos que reportó el censo.

### 4. Aplicar

```bash
pnpm exec sanity migration run draft-story-to-literary-work --project <id> --dataset <ds> --no-dry-run
```

### 5. Verificar

En el Studio, que las obras nuevas figuren como borrador, y que las 14 que tienen contraparte publicada aparezcan con cambios pendientes —eso es esperado, no un error—. Repetir la corrida para probar la idempotencia: el contador de la CLI **no** sirve como criterio —cuenta mutaciones emitidas, no aplicadas— así que se comprueba en el contenido, que no se reescribe.

## Revertir

Para deshacer **solo este lote**, sin tocar el corpus publicado:

```bash
pnpm exec sanity migration run revert-draft-story-to-literary-work --project <id> --dataset <ds>
pnpm exec sanity migration run revert-draft-story-to-literary-work --project <id> --dataset <ds> --no-dry-run
```

Es la que corresponde al reintentar esta corrida. [`revert-story-to-literary-work`](../revert-story-to-literary-work/index.ts) también alcanza estas obras, pero **junto con las publicadas**: sirve para descartar el corpus migrado entero, no para volver atrás una sola tanda.
