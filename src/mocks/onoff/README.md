# Corpus de mocks — obras de François Onoff

> **Datos ficticios.** Autor y obras pertenecen al personaje "Onoff" del film _Una pura formalità_ (G. Tornatore, 1994). Ninguna de estas obras existe. Las citas entrecomilladas provienen de los diálogos del film; el resto (fechas, editorial, sinopsis) es invención coherente con su universo.

Este directorio (`src/mocks/onoff/`) es la **única ubicación** del corpus de las 8 obras de François Onoff, accesible por frontend y backend vía el alias `@mocks/onoff`. Desde [#1981](https://github.com/cuentoneta/cuentoneta/issues/1981) conviven acá dos capas del mismo elenco:

- **Mocks de dominio** (los consume el frontend): `<slug>.mock.ts` con `<slugCamelCase>StoryMock: Story` y `<slugCamelCase>LiteraryWorkMock: LiteraryWork`.
- **Fixtures raw** (shape crudo de Sanity, los consume el backend): `<slug>.raw.mock.ts` / `<slug>.literary-work.raw.mock.ts`, tipados contra los `*BySlugQueryResult` de `@sanity-types` (los tipos generados de Sanity, promovidos al kernel).

Antes de #1981 los fixtures raw vivían en `src/api/_mocks/onoff/`, separados por capa; se unificaron acá (el kernel vive en top-level `src/`, a la par de `src/app` y `src/api`, así que ambas capas lo consumen sin acoplarse entre sí).

> Las fichas Markdown por obra (metadata + reseña) que vivían en `tools/story-mocks/onoff/` se retiraron en #1653: los mocks TS de este directorio son ahora la fuente.

## Corpus de dominio: `Story`

Generado en [#1650](https://github.com/cuentoneta/cuentoneta/issues/1650); fuente histórica, sigue alimentando `Storylist` y las stories de `cover-image`.

- **Story completo:** `<slug>.mock.ts`, export `<slugCamelCase>StoryMock: Story` (cuerpo de 10–15 párrafos con itálicas/negritas).
- **Agregador:** `../onoff-stories.mock.ts` → `onoffStoriesMock: Story[]`.
- **Teasers derivados:** `../onoff-story-teasers.mock.ts` deriva con `toTeaser` (trunca el cuerpo a 3 párrafos, como el ACL con `body[0...3]`) → `<slugCamelCase>TeaserMock` + `onoffStoryTeasersMock`.
- **`_id`:** `'onoff-story-<slug>'`.

## Corpus de dominio: `LiteraryWork` (#1653)

Mismo elenco, coexistiendo con el corpus `Story`. Diferencias de origen del contenido:

- **Cuerpo (`bodyHtml`):** vive como Markdown plano en `<slug>.md` (solo el cuerpo, sin metadata) y se importa con `?raw` de Vite. El mock corre `markdownToSanitizedHtml` (`@utils/markdown-pipeline.utils`) al cargar el módulo para obtener el `SanitizedHtml`; el `.md` es la fuente literal editable.
- **`readingTime`:** se **deriva** del propio cuerpo (`deriveSectionReadingTime`); `totalReadingTime` lo suma la factory. No se hardcodea.
- **Metadata** (título, slug, portada, autor, tags, publicación): literales TS en el mock, no en el `.md`.
- **Secciones:** una por obra (`position: 0`), ya que cada obra es prosa plana. `el-odio` es la excepción: su sección lleva `title` y un `epigraphs` de un elemento, exportado aparte como `elOdioEpigraphMock` — es el **epígrafe canónico del corpus**, la fuente de la que specs y stories toman `SanitizedHtml` sin hand-authorear prosa.
- **`editorialNote`:** vive como Markdown plano en `<slug>.editorial-note.md`, importado con `?raw`, la misma convención que `<slug>.md` para el cuerpo. Su prosa está **derivada del `summary` del mock de `Story` homónimo** (no hand-authoreada). `neron` es la **excepción deliberada**: no tiene `.editorial-note.md`, su mock de dominio omite el campo y su fixture raw lo transporta en `null` (la clave es obligatoria en el tipo generado) — es el fixture del corpus que ejercita, extremo a extremo, la rama de una obra sin nota editorial.

Archivos:

- **`LiteraryWork` completa:** `<slug>.mock.ts`, export `<slugCamelCase>LiteraryWorkMock: LiteraryWork` (vía `createLiteraryWork`).
- **Agregador:** `../onoff-literary-works.mock.ts` → `onoffLiteraryWorksMock: LiteraryWork[]`.
- **Teasers derivados:** `../onoff-literary-work-teasers.mock.ts` (`toTeaser`) → `<slugCamelCase>LiteraryWorkTeaserMock` + `onoffLiteraryWorkTeasersMock`.

## Corpus raw: `Story` (shape de Sanity)

Contraparte cruda del corpus de dominio `Story` — lo que devuelven las queries GROQ antes del ACL/mapper. La consume el backend (`src/api`).

- **Story raw:** `<slug>.raw.mock.ts`, export `<slugCamelCase>RawStory: NonNullable<StoryBySlugQueryResult>`.
- **Colecciones raw:** `<slug>.collection.raw.mock.ts` (p. ej. `el-inventario-de-las-pasiones`, `geometrias-del-desvelo`).
- **Agregadores:** `../onoff-raw-stories.mock.ts` (`onoffRawStoriesMock`, teasers `<slugCamelCase>RawTeaser`, `onoffRawTeasersMock`, `onoffRawNavTeasersMock`); `../onoff-raw-author.mock.ts` (`rawOnoffAuthor`, `rawOnoffAuthorTeaser`).

## Corpus raw: `LiteraryWork` (#1981)

Contraparte cruda del corpus de dominio `LiteraryWork`, tipada contra `NonNullable<LiteraryWorkBySlugQueryResult>`. Alimenta los tests de la capa de datos de `LiteraryWork` (mapper/repository/service).

- **LiteraryWork raw:** `<slug>.literary-work.raw.mock.ts`, export `<slugCamelCase>RawLiteraryWork`. Mono-sección; el `content[0].body` se importa desde el mismo `<slug>.md?raw` que usa el mock de dominio (sin duplicar prosa); la metadata espeja el mock de dominio homónimo. `editorialNote` sigue la misma regla: importa el mismo `<slug>.editorial-note.md?raw` que el mock de dominio (ausente en `neron`).
- **Agregador:** `../onoff-raw-literary-works.mock.ts` → `onoffRawLiteraryWorksMock` (las 8, en el mismo orden que `onoffLiteraryWorksMock`).
- **Escenarios de borde** (overrides `{ ...base, … }` sobre las obras canónicas), para ejercitar el mapper y la materialización sin depender del contenido base:
  - `multiSectionRawLiteraryWork` — obra multi-sección (`sectionCount > 1`).
  - `unmaterializedRawLiteraryWork` — `totalReadingTime` y `content[].readingTime` en `null` (ejercita el self-healing del mapper).
- **Autor raw:** `rawOnoffAuthor` (reusado del corpus raw de Story, estructuralmente idéntico).

## Convención de portadas (assets locales)

- **Directorio:** `src/assets/img/mocks/stories/`
- **Nombre:** `<slug>.png` (la misma cadena que el campo `slug` del mock)
- **Path en el mock:** `assets/img/mocks/stories/<slug>.png` (sin `./` ni `/` inicial)
- **Aspecto:** portrait 3:4 (referencia 118×164 del `CoverImageComponent`)

## Obras

| Obra                              | Slug                              | Publicación original        |
| --------------------------------- | --------------------------------- | --------------------------- |
| El palacio de las nueve fronteras | el-palacio-de-las-nueve-fronteras | Éditions du Méridien (1985) |
| Geometría                         | geometria                         | Éditions du Méridien (1974) |
| Los peldaños                      | los-peldanos                      | Éditions du Méridien (1977) |
| Las escaleras                     | las-escaleras                     | Éditions du Méridien (1979) |
| El odio                           | el-odio                           | Éditions du Méridien (1971) |
| El tratado de los placeres        | el-tratado-de-los-placeres        | Éditions du Méridien (1981) |
| Las dos antorchas                 | las-dos-antorchas                 | Éditions du Méridien (1987) |
| Nerón                             | neron                             | Estreno teatral (1988)      |
