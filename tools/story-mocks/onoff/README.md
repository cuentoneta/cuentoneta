# Corpus de mocks — obras de François Onoff

Fuente de verdad del corpus de mocks de `story` generado en el issue [#1650](https://github.com/cuentoneta/cuentoneta/issues/1650).

> **Datos ficticios.** Autor y obras pertenecen al personaje "Onoff" del film _Una pura formalità_ (G. Tornatore, 1994). Ninguna de estas obras existe. Las citas entrecomilladas provienen de los diálogos del film; el resto (fechas, editorial, sinopsis) es invención coherente con su universo.

## Qué hay acá

Una ficha Markdown por obra (`<slug>.md`) con: título, slug, publicación original, reseña y el path de portada asignado. Son la fuente regenerable del corpus. La **reseña** de la ficha alimenta el campo `summary` de la story; `paragraphs` es **cuerpo ficticio generado** a partir de ella.

## Estructura y convención de naming

El corpus son **`Story` completos** (fuente de verdad), de los que se **derivan** los teasers:

- **Story completo:** un archivo por obra en `src/app/mocks/onoff/<slug>.mock.ts`, export `<slugCamelCase>StoryMock: Story` (cuerpo de 10–15 párrafos con itálicas/negritas).
- **Agregador:** `src/app/mocks/onoff-stories.mock.ts` exporta `onoffStoriesMock: Story[]`.
- **Teasers derivados:** `src/app/mocks/onoff-story-teasers.mock.ts` deriva con `toTeaser` (trunca el cuerpo a 3 párrafos, como el ACL con `body[0...3]`); exporta `<slugCamelCase>TeaserMock` + `onoffStoryTeasersMock`.
- **`_id`:** `'onoff-story-<slug>'`.

Un archivo por obra mantiene cada mock bajo el límite de 500 líneas. Aplicá esta convención al sumar corpus de otros autores en el epic #1651.

## Corpus LiteraryWork (#1653)

El mismo elenco de 8 obras existe además como corpus **`LiteraryWork`** (migración #1653), que **coexiste** con el corpus `Story` de arriba (este último sigue alimentando `Storylist` y las stories de `cover-image`). Diferencias de origen del contenido:

- **Cuerpo (`bodyHtml`):** vive como Markdown plano en `src/app/mocks/onoff/<slug>.md` (solo el cuerpo, sin metadata) y se importa con `?raw` de Vite. El mock corre `markdownToSanitizedHtml` (`@utils/markdown-pipeline.utils`) al cargar el módulo para obtener el `SanitizedHtml`; el `.md` es la fuente literal editable.
- **`readingTime`:** se **deriva** del propio cuerpo (`deriveSectionReadingTime`); `totalReadingTime` lo suma la factory. No se hardcodea.
- **Metadata** (título, slug, portada, autor, tags, publicación): literales TS en el mock, no en el `.md`.
- **Secciones:** una por obra (`position: 0`, sin `title` ni `epigraphs`), ya que cada obra es prosa plana.

Archivos:

- **`LiteraryWork` completa:** `src/app/mocks/onoff/<slug>.mock.ts`, export `<slugCamelCase>LiteraryWorkMock: LiteraryWork` (vía `createLiteraryWork`).
- **Agregador:** `src/app/mocks/onoff-literary-works.mock.ts` → `onoffLiteraryWorksMock: LiteraryWork[]`.
- **Teasers derivados:** `src/app/mocks/onoff-literary-work-teasers.mock.ts` (`toTeaser`) → `<slugCamelCase>LiteraryWorkTeaserMock` + `onoffLiteraryWorkTeasersMock`.
- **Fixture genérico:** `src/app/mocks/literary-work.mock.ts` (obra de prueba + teasers base para los specs/stories de las tarjetas `LiteraryWork*`).

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
