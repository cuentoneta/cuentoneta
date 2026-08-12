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

> **Sobre `audit-story-portable-text.ts`:** correrlo **antes** de una migración de conversión, no durante. El conversor de `resources/portable-text-to-markdown/` falla ante lo que no sabe traducir —a propósito, para no perder contenido en silencio—, así que descubrir una construcción no cubierta con la migración ya en curso la detendría con documentos ya escritos. Si el censo encuentra algo nuevo, se agrega **en el conversor** con su caso de prueba.

### Comandos

```bash
# Censo del Portable Text de los cuentos, previo a convertirlo (solo lectura)
pnpm exec tsx --env-file=.env scripts/audit/audit-story-portable-text.ts
```

## Scripts dados de baja

Tres exportadores y auditores de biografías de autor vivieron acá y ya no: operaban sobre `author.biography` **como Portable Text**, que es la forma que el campo tenía cuando se corrieron. Hoy se declara `markdown` y se persiste como string, así que ninguno era ejecutable — describían auditorías ya hechas, no herramientas vigentes. Uno de ellos, además, escribía en Sanity: correrlo dejaría un array donde va texto y rompería toda lectura de ese autor.

Su salida en `tools/author-bios/` sigue en disco y **ya no es reproducible**. La política de [`coding-agent-policies.md`](../../.claude/references/coding-agent-policies.md) cubre ese caso: sin un comando que lo regenere, el artefacto se trata como no re-generable y no se toca.

## Convención

Cualquier script futuro de diagnóstico/auditoría/migración sobre datos de Sanity vive en `scripts/audit/`, se documenta en esta tabla con su comando y su etiqueta **read-only / escribe-en-prod**, y **no** se agrega a `package.json`.

**La carpeta se lintea como el resto de `scripts/`, sin exención.** Que un script sea one-off describe una intención sobre su uso, no una propiedad de su código: se lee igual, se copia igual y sirve igual de plantilla para el próximo. Exceptuarla sería exceptuar todo lo que venga.
