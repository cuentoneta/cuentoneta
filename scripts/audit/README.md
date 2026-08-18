# Scripts de auditoría y diagnóstico (datos de Sanity)

Esta carpeta agrupa scripts **one-off de diagnóstico, auditoría y migración** que operan sobre el contenido de Sanity. No se exponen como comandos de `package.json` (son herramientas puntuales, no parte del flujo de build): se ejecutan explícitamente.

## Requisitos y forma de ejecución

- Un archivo `.env` en la raíz con las credenciales de Sanity (`SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`, token).
- Conexión vía `src/api/_helpers/sanity-connector.ts`.

```bash
pnpm exec tsx --env-file=.env scripts/audit/<script>.ts
```

> ⚠️ **Dataset objetivo:** el dataset lo define `SANITY_STUDIO_DATASET` en `.env` (hoy, `production`). Los scripts marcados como _escribe_ aplican cambios sobre ese dataset. Revisá a qué dataset apuntás antes de correr un script de escritura.

## Scripts disponibles

| Script                            | Tipo             | Qué hace                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `audit-story-portable-text.ts`    | **Read-only** ✅ | Censa el Portable Text de los cuentos antes de migrarlo a Markdown, **publicados y borradores por separado**: construcciones que el conversor no traduce (agrupadas por campo, con el slug y el `_key` del bloque), **construcciones de riesgo escritas en el texto** (numeral que abre línea, sangría de bloque de código, cercas, backticks, entidades, tiradas que quedarían como subrayado de encabezado) y esquemas de enlace fuera de la allowlist, más conteos —incluidos los campos cuya ausencia aborta el mapeo, y cuántos cuentos admite o excluye el filtro de la migración de borradores—, colisiones de slug, miembros de array sin `_key` y el baseline de fidelidad en caracteres. |
| `extract-original-publication.ts` | **Read-only** ✅ | Deriva una **propuesta** del `originalPublication` de cada obra literaria que no lo declara, con la oración que la respalda al lado y un reparo cuando la publicación nombrada es una recopilación o la oración habla de una edición posterior. Escribe el informe en `workspace/`.                                                                                                                                                                                                                                                                                                                                                                                                                |

> **Sobre `extract-original-publication.ts`:** la redacción ya escribió en prosa dónde y cuándo se publicó cada obra, en su **nota editorial**, así que extraerlo del CMS cuesta y arriesga menos que investigarlo afuera — el dato bibliográfico es de los que un modelo produce plausible y equivocado con la misma soltura. Lo que sale es **propuesta, no dato**: se revisa con su evidencia antes de persistir. El reparo de "edición posterior" existe porque tomar una reedición por la publicación original es el error más caro acá, y el resultado se ve idéntico a uno correcto. De paso releva qué notas mencionan la circulación de la obra en material educativo o cultural, que es un dato **distinto** y no va en este campo.
>
> Opera **solo sobre `literaryWork`**: es el agregado cuyo campo se renderiza —en el hero de la página de lectura— y su nota editorial es fuente propia. El cuento del que cada obra se derivó no interviene.
>
> Acepta `AUDIT_DATASET` para apuntar a otro dataset que el configurado. Ojo con `production`: es privado, y si la credencial no lo alcanza las consultas devuelven cero **sin error** — el informe saldría vacío como si no quedara nada por completar. El script aborta ante un resultado vacío por esa razón, y `AUDIT_INPUT` permite pasarle el resultado de la consulta obtenido por otra vía. Tampoco sirve caer a `development`: es un espejo **nocturno**, así que no refleja lo que se cargó hoy.

> **Sobre `audit-story-portable-text.ts`:** correrlo **antes** de una migración de conversión, no durante. El conversor de `resources/portable-text-to-markdown/` falla ante lo que no sabe traducir —a propósito, para no perder contenido en silencio—, así que descubrir una construcción no cubierta con la migración ya en curso la detendría con documentos ya escritos. Si el censo encuentra algo nuevo, se agrega **en el conversor** con su caso de prueba.

### Comandos

```bash
# Censo del Portable Text de los cuentos, previo a convertirlo (solo lectura)
pnpm exec tsx --env-file=.env scripts/audit/audit-story-portable-text.ts

# Propuesta del valor del campo, derivada de la nota editorial de cada obra
pnpm exec tsx --env-file=.env scripts/audit/extract-original-publication.ts
```

## Scripts dados de baja

Tres exportadores y auditores de biografías de autor vivieron acá y ya no: operaban sobre `author.biography` **como Portable Text**, que es la forma que el campo tenía cuando se corrieron. Hoy se declara `markdown` y se persiste como string, así que ninguno era ejecutable — describían auditorías ya hechas, no herramientas vigentes. Uno de ellos, además, escribía en Sanity: correrlo dejaría un array donde va texto y rompería toda lectura de ese autor.

Su salida en `tools/author-bios/` sigue en disco y **ya no es reproducible**. La política de [`coding-agent-policies.md`](../../.claude/references/coding-agent-policies.md) cubre ese caso: sin un comando que lo regenere, el artefacto se trata como no re-generable y no se toca.

## Convención

Cualquier script futuro de diagnóstico/auditoría/migración sobre datos de Sanity vive en `scripts/audit/`, se documenta en esta tabla con su comando y su etiqueta **read-only / escribe-en-prod**, y **no** se agrega a `package.json`.

**La carpeta se lintea como el resto de `scripts/`, sin exención.** Que un script sea one-off describe una intención sobre su uso, no una propiedad de su código: se lee igual, se copia igual y sirve igual de plantilla para el próximo. Exceptuarla sería exceptuar todo lo que venga.
