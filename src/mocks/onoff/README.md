# Corpus de mocks — obras de François Onoff

> **Datos ficticios.** Autor y obras pertenecen al personaje "Onoff" del film _Una pura formalità_ (G. Tornatore, 1994). Ninguna de estas obras existe. Las citas entrecomilladas provienen de los diálogos del film; el resto (fechas, editorial, sinopsis) es invención coherente con su universo.

Este directorio (`src/mocks/onoff/`) es la **única ubicación** del corpus de las 8 obras de François Onoff, accesible por frontend y backend vía el alias `@mocks/onoff`. Desde [#1981](https://github.com/cuentoneta/cuentoneta/issues/1981) conviven acá tres capas del mismo elenco:

- **Documentos** (los consume `groq-js`): `<slug>.<entidad>.document.ts` — lo que Sanity guarda tal cual. Para las entidades que entran a la generación, es la **única capa escrita a mano**.
- **Fixtures raw** (las consume el backend): `<slug>.<entidad>.raw.mock.ts`, tipadas contra los `*QueryResult` de `@sanity-types` (los tipos generados de Sanity, promovidos al kernel). Para `literary-work/` y `collection/` se **generan**, no se editan (ver [Las tres capas](#las-tres-capas)).
- **Mocks de dominio** (los consume el frontend): `<slug>.<entidad>.mock.ts`.

## Cómo está organizado

Las piezas se agrupan **por entidad**, una carpeta cada una. Los mocks y fixtures conservan igualmente el infijo de entidad en el nombre, así que siguen siendo unívocos fuera de contexto; la prosa no lo lleva, porque su extensión ya la distingue:

```
onoff/
├── story/          <slug>.story.mock.ts · <slug>.story.raw.mock.ts
├── literary-work/  <slug>.literary-work.document.ts · <slug>.literary-work.raw.mock.ts (generado)
│                   <slug>.literary-work.mock.ts + su prosa: <slug>.md · <slug>.editorial-note.md · <slug>.epigraph.ts
├── collection/     <slug>.collection.document.ts · <slug>.collection.raw.mock.ts (generado) · <slug>.collection.md
├── storylist/      <slug>.storylist.raw.mock.ts
├── author/         francois-onoff.biography.md · author.document.projection.ts
├── media/          <slug>.media.ts · <slug>.media.mock.ts · <slug>.media.raw.mock.ts
└── document/       la factory de campos de sistema y los documentos de soporte
```

**Los agregadores no viven acá:** están un nivel arriba, en `src/mocks/`, y son lo que el resto del repo importa. Una regla de ESLint prohíbe importar una pieza puntual desde fuera de `src/mocks/**`.

## Las tres capas

```
documentos (a mano)  →  (groq-js, query real)  →  raw (generado)  →  (ACL del repository)  →  dominio
```

- **Documentos** (`<slug>.<entidad>.document.ts`): lo que vive en el content lake. Es la única capa escrita a mano **de `literary-work/` y `collection/`**, que son las que entran a la generación; el raw de `story/` y `storylist/` sigue siendo a mano, por lo que explica [Qué queda fuera de la generación](#qué-queda-fuera-de-la-generación).
- **Raw** (`<slug>.<entidad>.raw.mock.ts`): el resultado de evaluar la query GROQ real sobre los documentos, tipado contra los `*QueryResult`. Para `literary-work/` y `collection/` se **genera** con `pnpm corpus:generate`; no se edita a mano. Lo consumen los specs de repository y mapper.
- **Dominio** (`<slug>.<entidad>.mock.ts`): el agregado construido por su factory. Lo consume el frontend.

Antes de esta capa de documentos el flujo corría al revés: el raw se escribía a mano y los documentos se derivaban invirtiendo a mano la proyección de la query. El sentido actual evita esa inversión manual: la query real, evaluada con `groq-js`, es la única fuente de verdad de qué shape produce.

### El generador (`pnpm corpus:generate`)

`pnpm corpus:generate` → `node --import tsx ./scripts/generate-raw-corpus/generate-raw-corpus.ts`. Por cada obra y cada colección, evalúa la query GROQ real (`literaryWorkBySlugQuery`, `collectionBySlugQuery`, y `collectionsQuery` para el listado) con `groq-js` sobre `onoffDatasetMock` — el dataset plano de todos los documentos del corpus — y escribe el resultado en su fixture `*.raw.mock.ts`.

**Archivos generados (11):**

- Las 8 `literary-work/<slug>.literary-work.raw.mock.ts`.
- Las 2 `collection/<slug>.collection.raw.mock.ts`.
- `collection/collection-teasers.raw.mock.ts` (resultado de `collectionsQuery`, el listado).

Cada uno abre con un banner de dos líneas ("Este archivo lo escribe `pnpm corpus:generate`... No se edita a mano: cualquier cambio se pierde en la próxima corrida.") y está marcado `linguist-generated=true` en `.gitattributes` — enumerados uno por uno, no por glob `*.raw.mock.ts`, porque las fixtures de `story/` y `storylist/` se siguen escribiendo a mano.

**Qué impide que la generación mienta:** `src/mocks/onoff-documents.mock.spec.ts` vuelve a evaluar las mismas queries sobre los mismos documentos y compara **valores** (no bytes: el formato lo fija Prettier dentro del generador, así que un desvío de formato no es una desincronización, pero una diferencia de valor sí) contra las fixtures crudas commiteadas. Este spec corre dentro de `pnpm test` (gate `test`, ya required) — **no se agregó ningún gate de CI nuevo**.

**Un documento faltante no falla en silencio.** Si una referencia apunta a un `_id` que no está en el dataset, `groq-js` la resuelve a `null` sin lanzar — la fixture generada afirmaría ese `null`. El generador lo evita evaluando por adelantado (`scripts/generate-raw-corpus/generate-raw-corpus.helpers.ts`): recorre el dataset entero y exige que todo `_ref` resuelva a un documento, y **corta antes de generar nada** si encuentra una referencia colgada. Excluye los assets de imagen a propósito: ninguna query los dereferencia (proyectan el objeto entero y la URL la arma `urlFor` al renderizar, fuera de GROQ); el único `->` sobre un asset en todo el conjunto de queries es `audioFile.asset->url`. Exigirle documento a cada imagen del corpus obligaría a inventar contenido que nada lee.

**El generador carga el corpus con Vite programático, no con `tsx`** (`scripts/generate-raw-corpus/generate-raw-corpus.loader.ts`): los documentos importan prosa con el sufijo `?raw`, que solo resuelve un bundler. Usa `resolve.tsconfigPaths` nativo de Vite y no el plugin `vite-tsconfig-paths` — el mismo motivo que documenta `vitest.config.ts`: el plugin recorre las copias del repo bajo `.claude/worktrees/` y aborta si el tsconfig de alguna no le parsea.

**El emisor preserva los imports de prosa** (`scripts/generate-raw-corpus/generate-raw-corpus.emitter.ts`): su tabla de sustitución se indexa por el **valor serializado**, no por el tipo, así que una misma pasada reconoce tanto la prosa de un `.md` como el objeto entero de una etiqueta o del autor y los reemplaza por su import en vez de inlinearlos. Sin eso, cada obra generada duplicaría ~3 KB de prosa en git.

### Qué queda fuera de la generación

Hay dos clases de exclusión, y no son lo mismo:

| Qué                                           | Por qué queda afuera                                                                                                           | Clase                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| `story` (8 obras + teasers + nav teasers)     | Derivable — hay query top-level que las devuelve — pero el agregado está en baja                                               | Fuera por **scope**            |
| `storylist`                                   | Ídem: derivable, pero el agregado está en baja                                                                                 | Fuera por **scope**            |
| `onoff-raw-tags.mock.ts` (`RawTag`)           | Sub-proyección repetida en varias queries; ninguna la devuelve top-level                                                       | Fuera por **construcción**     |
| `onoff-raw-author.mock.ts` (`rawOnoffAuthor`) | `NonNullable<StoryBySlugQueryResult>['author']`; ninguna query lo devuelve top-level                                           | Fuera por **construcción**     |
| `ContentCampaign`                             | Sub-proyección de `landingPageContentQuery` (campo `campaigns`); exigiría montar una capa de documentos de landing page entera | Caso aparte, sin epic asignado |

**Fuera por scope:** existe una query top-level que las devuelve, así que serían derivables con el mismo generador — pero construirles una capa de documentos sería trabajo sobre agregados que están en baja, y no vale la pena.

**Fuera por construcción:** son sub-proyecciones que ninguna query devuelve como resultado top-level, así que ningún generador —presente o futuro— podría apuntarlas como target apuntando una query real. Por eso `document/support-documents.projection.ts` sigue yendo en la dirección **inversa** (documento ← raw) para tags, nacionalidad y tipo de recurso: son de esta segunda clase, y esa inversión manual es la única forma de tenerlos.

**`ContentCampaign`** no está en baja, pero tampoco es de ninguna de las dos clases anteriores: es sub-proyección de una query que hoy no tiene capa de documentos propia (`landingPageContentQuery`). Generarla exige primero esa capa, que queda para un issue propio.

> Las fichas Markdown por obra (metadata + reseña) que vivían en `tools/story-mocks/onoff/` se retiraron en #1653: los mocks TS de este directorio son ahora la fuente.

## Corpus de dominio: `Story`

Generado en [#1650](https://github.com/cuentoneta/cuentoneta/issues/1650); fuente histórica, sigue alimentando `Storylist` y las stories de `cover-image`.

- **Story completo:** `story/<slug>.story.mock.ts`, export `<slugCamelCase>StoryMock: Story` (cuerpo de 10–15 párrafos con itálicas/negritas).
- **Agregador:** `../onoff-stories.mock.ts` → `onoffStoriesMock: Story[]`.
- **Teasers derivados:** `../onoff-story-teasers.mock.ts` deriva con `toTeaser` (trunca el cuerpo a 3 párrafos, como el ACL con `body[0...3]`) → `<slugCamelCase>TeaserMock` + `onoffStoryTeasersMock`.
- **`_id`:** `'onoff-story-<slug>'`.

## Corpus de dominio: `LiteraryWork` (#1653)

Mismo elenco, coexistiendo con el corpus `Story`.

**Las dos carpetas no son independientes:** `literary-work/<slug>.literary-work.mock.ts` importa a su hermano de `story/` y deriva de él todo lo que las dos caras comparten —metadata, autor, portada, recursos y datos de publicación—, declarando por su cuenta solo lo propio de `LiteraryWork`. Es lo que evita que el mismo elenco cuente dos historias distintas sobre la misma obra. La relación existía desde antes, escondida por vivir las dos caras en un solo archivo; separarlas la volvió visible en vez de crearla.

Diferencias de origen del contenido:

- **Cuerpo (`bodyHtml`):** vive como Markdown plano en `literary-work/<slug>.md` (solo el cuerpo, sin metadata) y se importa con `?raw` de Vite. El mock corre `markdownToSanitizedHtml` (`@utils/markdown-pipeline.utils`) al cargar el módulo para obtener el `SanitizedHtml`; el `.md` es la fuente literal editable, y el documento (`<slug>.literary-work.document.ts`) importa el mismo archivo.
- **`readingTime`:** se **deriva** del propio cuerpo (`deriveSectionReadingTime`); `totalReadingTime` lo suma la factory. No se hardcodea.
- **Metadata** (título, slug, portada, autor, tags, publicación): literales TS en el mock, no en el `.md`.
- **Secciones:** una por obra (`position: 0`). La mayoría es prosa plana (sin `title` ni `epigraphs`), pero un subconjunto — `el-odio`, `el-palacio-de-las-nueve-fronteras`, `geometria` — lleva `title` (`SectionTitle`) + `epigraphs` para darle sustancia a los selectores por capacidad del canon (`onoffLiteraryWorksWithSectionTitles` / `onoffLiteraryWorksWithEpigraphs` en `onoff-literary-works.mock.ts`).
- **`epigraphs`:** cada obra que lleva uno lo declara como export nombrado (`<slugCamelCase>EpigraphMock`) y lo consume desde su propia sección, para que specs y stories puedan tomar un epígrafe concreto sin hand-authorear prosa. El conjunto de todos vive en `../onoff-literary-works.mock.ts` → `onoffLiteraryWorkEpigraphsMock`, **derivado** del corpus (no una lista en paralelo): quien necesita el shape `{ text, reference? }` (`AttributedText`) y no la obra que lo contiene lo toma de ahí.
- **Fuente compartida del título + epígrafe:** el título de sección y los textos crudos del epígrafe (el Markdown de `text` y `reference`) viven en un módulo neutral `literary-work/<slug>.epigraph.ts` (solo strings, sin dependencias). Del mismo módulo tiran el mock de dominio (envolviendo los strings con `createSectionTitle` / `createAttributedText` + `markdownToSanitizedHtml`), el documento (que los transporta crudos) y, por consiguiente, la fixture raw generada, que hereda el mismo import gracias al emisor del generador (ver [Las tres capas](#las-tres-capas)). Así las tres capas comparten una única fuente literal y no pueden divergir ([#2016](https://github.com/cuentoneta/cuentoneta/issues/2016)).
- **`mediaSources`:** `geometria` es la única obra con multimedia, y cubre los cuatro tipos que el dominio modela más un `pdfLink`, que el schema admite y el ACL descarta — el caso real de tipo no mapeado. Sus textos de descripción viven en el módulo neutral `media/<slug>.media.ts` (solo strings, misma convención que `<slug>.epigraph.ts`). El array crudo (`media/<slug>.media.raw.mock.ts`, export `geometriaRawMediaSources`) ya no se declara aparte: se **deriva** de la fixture generada de la cara de obra literaria (`geometriaRawLiteraryWork.mediaSources`), porque las dos proyecciones resuelven `audioUrl` igual y declararlas por separado las dejaría desincronizar sin aviso. Sostiene los selectores `onoffRawLiteraryWorksWithMediaSources`, `onoffLiteraryWorksWithMediaSources` y `onoffLiteraryWorkTeasersWithMediaSources`.
- **`editorialNote`:** vive como Markdown plano en `literary-work/<slug>.editorial-note.md`, importado con `?raw`, la misma convención que `<slug>.md` para el cuerpo. Su prosa está **derivada del `summary` del mock de `Story` homónimo** (no hand-authoreada). `neron` es la **excepción deliberada**: no tiene `literary-work/<slug>.editorial-note.md`, su documento y su mock de dominio omiten el campo (`null`) — es el fixture que sostiene el selector `onoffLiteraryWorksWithoutEditorialNote` y ejercita, extremo a extremo, la rama de una obra sin nota.

Archivos:

- **`LiteraryWork` completa:** `literary-work/<slug>.literary-work.mock.ts`, export `<slugCamelCase>LiteraryWorkMock: LiteraryWork` (vía `createLiteraryWork`).
- **Agregador:** `../onoff-literary-works.mock.ts` → `onoffLiteraryWorksMock: LiteraryWork[]`.
- **Teasers derivados:** `../onoff-literary-work-teasers.mock.ts` (`toTeaser`) → `<slugCamelCase>LiteraryWorkTeaserMock` + `onoffLiteraryWorkTeasersMock`.

## Corpus de dominio: `Author`

La biografía de François Onoff vive como Markdown plano en un único archivo, `author/francois-onoff.biography.md` (solo la prosa, sin metadata), importado con `?raw` — misma convención que `<slug>.editorial-note.md` para `LiteraryWork`. `../onoff-raw-author.mock.ts` (`rawOnoffAuthor.biography`) transporta ese Markdown crudo; `../author.mock.ts` deriva el `SanitizedHtml` corriendo `markdownToSanitizedHtml(createMarkdown(...))` sobre la misma fuente. Es el único archivo de biografía del corpus: el elenco modela un solo autor (Onoff), así que no hay un `<slug>.biography.md` por obra. `rawOnoffAuthorTeaser` no declara `biography`, en paridad con `AuthorTeaser` de dominio.

`rawOnoffAuthor` se sigue escribiendo a mano (ver [Qué queda fuera de la generación](#qué-queda-fuera-de-la-generación)): ninguna query lo devuelve top-level, así que no hay target posible para el generador. `author/author.document.projection.ts` deriva el **documento** del autor a partir de ese raw — la dirección inversa a la de `literary-work/` y `collection/`.

## Corpus de dominio: `Collection`

Corpus mínimo de dos colecciones de `LiteraryWork`, una por cada rama de `imagery`.

- **Descripciones:** Markdown plano por colección — `collection/<slug>.collection.md`, importados con `?raw` y saneados con `markdownToSanitizedHtml`, misma convención que `<slug>.editorial-note.md` de `LiteraryWork`.
- **Colecciones:** `../onoff-collections.mock.ts`, export `geometriasDelDesveloCollectionMock` (rama `representative`, con portada editorial propia) e `inventarioDeLasPasionesCollectionMock` (rama `sample`, sin portada propia) — ambas construidas vía `createCollection`.
- **Obras:** cada colección se cura con las obras que su propia prosa nombra —`geometria`/`losPeldanos`/`lasEscaleras` y `elTratadoDeLosPlaceres`/`elOdio`/`lasDosAntorchas`—, importadas del agregador por nombre. No cortar el agregador por índice: las dos colecciones quedarían indistinguibles por contenido.
- **Agregador:** `onoffCollectionsMock: Collection[]`.
- **Selectores por capacidad:** `onoffCollectionsWithRepresentativeImageryMock`, `onoffCollectionsWithSampleImageryMock` y `onoffCollectionsWithMediaSourcesMock`, derivados por predicado sobre el agregador.
- **Teasers derivados:** `toTeaser` (vacía `literaryWorks`) → `onoffCollectionTeasersMock: CollectionTeaser[]`.
- **Nada se escribe a mano:** las obras (`literaryWorks`), los tags y las tres portadas de la rama `sample` se **derivan** del canon existente — `onoffLiteraryWorkTeasersMock` y `onoff-tags.mock.ts` — en vez de hardcodearse.

## Corpus raw: `Story` / `Storylist` (shape de Sanity, escrito a mano)

Contraparte cruda del corpus de dominio `Story` — lo que devuelven las queries GROQ antes del ACL/mapper. La consume el backend (`src/api`). A diferencia de `literary-work/` y `collection/`, **no** hay capa de documentos para `Story`/`Storylist` (ver [Qué queda fuera de la generación](#qué-queda-fuera-de-la-generación)): estas fixtures se siguen escribiendo a mano.

- **Story raw:** `story/<slug>.story.raw.mock.ts`, export `<slugCamelCase>RawStory: NonNullable<StoryBySlugQueryResult>`.
- **Storylists raw:** `storylist/<slug>.storylist.raw.mock.ts` (p. ej. `geometrias-del-desvelo`).
- **Agregadores:** `../onoff-raw-stories.mock.ts` (`onoffRawStoriesMock`, teasers `<slugCamelCase>RawTeaser`, `onoffRawTeasersMock`, `onoffRawNavTeasersMock`); `../onoff-raw-author.mock.ts` (`rawOnoffAuthor`, `rawOnoffAuthorTeaser`); `../onoff-raw-tags.mock.ts` (`onoffRawTagsMock`).

## Corpus raw: `Collection` (generado)

`../onoff-raw-collections.mock.ts` consolida las fixtures generadas de `collection/<slug>.collection.raw.mock.ts` (`onoffRawCollectionsMock`) y el listado generado `collection/collection-teasers.raw.mock.ts` (`onoffRawCollectionTeasersMock`, resultado real de `collectionsQuery`, ya ordenado como en producción) y deriva de ahí los selectores por capacidad y los escenarios de borde por `spread` sobre el canon generado.

## Corpus raw: `LiteraryWork` (generado, #1981)

Contraparte cruda del corpus de dominio `LiteraryWork`, tipada contra `NonNullable<LiteraryWorkBySlugQueryResult>`. Alimenta los tests de la capa de datos de `LiteraryWork` (mapper/repository/service). Cada `literary-work/<slug>.literary-work.raw.mock.ts` lo escribe `pnpm corpus:generate` evaluando `literaryWorkBySlugQuery` sobre `literary-work/<slug>.literary-work.document.ts` (ver [Las tres capas](#las-tres-capas)) — no se edita a mano.

- **Agregador:** `../onoff-raw-literary-works.mock.ts` → `onoffRawLiteraryWorksMock` (las 8, en el mismo orden que `onoffLiteraryWorksMock`).
- **Selector por capacidad:** `onoffRawLiteraryWorksWithEpigraphs` (contraparte cruda de `onoffLiteraryWorksWithEpigraphs`), derivado por predicado — las obras crudas con epígrafes, para ejercitar el mapeo raw→dominio del epígrafe sin conocer un slug concreto.
- **Escenarios de borde** (overrides `{ ...base, … }` sobre las obras canónicas generadas), para ejercitar el mapper y la materialización sin depender del contenido base:
  - `multiSectionRawLiteraryWork` — obra multi-sección (`sectionCount > 1`). Los strings de su segunda sección viven en `literary-work/el-palacio-de-las-nueve-fronteras.multi-section.ts`, compartidos con el escenario homónimo de la capa de documentos (`onoff-documents.mock.ts`), para que las dos no puedan divergir.
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
