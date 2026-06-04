# Plan: Exportación de biografías de autores a Markdown

## Objetivo

Disponer de un script reutilizable que extraiga de Sanity Studio el listado de autores publicados y emita un archivo Markdown por autor con su nombre y biografía. La salida sirve como material de referencia estilística para la redacción de biografías futuras (por ejemplo, como contexto _few-shot_ para un asistente de redacción).

## Alcance

**Incluye:**

- Consulta GROQ filtrando autores publicados con biografía definida.
- Conversión del campo `biography` (Portable Text / `blockContent`) a Markdown.
- Escritura de un archivo `.md` por autor en una carpeta de salida fija.
- Integración como comando `pnpm` para ejecución reutilizable.

**No incluye (por ahora):**

- Imágenes (se referencian por `_ref` pero no se descargan).
- Filtrado por nacionalidad, idioma u otros criterios.
- Generación de un único archivo agregado.
- Versionado en git de la salida (queda _gitignored_).

## Diseño

### Ubicación e invocación

- Script: `scripts/export-authors-bios.ts`, siguiendo la convención del resto de scripts del repo (`flatten-author-biography.ts`, `generate-localized-bios.ts`, etc.).
- Comando: `pnpm export-authors-bios`, que se expande a `node --import tsx --env-file=.env ./scripts/export-authors-bios.ts` (mismo patrón que `delete-unused-assets`).

### Conexión a Sanity

- Reutilizar `src/api/_helpers/sanity-connector.ts`: lee `SANITY_*` desde `.env` y crea el cliente con `useCdn: false` cuando estamos en desarrollo.
- No requiere token de escritura; la consulta es de sólo lectura.

### Consulta GROQ

```groq
*[_type == 'author' && !(_id in path('drafts.**')) && defined(biography)]{
    name,
    'slug': slug.current,
    biography
} | order(name asc)
```

Filtra borradores y autores sin biografía cargada. El orden alfabético facilita inspección manual.

### Conversión `blockContent` → Markdown

Se implementa un conversor pequeño dentro del propio script (sin nueva dependencia). El esquema `blockContent` del proyecto contiene:

- Bloques con `style` ∈ {`normal`, `h1`–`h6`, `blockquote`}.
- Marcas decorativas: `strong`, `em`, `code`, más decoradores de alineación (`left`/`center`/`right`/`justify`).
- Items de lista (`bullet`, `number`) con `level` para anidamiento.
- Anotaciones de links (Sanity las habilita por defecto cuando no se pasa `marks.annotations: []`).
- Imágenes inline.

Mapeos:

| Entrada                    | Markdown                                |
| -------------------------- | --------------------------------------- |
| `style: 'normal'`          | párrafo plano                           |
| `style: 'h1'`–`'h6'`       | `#`–`######`                            |
| `style: 'blockquote'`      | `> ...`                                 |
| `listItem: 'bullet'`       | `- ...` (sangría según `level`)         |
| `listItem: 'number'`       | `1. ...`                                |
| Marca `strong`             | `**...**`                               |
| Marca `em`                 | `_..._`                                 |
| Marca `code`               | `` `...` ``                             |
| Marca de link (annotation) | `[texto](href)`                         |
| Decoradores de alineación  | ignorados (son presentación, no prosa)  |
| Bloque `image`             | `![](image-ref)` (referencia, no fetch) |

### Salida

- Carpeta: `tools/author-bios/`.
- Un archivo por autor: `<slug>.md`.
- Cada archivo comienza con `# {name}` seguido de una línea en blanco y el cuerpo Markdown.
- Idempotente: re-ejecutar sobreescribe los archivos existentes.
- La carpeta queda en `.gitignore` (datos derivados, no fuente de verdad).

## Pasos de implementación

1. Agregar `tools/author-bios/` a `.gitignore`.
2. Crear `scripts/export-authors-bios.ts` con la query, el conversor y la escritura a disco.
3. Agregar entrada `"export-authors-bios"` a `scripts` en `package.json`.
4. Validar localmente ejecutando `pnpm export-authors-bios` y revisando un par de archivos generados.

## Criterios de aceptación

- `pnpm export-authors-bios` finaliza con código 0 y reporta cuántos archivos escribió.
- Se genera un `.md` por autor publicado con biografía no vacía; los autores sin biografía o con biografía vacía se omiten con un log.
- La salida preserva párrafos, encabezados, listas, énfasis y enlaces, descartando los decoradores de alineación.
- Re-ejecutar el comando actualiza los archivos en su lugar sin errores.
- `.env` con credenciales de Sanity es el único requisito; no se necesita configuración manual adicional.

## Notas operativas

- Este trabajo es independiente del issue #1478 (fechas a.C.). Si se desea PR separada, mover los commits a una rama nueva basada en `develop` antes de _push_.
- La carpeta de salida queda _gitignored_; no se compromete a git por su volatilidad y tamaño potencial.
