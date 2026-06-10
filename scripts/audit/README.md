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

| Script                     | Tipo                                                  | Qué hace                                                                                                                                                                                                                                                                                    |
| -------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `audit-bold-names.ts`      | **Read-only** ✅                                      | Audita qué autores publicados no tienen su `name` en negrita dentro de su biografía. Reporta **Grupo A** (sin ninguna negrita) y **Grupo B** (hay negrita, pero el `name` no aparece como subcadena contigua).                                                                              |
| `export-authors-bios.ts`   | **Read-only** de Sanity ✅ (escribe archivos locales) | Exporta la biografía de cada autor publicado a un `.md` en `tools/author-bios/` (carpeta _gitignored_), como material de referencia estilística.                                                                                                                                            |
| `bold-author-pen-names.ts` | **⚠️ Escribe en Sanity (producción)**                 | Aplica negrita al nombre del autor dentro de su biografía, según una **lista curada** de operaciones (`in_place` / `prepend` / `skip`). Deja los cambios como **borradores (`drafts.*`), sin publicar**, para revisión en Studio. Es **idempotente** (saltea drafts que ya tienen negrita). |

### Comandos

```bash
# Auditoría (solo lectura)
pnpm exec tsx --env-file=.env scripts/audit/audit-bold-names.ts

# Export de biografías a Markdown (solo lectura; salida en tools/author-bios/)
pnpm exec tsx --env-file=.env scripts/audit/export-authors-bios.ts

# Negrita de nombres — ⚠️ crea drafts en el dataset de .env (producción)
pnpm exec tsx --env-file=.env scripts/audit/bold-author-pen-names.ts
```

## Detalle: `export-authors-bios.ts`

Consulta los autores publicados con biografía definida y convierte el campo `biography` (Portable Text / `blockContent`) a Markdown, sin dependencias extra.

Consulta GROQ:

```groq
*[_type == 'author' && !(_id in path('drafts.**')) && defined(biography)]{
    name,
    'slug': slug.current,
    biography
} | order(name asc)
```

Mapeo `blockContent` → Markdown:

| Entrada                   | Markdown                                   |
| ------------------------- | ------------------------------------------ |
| `style: 'normal'`         | párrafo plano                              |
| `style: 'h1'`–`'h6'`      | `#`–`######`                               |
| `style: 'blockquote'`     | `> ...`                                    |
| `listItem: 'bullet'`      | `- ...` (sangría según `level`)            |
| `listItem: 'number'`      | `1. ...`                                   |
| Marca `strong`            | `**...**`                                  |
| Marca `em`                | `_..._`                                    |
| Marca `code`              | `` `...` ``                                |
| Anotación de link         | `[texto](href)`                            |
| Decoradores de alineación | ignorados (presentación, no prosa)         |
| Bloque `image`            | `![](image-ref)` (referencia, no descarga) |

Salida: un archivo `tools/author-bios/<slug>.md` por autor, encabezado `# {name}` + cuerpo. Idempotente (sobrescribe). La carpeta está _gitignored_.

## Convención

Cualquier script futuro de diagnóstico/auditoría/migración sobre datos de Sanity vive en `scripts/audit/`, se documenta en esta tabla con su comando y su etiqueta **read-only / escribe-en-prod**, y **no** se agrega a `package.json`.
