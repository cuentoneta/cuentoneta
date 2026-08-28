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
- La migración lleva su **spec co-locado**: `index.spec.ts` al lado del `index.ts`, con un `describe` nombrado por el slug de la migración. Como `defineMigration` conserva el objeto tal cual, el spec ejercita `migrate.document` directamente —es la función pura que decide el patch de cada documento— con el mismo helper que usan los specs existentes (`migration.migrate?.document`, casteado al tipo de parámetro inferido). Corre como Vitest standalone de `cms/` dentro del gate `studio-build` (`pnpm sanity:test`) — ver [Segunda config de Vitest: el Studio](testing.md#segunda-config-de-vitest-el-studio-cms). Como mínimo cubre el camino feliz, la idempotencia (una segunda corrida no produce mutación) y el aborto de cada guard.

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

**Si el origen puede ser un borrador, el prefijo de path se reaplica, no se concatena.** Sanity marca un borrador con `drafts.` **encabezando** el `_id`, así que derivar `drafts.<origen>` como `<prefijo>drafts.<origen>` produce un documento publicado con nombre de borrador — y publica contenido inédito sin que nada lo señale. Lo correcto es separar el path del identificador, derivar sobre lo que queda y volver a anteponerlo: `drafts.<prefijo><origen>`. El predicado de reconocimiento y el `filter` de la reversión tienen que contemplar ambas formas.

Ejemplo vivo: [`cms/migrations/draft-story-to-literary-work/`](../../cms/migrations/draft-story-to-literary-work/README.md) — crea una obra en borrador por cada cuento en borrador, con su reversión acotada a ese lote.

El predicado que reconoce un documento migrado se declara **una sola vez** y lo importan ambas migraciones. Si cada una tuviera el suyo, una divergencia entre las dos definiciones podría dejar documentos sin borrar —o borrar de más—. Y el guard va **dentro** de `migrate.document`, no solo en el `filter`: el filtro es una optimización del recorrido, no la garantía.

### Migraciones que borran documentos

Borrar un documento no es un `unset` más grande: la infraestructura expone `del(id)`, pero el content lake impone tres cosas que ninguna migración de escritura enfrenta.

**El content lake rechaza borrar un documento con una referencia fuerte entrante.** Dar de baja el campo que lo referencia es entonces un **paso previo**, no una limpieza posterior — y hay que buscar esos referentes en el dataset, no en los schemas: quitar un campo del schema no borra el dato, así que un documento puede conservar referencias por un campo que el Studio ya no declara. La consulta que los descubre usa `references(^._id)` en vez de enumerar los campos conocidos, justamente porque la lista escrita a mano no ve los que ya nadie declara.

**Cuando el grafo tiene profundidad, cada nivel va en su propia migración.** El runner batchea mutaciones y no garantiza el orden dentro de una corrida, así que un `documentTypes` con el referente y el referido juntos puede intentar borrar el segundo mientras el primero todavía lo apunta, y detenerse a mitad de camino con documentos ya borrados. Una migración por nivel, corridas en orden, es lo que vuelve cada corrida atómica y verificable por separado.

**No hay migración hermana de reversión, y no puede haberla:** una migración destructiva no crea nada que una de vuelta pueda reconocer por su `_id`, y lo que borra no se reconstruye. Su lugar lo ocupa el **export previo del dataset**, guardado fuera del árbol de trabajo. Los borradores entran por defecto y no deben excluirse: son lo que la purga se lleva sin dejar rastro visible en el Studio.

```bash
# Desde cms/. El dataset va posicional y el flag de proyecto es `--project-id` — distinto del
# `--project`/`--dataset` inseparables de `migration run`.
pnpm exec sanity dataset export <destino> "<ruta fuera del repo>/<destino>-<fecha>.tar.gz" \
  --project-id "$(node --env-file=.env -p 'process.env.SANITY_STUDIO_PROJECT_ID')"
```

Conviene además enunciar qué **otras** migraciones invalida la corrida: una reversión que aborta cuando su campo de origen ya no está poblado queda inservible desde el momento en que se da de baja ese campo, y descubrirlo al querer usarla es tarde.

### Migraciones que convierten contenido

Las que llevan rich text a Markdown consumen [`resources/portable-text-to-markdown/`](../../resources/portable-text-to-markdown/README.md), que **falla ante lo que no sabe traducir** en vez de descartarlo en silencio. Antes de correr una conversión sobre el corpus, censar qué construcciones usa realmente el dataset (ver `scripts/audit/`): descubrirlo con la migración la detendría en el primer documento raro, con los anteriores ya escritos.

Que una corrida reporte N mutaciones dice que **alcanzó** N documentos, no que no perdió contenido —ni, al aplicar, que haya escrito algo: el contador cuenta lo que la migración emite, no lo que el servidor termina aplicando—. La verificación de fidelidad se hace comparando el texto de origen contra el que produce el pipeline real, y la de idempotencia mirando si el contenido cambió, no contando mutaciones.

## Orden de despliegue: clasificar antes de correr

Antes de correr una migración contra un dataset hay que saber a qué clase pertenece, porque de eso depende cuándo puede correr:

- **Independiente del código.** Puebla un campo que todavía nadie lee, purga propiedades huérfanas, corrige valores sin cambiar su forma. El orden respecto del despliegue es indiferente.
- **Acoplada al código.** Cambia **lo que el código lee**: el nombre de un campo o la **forma de su valor**. Ningún orden simple es seguro, y el patrón para las dos es el mismo — **ampliar** lo que el lector acepta, migrar, y recién entonces **contraer**.

El error a evitar es tratar una acoplada como si fuera independiente y elegir el orden por conveniencia: las dos secuencias simples rompen, solo que en momentos distintos.

### Cambio de forma del valor

Cuando la migración cambia la **forma** de un valor que el código ya lee —de un array de bloques a un string, por ejemplo— y el mapper no tolera más que una, los dos órdenes dejan un intervalo roto:

| Orden                      | Estado intermedio         | Qué falla                                                                        |
| -------------------------- | ------------------------- | -------------------------------------------------------------------------------- |
| Migrar y después desplegar | código viejo + dato nuevo | El mapper viejo aplica sobre el valor una operación que su forma nueva no admite |
| Desplegar y después migrar | código nuevo + dato viejo | El mapper nuevo aplica sobre el valor una operación que su forma vieja no admite |

A diferencia del rename, acá la falla es **ruidosa**: el mapper lanza y el endpoint responde 500, así que el síntoma aparece de inmediato en toda superficie que lea ese campo — no solo en la que lo renderiza.

El patrón que sí deja una ventana segura:

1. **Ampliar:** desplegar un lector que acepte **ambas** formas (`Array.isArray(valor) ? convertir(valor) : valor`). Es el único estado en el que las dos versiones del dato se sirven por igual.
2. **Migrar** el dataset.
3. **Contraer:** quitar la tolerancia una vez verificado que no queda ningún documento con la forma vieja.

**Saltearse el paso 1 no elimina la ventana: elige cuál de las dos caídas tener.** Si se decide asumirla —porque el campo es de baja exposición o la ventana es corta—, la decisión se toma explícitamente y se verifica el resultado apenas termina, en vez de descubrirla por un reporte.

Un agravante propio de este repo: mientras `production` conserve la forma vieja, el sync nocturno de datasets la reintroduce en `staging` y `development`, así que el intervalo roto **se reabre cada noche** en los datasets de trabajo aunque el código nuevo ya esté desplegado ahí.

### Rename de un campo requerido

Cuando la migración renombra un campo **requerido** y el código lo lee sin fallback, una migración única de `set` + `unset` no tiene ningún orden de despliegue seguro: migrar antes de desplegar deja el código ya corriendo leyendo un campo que todavía no existe; desplegar antes de migrar deja la proyección nueva devolviendo `null` para los documentos no migrados. No hay ventana en la que ambas versiones —código y dato— coincidan.

La falla, además, es **silenciosa**: GROQ devuelve `null` para un campo ausente, y el mapper lo propaga tal cual a un contrato declarado `string`. Nada lanza ni loguea; el síntoma aparece recién en la superficie que renderiza ese campo (o ni ahí, si nada lo renderiza todavía).

La solución es partir el rename en dos migraciones —**expand** y **contract**— separadas por el despliegue del código:

1. **Expand** (`set`, sin `unset`): copia el valor del campo viejo al nuevo, sin dar de baja el viejo. Corre **antes** de desplegar el código que proyecta el nombre nuevo. Deja un estado intermedio con **ambos** nombres poblados — el único que las dos versiones del código (la que todavía lee el nombre viejo y la que ya lee el nuevo) pueden servir por igual.
   - **Semántica de backfill, no de sincronización:** puebla el campo nuevo solo si está vacío, nunca lo sobrescribe. Comparar por igualdad alcanzaría para reintentar una corrida que se cortó a mitad de camino, pero una corrida tardía —con el schema nuevo ya desplegado— leería una edición legítima como "todavía sin copiar" y la pisaría con el valor viejo.
2. **Contract** (`unset`): da de baja el campo viejo. Corre **después** de verificar el código nuevo en producción, y después de que la fase expand ya corrió sobre ese dataset.
   - **Interlock:** al ser destructiva y sin más recuperación que el historial de Sanity, no confía en el orden de las corridas — verifica **documento a documento** que el campo nuevo ya esté poblado, y **lanza** en lugar de borrar la única copia si no lo está.

Ejemplo vivo: [`cms/migrations/copy-short-description-to-description/index.ts`](../../cms/migrations/copy-short-description-to-description/index.ts) (expand) y [`cms/migrations/unset-legacy-short-description/index.ts`](../../cms/migrations/unset-legacy-short-description/index.ts) (contract) — rename de `shortDescription` a `description` en `resourceType` y `tag`.

### Cada fase corre por dataset

Los datasets son `development`, `staging` y `production`, y son independientes entre sí: correr una fase en uno no la aplica a los otros. Correr expand y contract **en cada dataset**, en su propio momento respecto del despliegue de ese dataset — no alcanza con correrlas una sola vez contra `production` y asumir que los demás quedaron al día.

Ningún gate de CI detecta un dataset que quedó sin migrar: el job `e2e` corre contra `staging` (`SANITY_STUDIO_DATASET` en `.github/workflows/ci.yml`), y pasaría en verde aunque `staging` no tuviera corrida la migración, porque el campo no se renderiza en ninguna superficie que el e2e recorra. Es responsabilidad de quien despliega, no de un chequeo automático.

## Cómo correrlas

Desde `cms/`. Todo comando que **corra** una migración lleva su destino escrito:

```bash
# Listar migraciones disponibles (no toma destino)
pnpm exec sanity migration list

# Dry-run (por defecto): muestra las mutaciones sin aplicarlas
pnpm exec sanity migration run <slug> --project "$(node --env-file=.env -p 'process.env.SANITY_STUDIO_PROJECT_ID')" --dataset <destino>

# Aplicar de verdad
pnpm exec sanity migration run <slug> --project "$(node --env-file=.env -p 'process.env.SANITY_STUDIO_PROJECT_ID')" --dataset <destino> --no-dry-run
```

> `cms/package.json` no define un script `sanity`: la forma **`pnpm exec`** invoca el binario de `node_modules/.bin` de manera explícita. (`pnpm sanity …` también funciona hoy, porque pnpm cae al binario cuando no encuentra un script homónimo, pero esa resolución dejaría de aplicar si algún día se agregara un script con ese nombre.)

Correr siempre el dry-run antes de aplicar.

### El destino va explícito, y sus dos flags van juntos

**`--project` y `--dataset` son inseparables en `sanity migration run`.** Pasar uno solo aborta antes de hacer nada:

```
Error: If either --dataset or --project is provided, both must be provided
```

**Omitir los dos tampoco es una alternativa aceptable**, aunque corra: la CLI cae a `projectId`/`dataset` de `sanity.cli.ts`, que los lee de las env `SANITY_STUDIO_*` del `.env` de `cms/`. El que importa ahí es el **dataset**: decide sobre qué contenido muta la corrida y cambia con el ambiente de cada máquina. Un README de migración publica comandos para copiar y ejecutar: si el dataset no está en el comando, quien lo copia no sabe adónde va.

**Ojo con el comando de censo:** `sanity documents query` —el que suele acompañar a una migración para contar antes y verificar después— **no** acopla los dos flags, y ahí el flag de proyecto se llama **`--project-id`**. Copiar `--project` de un comando al otro no falla: lo acepta como alias deprecado y sigue, avisando por la salida en vez de abortar. Es una advertencia fácil de pasar por alto entre el resto del output.

Es la forma que usa el skill [`release-workflow`](../skills/release-workflow/SKILL.md) al migrar contra producción, y la que debe heredar todo README de migración nuevo.

### El id de proyecto no se escribe: se resuelve del entorno

El valor de `--project` **no se copia a ningún archivo versionado** —ni a esta referencia, ni a un README de migración, ni a un skill—: se resuelve en el momento desde el archivo de entorno que genera `pnpm run config` (un `.env` en la raíz y otro en `cms/`, los dos con `SANITY_STUDIO_PROJECT_ID`).

```bash
--project "$(node --env-file=.env -p 'process.env.SANITY_STUDIO_PROJECT_ID')"
```

La sustitución lleva el valor del archivo al flag sin que nadie abra el `.env` ni lo imprima por pantalla, y sin que la documentación quede sosteniendo una copia que envejece por su cuenta. Si el archivo todavía no existe, `node` aborta y el comando no llega a correr: la respuesta es `pnpm run config`, nunca escribir el id a mano.

La ruta del `--env-file` es relativa al directorio desde donde se corre — `.env` desde `cms/`, `cms/.env` desde la raíz (la forma con `pnpm -C cms exec`). Vale igual para el `--project-id` del comando de censo.
