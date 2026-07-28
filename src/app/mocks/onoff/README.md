# Corpus de mocks — obras de François Onoff

> **Datos ficticios.** Autor y obras pertenecen al personaje "Onoff" del film _Una pura formalità_ (G. Tornatore, 1994). Ninguna de estas obras existe. Las citas entrecomilladas provienen de los diálogos del film; el resto (fechas, editorial, sinopsis) es invención coherente con su universo.

Este directorio (`src/app/mocks/onoff/`) contiene el corpus de mocks de las 8 obras de François Onoff. Conviven **dos corpus** del mismo elenco:

- **`Story`** (generado en [#1650](https://github.com/cuentoneta/cuentoneta/issues/1650)): fuente histórica; sigue alimentando `Storylist` y las stories de `cover-image`.
- **`LiteraryWork`** (migración [#1653](https://github.com/cuentoneta/cuentoneta/issues/1653)): el modelo de dominio nuevo.

Ambos mocks de una obra viven en el mismo `<slug>.mock.ts`.

> Las fichas Markdown por obra (metadata + reseña) que vivían en `tools/story-mocks/onoff/` se retiraron en #1653: los mocks TS de este directorio son ahora la fuente.

## Corpus `Story`

- **Story completo:** `<slug>.mock.ts`, export `<slugCamelCase>StoryMock: Story` (cuerpo de 10–15 párrafos con itálicas/negritas).
- **Agregador:** `../onoff-stories.mock.ts` → `onoffStoriesMock: Story[]`.
- **Teasers derivados:** `../onoff-story-teasers.mock.ts` deriva con `toTeaser` (trunca el cuerpo a 3 párrafos, como el ACL con `body[0...3]`) → `<slugCamelCase>TeaserMock` + `onoffStoryTeasersMock`.
- **`_id`:** `'onoff-story-<slug>'`.

## Corpus `LiteraryWork` (#1653)

Mismo elenco, coexistiendo con el corpus `Story`. Diferencias de origen del contenido:

- **Cuerpo (`bodyHtml`):** vive como Markdown plano en `<slug>.md` (solo el cuerpo, sin metadata) y se importa con `?raw` de Vite. El mock corre `markdownToSanitizedHtml` (`@utils/markdown-pipeline.utils`) al cargar el módulo para obtener el `SanitizedHtml`; el `.md` es la fuente literal editable.
- **`readingTime`:** se **deriva** del propio cuerpo (`deriveSectionReadingTime`); `totalReadingTime` lo suma la factory. No se hardcodea.
- **Metadata** (título, slug, portada, autor, tags, publicación): literales TS en el mock, no en el `.md`.
- **Secciones:** una por obra (`position: 0`, sin `title` ni `epigraphs`), ya que cada obra es prosa plana.

Archivos:

- **`LiteraryWork` completa:** `<slug>.mock.ts`, export `<slugCamelCase>LiteraryWorkMock: LiteraryWork` (vía `createLiteraryWork`).
- **Agregador:** `../onoff-literary-works.mock.ts` → `onoffLiteraryWorksMock: LiteraryWork[]`.
- **Teasers derivados:** `../onoff-literary-work-teasers.mock.ts` (`toTeaser`) → `<slugCamelCase>LiteraryWorkTeaserMock` + `onoffLiteraryWorkTeasersMock`.

Un archivo por obra mantiene cada mock bajo el límite de 500 líneas. Aplicá esta convención al sumar corpus de otros autores en el epic #1651.

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
