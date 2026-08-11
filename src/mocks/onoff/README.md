# Corpus de mocks — obras de François Onoff

> **Datos ficticios.** Autor y obras pertenecen al personaje "Onoff" del film _Una pura formalità_ (G. Tornatore, 1994). Ninguna de estas obras existe. Las citas entrecomilladas provienen de los diálogos del film; el resto (fechas, editorial, sinopsis) es invención coherente con su universo.

Este directorio (`src/mocks/onoff/`) es la **única ubicación** del corpus de las 8 obras de François Onoff, accesible por frontend y backend vía el alias `@mocks/onoff`. Desde [#1981](https://github.com/cuentoneta/cuentoneta/issues/1981) conviven acá dos capas del mismo elenco:

- **Mocks de dominio** (los consume el frontend): `<slug>.<entidad>.mock.ts`.
- **Fixtures raw** (shape crudo de Sanity, los consume el backend): `<slug>.<entidad>.raw.mock.ts`, tipados contra los `*QueryResult` de `@sanity-types` (los tipos generados de Sanity, promovidos al kernel).

## Cómo está organizado

Las piezas se agrupan **por entidad**, una carpeta cada una. Los mocks y fixtures conservan igualmente el infijo de entidad en el nombre, así que siguen siendo unívocos fuera de contexto; la prosa no lo lleva, porque su extensión ya la distingue:

```
onoff/
├── story/          <slug>.story.mock.ts · <slug>.story.raw.mock.ts
├── literary-work/  <slug>.literary-work.mock.ts · <slug>.literary-work.raw.mock.ts
│                   + su prosa: <slug>.md · <slug>.editorial-note.md · <slug>.epigraph.ts
├── collection/     <slug>.collection.raw.mock.ts · <slug>.collection.md · las proyecciones
├── storylist/      <slug>.storylist.raw.mock.ts
├── author/         francois-onoff.biography.md · author.document.projection.ts
├── media/          <slug>.media.ts · <slug>.media.mock.ts · <slug>.media.raw.mock.ts
└── document/       la factory de campos de sistema y los documentos de soporte
```

**Los agregadores no viven acá:** están un nivel arriba, en `src/mocks/`, y son lo que el resto del repo importa. Una regla de ESLint prohíbe importar una pieza puntual desde fuera de `src/mocks/**`.

## Las tres capas

```
documentos  →  (query GROQ)  →  raw  →  (ACL del repository)  →  dominio
```

- **Documentos** (`<entidad>.document.projection.ts`): lo que vive en el content lake. Los consume un test que evalúa una query con `groq-js` sobre `onoffDatasetMock`.
- **Raw** (`<slug>.<entidad>.raw.mock.ts`): el resultado de la query, tipado contra los `*QueryResult`. Lo consumen los specs de repository y mapper.
- **Dominio** (`<slug>.<entidad>.mock.ts`): el agregado construido por su factory. Lo consume el frontend.

**Los documentos se derivan del raw, no al revés**, aunque el flujo real vaya en la dirección opuesta. El raw es lo que ya existía escrito, así que invertir la proyección de la query evita duplicar contenido: es el mismo criterio con el que el dominio se deriva del raw. Invertir es desanidar lo que la query aplana —el slug vuelve a ser objeto, las etiquetas vuelven a ser referencias— y descartar lo que la query agrega, como el conteo de secciones.

**Qué impide que la inversión mienta:** `onoff-documents.mock.spec.ts` vuelve a aplicar las queries reales sobre los documentos derivados y compara contra el canon crudo. Si el resultado no lo reprodujera, los documentos estarían afirmando un content lake que no existe.

**Un documento faltante no falla.** Si una referencia apunta a un `_id` que no está en el dataset, `groq-js` la resuelve a `null` en silencio — no lanza. Por eso el dataset se pide entero (`onoffDatasetMock`) en vez de armar subconjuntos por caso, y por eso cada proyección emite también los documentos de soporte que sus referencias necesitan, incluido el asset de audio.

**`document/` no es una entidad**, como `media/`: aloja la factory de campos de sistema y los documentos que varias entidades referencian (etiquetas, nacionalidades, tipos de recurso).

**Las carpetas no son independientes entre sí.** `literary-work/<slug>.literary-work.mock.ts` importa a su hermano de `story/`: la obra deriva de la story todo lo que las dos caras comparten —metadata, autor, portada, recursos y datos de publicación—, y declara por su cuenta solo lo que es propio de `LiteraryWork`. Esa relación existía antes, escondida por vivir las dos caras en el mismo archivo; separarlas la volvió visible en vez de crearla.

**`media/` no es una entidad**, es la excepción: la story y la obra literaria del mismo slug consumen _el mismo_ objeto de medios, y duplicarlo rompería la invariante de que ambas caras declaren exactamente los mismos. Ninguna de las dos puede reclamarlo, así que vive aparte. Es el criterio para la próxima pieza que se sume: si más de una entidad la consume y duplicarla rompería una invariante, va a carpeta propia; si solo la usa una, va con esa entidad.

Antes de #1981 los fixtures raw vivían en `src/api/_mocks/onoff/`, separados por capa; se unificaron acá (el kernel vive en top-level `src/`, a la par de `src/app` y `src/api`, así que ambas capas lo consumen sin acoplarse entre sí).

> Las fichas Markdown por obra (metadata + reseña) que vivían en `tools/story-mocks/onoff/` se retiraron en #1653: los mocks TS de este directorio son ahora la fuente.

## Corpus de dominio: `Story`

Generado en [#1650](https://github.com/cuentoneta/cuentoneta/issues/1650); fuente histórica, sigue alimentando `Storylist` y las stories de `cover-image`.

- **Story completo:** `story/<slug>.story.mock.ts`, export `<slugCamelCase>StoryMock: Story` (cuerpo de 10–15 párrafos con itálicas/negritas).
- **Agregador:** `../onoff-stories.mock.ts` → `onoffStoriesMock: Story[]`.
- **Teasers derivados:** `../onoff-story-teasers.mock.ts` deriva con `toTeaser` (trunca el cuerpo a 3 párrafos, como el ACL con `body[0...3]`) → `<slugCamelCase>TeaserMock` + `onoffStoryTeasersMock`.
- **`_id`:** `'onoff-story-<slug>'`.

## Corpus de dominio: `LiteraryWork` (#1653)

Mismo elenco, coexistiendo con el corpus `Story`. Diferencias de origen del contenido:

- **Cuerpo (`bodyHtml`):** vive como Markdown plano en `literary-work/<slug>.md` (solo el cuerpo, sin metadata) y se importa con `?raw` de Vite. El mock corre `markdownToSanitizedHtml` (`@utils/markdown-pipeline.utils`) al cargar el módulo para obtener el `SanitizedHtml`; el `.md` es la fuente literal editable.
- **`readingTime`:** se **deriva** del propio cuerpo (`deriveSectionReadingTime`); `totalReadingTime` lo suma la factory. No se hardcodea.
- **Metadata** (título, slug, portada, autor, tags, publicación): literales TS en el mock, no en el `.md`.
- **Secciones:** una por obra (`position: 0`). La mayoría es prosa plana (sin `title` ni `epigraphs`), pero un subconjunto — `el-odio`, `el-palacio-de-las-nueve-fronteras`, `geometria` — lleva `title` (`SectionTitle`) + `epigraphs` para darle sustancia a los selectores por capacidad del canon (`onoffLiteraryWorksWithSectionTitles` / `onoffLiteraryWorksWithEpigraphs` en `onoff-literary-works.mock.ts`).
- **`epigraphs`:** cada obra que lleva uno lo declara como export nombrado (`<slugCamelCase>EpigraphMock`) y lo consume desde su propia sección, para que specs y stories puedan tomar un epígrafe concreto sin hand-authorear prosa. El conjunto de todos vive en `../onoff-literary-works.mock.ts` → `onoffLiteraryWorkEpigraphsMock`, **derivado** del corpus (no una lista en paralelo): quien necesita el shape `{ text, reference? }` (`AttributedText`) y no la obra que lo contiene lo toma de ahí.
- **Fuente compartida del título + epígrafe:** el título de sección y los textos crudos del epígrafe (el Markdown de `text` y `reference`) viven en un módulo neutral `literary-work/<slug>.epigraph.ts` (solo strings, sin dependencias). Del mismo módulo tiran **tanto** el mock de dominio (envolviendo los strings con `createSectionTitle` / `createAttributedText` + `markdownToSanitizedHtml`) **como** su fixture raw homónimo (que los transporta crudos). Así ambas capas comparten una única fuente literal y no pueden divergir ([#2016](https://github.com/cuentoneta/cuentoneta/issues/2016)).
- **`mediaSources`:** `geometria` es la única obra con multimedia, y cubre los cuatro tipos que el dominio modela más un `pdfLink`, que el schema admite y el ACL descarta — el caso real de tipo no mapeado. Sus textos de descripción viven en el módulo neutral `media/<slug>.media.ts` (solo strings, misma convención que `<slug>.epigraph.ts`), y el array crudo se declara una vez en `media/<slug>.media.raw.mock.ts` (`geometriaRawMediaSources`) del que tiran las dos caras: las dos proyecciones resuelven `audioUrl` igual, así que comparten fixture en vez de duplicarlo. Sostiene los selectores `onoffRawLiteraryWorksWithMediaSources`, `onoffLiteraryWorksWithMediaSources` y `onoffLiteraryWorkTeasersWithMediaSources`.
- **`editorialNote`:** vive como Markdown plano en `literary-work/<slug>.editorial-note.md`, importado con `?raw`, la misma convención que `<slug>.md` para el cuerpo. Su prosa está **derivada del `summary` del mock de `Story` homónimo** (no hand-authoreada). `neron` es la **excepción deliberada**: no tiene `literary-work/<slug>.editorial-note.md`, su mock de dominio omite el campo y su fixture raw lo transporta en `null` (la clave es obligatoria en el tipo generado) — es el fixture que sostiene el selector `onoffLiteraryWorksWithoutEditorialNote` y ejercita, extremo a extremo, la rama de una obra sin nota.

Archivos:

- **`LiteraryWork` completa:** `literary-work/<slug>.literary-work.mock.ts`, export `<slugCamelCase>LiteraryWorkMock: LiteraryWork` (vía `createLiteraryWork`).
- **Agregador:** `../onoff-literary-works.mock.ts` → `onoffLiteraryWorksMock: LiteraryWork[]`.
- **Teasers derivados:** `../onoff-literary-work-teasers.mock.ts` (`toTeaser`) → `<slugCamelCase>LiteraryWorkTeaserMock` + `onoffLiteraryWorkTeasersMock`.

## Corpus de dominio: `Author`

La biografía de François Onoff vive como Markdown plano en un único archivo, `author/francois-onoff.biography.md` (solo la prosa, sin metadata), importado con `?raw` — misma convención que `<slug>.editorial-note.md` para `LiteraryWork`. `../onoff-raw-author.mock.ts` (`rawOnoffAuthor.biography`) transporta ese Markdown crudo; `../author.mock.ts` deriva el `SanitizedHtml` corriendo `markdownToSanitizedHtml(createMarkdown(...))` sobre la misma fuente. Es el único archivo de biografía del corpus: el elenco modela un solo autor (Onoff), así que no hay un `<slug>.biography.md` por obra. `rawOnoffAuthorTeaser` no declara `biography`, en paridad con `AuthorTeaser` de dominio.

## Corpus de dominio: `Collection`

Corpus mínimo de dos colecciones de `LiteraryWork`, una por cada rama de `imagery`.

- **Descripciones:** Markdown plano por colección — `collection/<slug>.collection.md`, importados con `?raw` y saneados con `markdownToSanitizedHtml`, misma convención que `<slug>.editorial-note.md` de `LiteraryWork`.
- **Colecciones:** `../onoff-collections.mock.ts`, export `geometriasDelDesveloCollectionMock` (rama `representative`, con portada editorial propia) e `inventarioDeLasPasionesCollectionMock` (rama `sample`, sin portada propia) — ambas construidas vía `createCollection`.
- **Obras:** cada colección se cura con las obras que su propia prosa nombra —`geometria`/`losPeldanos`/`lasEscaleras` y `elTratadoDeLosPlaceres`/`elOdio`/`lasDosAntorchas`—, importadas del agregador por nombre. No cortar el agregador por índice: las dos colecciones quedarían indistinguibles por contenido.
- **Agregador:** `onoffCollectionsMock: Collection[]`.
- **Selectores por capacidad:** `onoffCollectionsWithRepresentativeImageryMock`, `onoffCollectionsWithSampleImageryMock` y `onoffCollectionsWithMediaSourcesMock`, derivados por predicado sobre el agregador.
- **Teasers derivados:** `toTeaser` (vacía `literaryWorks`) → `onoffCollectionTeasersMock: CollectionTeaser[]`.
- **Nada se escribe a mano:** las obras (`literaryWorks`), los tags y las tres portadas de la rama `sample` se **derivan** del canon existente — `onoffLiteraryWorkTeasersMock` y `onoff-tags.mock.ts` — en vez de hardcodearse.

## Corpus raw: `Story` (shape de Sanity)

Contraparte cruda del corpus de dominio `Story` — lo que devuelven las queries GROQ antes del ACL/mapper. La consume el backend (`src/api`).

- **Story raw:** `story/<slug>.story.raw.mock.ts`, export `<slugCamelCase>RawStory: NonNullable<StoryBySlugQueryResult>`.
- **Storylists raw:** `storylist/<slug>.storylist.raw.mock.ts` (p. ej. `geometrias-del-desvelo`).
- **Colecciones raw:** `collection/<slug>.collection.raw.mock.ts`, una por archivo. Sus obras no se escriben: las proyecta del canon crudo `collection/raw-collection.projection.ts`, que las busca por slug y falla al importarse si alguna no existe. El agregador `../onoff-raw-collections.mock.ts` las consolida y deriva de ahí los teasers, los selectores por capacidad y los escenarios de borde.
- **Agregadores:** `../onoff-raw-stories.mock.ts` (`onoffRawStoriesMock`, teasers `<slugCamelCase>RawTeaser`, `onoffRawTeasersMock`, `onoffRawNavTeasersMock`); `../onoff-raw-author.mock.ts` (`rawOnoffAuthor`, `rawOnoffAuthorTeaser`).

## Corpus raw: `LiteraryWork` (#1981)

Contraparte cruda del corpus de dominio `LiteraryWork`, tipada contra `NonNullable<LiteraryWorkBySlugQueryResult>`. Alimenta los tests de la capa de datos de `LiteraryWork` (mapper/repository/service).

- **LiteraryWork raw:** `literary-work/<slug>.literary-work.raw.mock.ts`, export `<slugCamelCase>RawLiteraryWork`. Mono-sección; el `content[0].body` se importa desde el mismo `<slug>.md?raw` que usa el mock de dominio (sin duplicar prosa); la metadata espeja el mock de dominio homónimo. `editorialNote` sigue la misma regla: importa el mismo `<slug>.editorial-note.md?raw` que el mock de dominio (ausente en `neron`). El subconjunto enriquecido (`el-odio`, `el-palacio-de-las-nueve-fronteras`, `geometria`) trae además, en su `content[0]`, el `title` de sección y los `epigraphs` crudos tirados del mismo módulo neutral `<slug>.epigraph.ts` que consume el mock de dominio (ver §_Corpus de dominio: `LiteraryWork`_); el resto va con `title: null` / `epigraphs: []`.
- **Agregador:** `../onoff-raw-literary-works.mock.ts` → `onoffRawLiteraryWorksMock` (las 8, en el mismo orden que `onoffLiteraryWorksMock`).
- **Selector por capacidad:** `onoffRawLiteraryWorksWithEpigraphs` (contraparte cruda de `onoffLiteraryWorksWithEpigraphs`), derivado por predicado — las obras crudas con epígrafes, para ejercitar el mapeo raw→dominio del epígrafe sin conocer un slug concreto.
- **Escenarios de borde** (overrides `{ ...base, … }` sobre las obras canónicas), para ejercitar el mapper y la materialización sin depender del contenido base:
  - `multiSectionRawLiteraryWork` — obra multi-sección (`sectionCount > 1`).
  - `unmaterializedRawLiteraryWork` — `totalReadingTime` y `content[].readingTime` en `null` (ejercita el fallback puro de lectura del repository y el backfill, que es el único que persiste).
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
