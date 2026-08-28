# Purga del contenido retirado — procedimiento

Runbook de las **tres** migraciones que dan de baja del dataset los cuentos y las listas de contenido. Los otros dos directorios apuntan acá: el orden entre ellas vive en un solo documento para que no pueda desincronizarse.

| Orden | Migración                       | Qué hace                                                        |
| ----- | ------------------------------- | --------------------------------------------------------------- |
| 1     | `unset-legacy-story-references` | Da de baja los campos que todavía referencian cuentos y listas  |
| 2     | `purge-storylist-documents`     | Borra las listas de contenido (cada una referencia sus cuentos) |
| 3     | `purge-story-documents`         | Borra los cuentos                                               |

El orden no es una preferencia. El content lake **rechaza borrar un documento con una referencia fuerte entrante**, así que cada paso existe para dejar sin referentes al siguiente.

---

## 1. Prerequisitos

Dos condiciones, y **la segunda es la que todavía falta**:

- **La baja de los schemas, aplicada.** Cumplida: los tipos ya no están registrados en el Studio ni proyectados por el backend.
- **El release que retira las páginas, desplegado y verificado en producción.** Sin esto, no correr nada.

Por qué la segunda es bloqueante, con evidencia y no como advertencia genérica: la versión que hoy corre en producción **lee** `cards`, `latestReads` y `mostRead`, y su generador semanal de la página de inicio **los copia hacia adelante** al crear la semana siguiente. Correr antes del despliegue vacía la página en vivo y, además, el cron reintroduce lo purgado en la semana nueva. Recién con el release desplegado la copia arrastra sólo los campos vigentes.

## 2. Export previo — es el plan de recuperación

**No es una formalidad.** Ninguna de las tres migraciones tiene hermana de reversión, y ninguna puede tenerla: no crean nada que una de vuelta pueda reconocer, y lo que borran no se reconstruye. El export es la única forma de volver atrás.

Se guarda **fuera del árbol de trabajo** — ni bajo `workspace/`, ni dentro del worktree.

```bash
# Desde cms/. Acá el dataset es un argumento posicional y el flag de proyecto es `--project-id`.
pnpm exec sanity dataset export <destino> "$HOME/cuentoneta-backups/<destino>-$(date +%F).tar.gz" \
  --project-id "$(node --env-file=.env -p 'process.env.SANITY_STUDIO_PROJECT_ID')"
```

Los borradores entran por defecto: **no** pasar `--no-drafts`. Son justamente lo que la purga se lleva sin dejar rastro visible en el Studio.

Esta corrida invalida además, y de forma permanente, las dos reversiones que dependían de estos documentos: la del relinkeo de la página de inicio aborta cuando el campo de origen ya no está poblado, y la de la creación de obras borraría obras que ya no se pueden regenerar.

## 3. Censo previo

Las consultas viven en [`verification-queries.ts`](./verification-queries.ts), no duplicadas acá como texto: son constantes ejecutables y su spec las corre contra el motor de GROQ, para que no queden inertes aparentando verificar.

```bash
# Desde cms/. `documents query` usa `--project-id`, y **no** acopla sus dos flags.
# Copiar `--project` del comando de migración no falla: lo acepta como alias deprecado y sigue con
# una advertencia fácil de perder entre el resto de la salida.
pnpm exec sanity documents query "<consulta>" \
  --project-id "$(node --env-file=.env -p 'process.env.SANITY_STUDIO_PROJECT_ID')" --dataset <destino>
```

| Consulta                          | Qué responde                                        | Antes de purgar                    |
| --------------------------------- | --------------------------------------------------- | ---------------------------------- |
| `CENSUS_QUERY`                    | Cuántos documentos se van, publicados y en borrador | El censo que va al PR              |
| `LEGACY_FIELDS_CENSUS_QUERY`      | Cuántas referencias tienen los tres campos legacy   | El censo que va al PR              |
| `INCOMING_REFERENCES_QUERY`       | Qué documentos referencian un cuento o una lista    | Debe quedar en `[]` tras el paso 1 |
| `WORKS_WITHOUT_COUNTERPART_QUERY` | Qué cuentos publicados no tienen obra derivada      | Se registra (ver §6)               |

## 4. Las tres corridas, por dataset

Para cada slug, en el orden de la tabla del encabezado: primero el dry-run, se lee lo que va a mutar, y recién después la aplicación.

```bash
# Dry-run (es el modo por defecto). `--project` y `--dataset` son inseparables acá.
pnpm exec sanity migration run <slug> \
  --project "$(node --env-file=.env -p 'process.env.SANITY_STUDIO_PROJECT_ID')" --dataset <destino>

# Aplicar. `--no-confirm` es necesario sin TTY.
pnpm exec sanity migration run <slug> \
  --project "$(node --env-file=.env -p 'process.env.SANITY_STUDIO_PROJECT_ID')" --dataset <destino> \
  --no-dry-run --no-confirm
```

**Orden de datasets: `development` → `staging` → `production`**, verificando cada uno antes de pasar al siguiente. Ningún gate de CI detecta un dataset que quedó sin migrar.

## 5. Verificación posterior

Contra el **dataset**, no contra el sitio: la aplicación produce con la caché del CDN encendida, así que la primera lectura del sitio devuelve la versión vieja y parece un fallo de la migración.

| Consulta                     | Esperado                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| `CENSUS_QUERY`               | Los cuatro conteos en `0`                                                             |
| `LEGACY_FIELDS_CENSUS_QUERY` | Los tres conteos en `0`                                                               |
| `DANGLING_AFTER_PURGE_QUERY` | Los cuatro conteos en `0` — ninguna referencia quedó apuntando a un documento borrado |

## 6. El cuento sin contraparte

Un cuento publicado no tiene obra derivada. **Desaparece con la purga, y es una decisión tomada, no un descuido.** `WORKS_WITHOUT_COUNTERPART_QUERY` lo lista antes de aplicar para que el censo del PR lo nombre; su única copia queda en el export del paso 2.
