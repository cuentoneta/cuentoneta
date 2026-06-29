# Corpus de mocks — obras de François Onoff

Fuente de verdad del corpus de mocks de `story` generado en el issue [#1650](https://github.com/cuentoneta/cuentoneta/issues/1650).

> **Datos ficticios.** Autor y obras pertenecen al personaje "Onoff" del film _Una pura formalità_ (G. Tornatore, 1994). Ninguna de estas obras existe. Las citas entrecomilladas provienen de los diálogos del film; el resto (fechas, editorial, sinopsis) es invención coherente con su universo.

## Qué hay acá

Una ficha Markdown por obra (`<slug>.md`) con: título, slug, publicación original, reseña y el path de portada asignado. Son la fuente regenerable del corpus. La **reseña** de la ficha alimenta el campo `summary` de la story; `paragraphs` es **cuerpo ficticio generado** a partir de ella.

## Estructura y convención de naming

El corpus son **`Story` completos** (fuente de verdad), de los que se **derivan** los teasers:

- **Story completo:** `<slugCamelCase>StoryMock: Story` en `<autor>-stories.mock.ts`; array `<autor>StoriesMock: Story[]`.
- **Teaser derivado:** `<slugCamelCase>TeaserMock: StoryTeaserWithAuthor` en `<autor>-story-teasers.mock.ts`; array `<autor>StoryTeasersMock`.
- **`_id`:** `'onoff-story-<slug>'`.

Aplicá esta convención al sumar corpus de otros autores en el epic #1651.

## Convención de portadas (assets locales)

- **Directorio:** `src/assets/img/mocks/stories/`
- **Nombre:** `<slug>.svg` (la misma cadena que el campo `slug` del mock)
- **Path en el mock:** `assets/img/mocks/stories/<slug>.svg` (sin `./` ni `/` inicial)
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
