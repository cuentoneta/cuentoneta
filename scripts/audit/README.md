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

Hoy no hay ninguno: los que vivieron acá cumplieron su propósito y se dieron de baja (ver abajo). La
carpeta se conserva porque la convención de más abajo rige para el próximo.

## Scripts dados de baja

Tres exportadores y auditores de biografías de autor vivieron acá y ya no: operaban sobre `author.biography` **como Portable Text**, que es la forma que el campo tenía cuando se corrieron. Hoy se declara `markdown` y se persiste como string, así que ninguno era ejecutable — describían auditorías ya hechas, no herramientas vigentes. Uno de ellos, además, escribía en Sanity: correrlo dejaría un array donde va texto y rompería toda lectura de ese autor.

Su salida en `tools/author-bios/` sigue en disco y **ya no es reproducible**. La política de [`coding-agent-policies.md`](../../.claude/references/coding-agent-policies.md) cubre ese caso: sin un comando que lo regenere, el artefacto se trata como no re-generable y no se toca.

El censo del Portable Text de los cuentos siguió el mismo camino. Existía para responder, **antes** de convertir el contenido a Markdown, si entraba en el subconjunto que el conversor traduce; esa conversión ya se hizo y el tipo de documento que censaba dejó de estar registrado en el Studio. Los documentos siguen en el dataset, así que el script todavía correría — pero mediría un corpus que nadie va a volver a convertir, y su resultado no destraba ninguna decisión pendiente.

## Convención

Cualquier script futuro de diagnóstico/auditoría/migración sobre datos de Sanity vive en `scripts/audit/`, se documenta arriba con su comando y su etiqueta **read-only / escribe-en-prod**, y **no** se agrega a `package.json`.

**La carpeta se lintea como el resto de `scripts/`, sin exención.** Que un script sea one-off describe una intención sobre su uso, no una propiedad de su código: se lee igual, se copia igual y sirve igual de plantilla para el próximo. Exceptuarla sería exceptuar todo lo que venga.
