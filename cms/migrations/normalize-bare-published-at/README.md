# `normalize-bare-published-at`

Completa con hora las fechas de publicación que quedaron cargadas sin ella.

## Por qué

El schema declara `publishedAt` como `datetime`, pero lo almacenado no siempre lo cumple: hay documentos con la fecha sin componente horario (`"2022-01-23"`). El value object del dominio exige el instante completo y rechaza esa forma, así que el borde de lectura no puede traducir el documento y la página de la obra responde con un error de servidor en vez de su contenido.

Es el caso que `sanity-acl.md` describe como el punto ciego del schema: `Rule.required()` y el tipo declarado validan la **edición** en el Studio, no lo que ya está guardado.

La forma desnuda llegó a las obras copiada de su cuento de origen, que la traía igual. Por eso la migración alcanza a los dos tipos: dejar los cuentos sucios deja abierta la vía por la que el dato volvería a entrar.

## Con qué hora se completa

**Medianoche de Argentina** (`T03:00:00.000Z`), que es la hora que ya tienen las correcciones hechas a mano sobre este mismo campo. Completar al inicio del día en UTC movería la fecha visible de algunas publicaciones al día anterior para un lector local.

## Censo

Medido contra `production` el **2026-08-28**:

| Tipo           | Publicados con la fecha sin hora |
| -------------- | -------------------------------: |
| `literaryWork` |                               26 |
| `story`        |                               29 |

Sin borradores afectados. El widget `datetime` del Studio no puede producir la forma desnuda, así que no es un estado de edición legítimo: los borradores entran a la migración igual que los publicados.

## Orden respecto del despliegue

**Independiente.** No renombra un campo ni cambia la forma que el lector espera: la lleva a la que el código ya esperaba. Correrla antes o después de desplegar es igual de seguro.

## Cómo se corre

El projectId se resuelve del entorno, nunca literal. Sin TTY hace falta `--no-confirm`.

```bash
# Dry-run (por defecto)
pnpm -C cms exec sanity migration run normalize-bare-published-at \
  --project "$(node --env-file=cms/.env -p 'process.env.SANITY_STUDIO_PROJECT_ID')" --dataset production

# Aplicar
pnpm -C cms exec sanity migration run normalize-bare-published-at \
  --project "$(node --env-file=cms/.env -p 'process.env.SANITY_STUDIO_PROJECT_ID')" --dataset production --no-dry-run --no-confirm
```

**Solo `production` necesita correrse.** `sync-datasets.yml` reconstruye `staging` y `development` cada noche como espejo de `production`, así que aplicarla en ellos se revierte con el próximo sync.

## Verificación

Después de aplicar, la consulta tiene que devolver cero en los dos tipos:

```bash
pnpm -C cms exec sanity documents query \
  '{"obras": count(*[_type == "literaryWork" && defined(publishedAt) && !(publishedAt match "*T*")]), "cuentos": count(*[_type == "story" && defined(publishedAt) && !(publishedAt match "*T*")])}' \
  --project-id "$(node --env-file=cms/.env -p 'process.env.SANITY_STUDIO_PROJECT_ID')" --dataset production --api-version v2021-06-07
```

Un dataset sin permiso de lectura devuelve `0` **sin error**, así que un cero solo vale si la misma consulta devolvió un número distinto antes de aplicar.
