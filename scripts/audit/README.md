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

| Script                         | Tipo             | Qué hace                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `audit-story-portable-text.ts` | **Read-only** ✅ | Censa el Portable Text de los cuentos antes de migrarlo a Markdown, **publicados y borradores por separado**: construcciones que el conversor no traduce (agrupadas por campo, con el slug y el `_key` del bloque), **construcciones de riesgo escritas en el texto** (numeral que abre línea, sangría de bloque de código, cercas, backticks, entidades, tiradas que quedarían como subrayado de encabezado) y esquemas de enlace fuera de la allowlist, más conteos —incluidos los campos cuya ausencia aborta el mapeo, y cuántos cuentos admite o excluye el filtro de la migración de borradores—, colisiones de slug, miembros de array sin `_key` y el baseline de fidelidad en caracteres. |

| `audit-original-publication.ts` | **Read-only** ✅ | Agrupa las obras publicadas sin `originalPublication` según lo que su propia reseña ya aporta: si nombra publicación y año, si trae solo el año, si no dice nada, o si no hay reseña. Escribe el informe en `workspace/`. |
| `extract-original-publication.ts` | **Read-only** ✅ | Deriva de cada reseña una **propuesta** del valor del campo, con la oración que la respalda al lado y un reparo cuando la publicación nombrada es una recopilación o la oración habla de una edición posterior. Escribe el informe en `workspace/`. |

> **Sobre los dos de `originalPublication`:** la redacción ya escribió en prosa dónde y cuándo se publicó cada obra, así que extraerlo del CMS cuesta y arriesga menos que investigarlo afuera — el dato bibliográfico es de los que un modelo produce plausible y equivocado con la misma soltura. Lo que sale del segundo es **propuesta, no dato**: se revisa con su evidencia antes de persistir. El reparo de "edición posterior" existe porque tomar una reedición por la publicación original es el error más caro acá, y el resultado se ve idéntico a uno correcto.
>
> Ambos aceptan `AUDIT_DATASET` para apuntar a otro dataset que el configurado. Ojo con `production`: si la credencial no alcanza para leerlo, las consultas devuelven cero **sin error**, y el informe sale vacío como si no hubiera nada que hacer.

> **Sobre `audit-story-portable-text.ts`:** correrlo **antes** de una migración de conversión, no durante. El conversor de `resources/portable-text-to-markdown/` falla ante lo que no sabe traducir —a propósito, para no perder contenido en silencio—, así que descubrir una construcción no cubierta con la migración ya en curso la detendría con documentos ya escritos. Si el censo encuentra algo nuevo, se agrega **en el conversor** con su caso de prueba.

### Comandos

```bash
# Censo del Portable Text de los cuentos, previo a convertirlo (solo lectura)
pnpm exec tsx --env-file=.env scripts/audit/audit-story-portable-text.ts

# Qué obras no declaran su publicación original, agrupadas por lo que su reseña aporta
pnpm exec tsx --env-file=.env scripts/audit/audit-original-publication.ts

# Propuesta del valor del campo, derivada de cada reseña, con su evidencia
pnpm exec tsx --env-file=.env scripts/audit/extract-original-publication.ts
```

## Scripts dados de baja

Tres exportadores y auditores de biografías de autor vivieron acá y ya no: operaban sobre `author.biography` **como Portable Text**, que es la forma que el campo tenía cuando se corrieron. Hoy se declara `markdown` y se persiste como string, así que ninguno era ejecutable — describían auditorías ya hechas, no herramientas vigentes. Uno de ellos, además, escribía en Sanity: correrlo dejaría un array donde va texto y rompería toda lectura de ese autor.

Su salida en `tools/author-bios/` sigue en disco y **ya no es reproducible**. La política de [`coding-agent-policies.md`](../../.claude/references/coding-agent-policies.md) cubre ese caso: sin un comando que lo regenere, el artefacto se trata como no re-generable y no se toca.

## Convención

Cualquier script futuro de diagnóstico/auditoría/migración sobre datos de Sanity vive en `scripts/audit/`, se documenta en esta tabla con su comando y su etiqueta **read-only / escribe-en-prod**, y **no** se agrega a `package.json`.

**La carpeta se lintea como el resto de `scripts/`, sin exención.** Que un script sea one-off describe una intención sobre su uso, no una propiedad de su código: se lee igual, se copia igual y sirve igual de plantilla para el próximo. Exceptuarla sería exceptuar todo lo que venga.
