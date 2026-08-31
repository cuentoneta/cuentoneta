# Corpus de mocks — obras de François Onoff

> **Datos ficticios.** Autor y obras pertenecen al personaje "Onoff" del film _Una pura formalità_ (G. Tornatore, 1994). Ninguna de estas obras existe. Las citas entrecomilladas provienen de los diálogos del film; el resto (fechas, editorial, sinopsis) es invención coherente con su universo.

Este directorio (`src/mocks/onoff/`) es la **única ubicación** del corpus de las 8 obras de François Onoff, accesible por frontend y backend vía el alias `@mocks/onoff`. Conviven acá tres capas del mismo elenco:

- **Documentos** (los consume `groq-js`): `<slug>.<entidad>.document.ts` — lo que Sanity guarda tal cual. Es la **única capa escrita a mano**.
- **Fixtures raw** (las consume el backend): `<slug>.<entidad>.raw.mock.ts`, tipadas contra los `*QueryResult` de `@sanity-types` (los tipos generados de Sanity, promovidos al kernel). Se **generan**, no se editan (ver [Las tres capas](#las-tres-capas)).
- **Mocks de dominio** (los consume el frontend): `<slug>.<entidad>.mock.ts`.

## Cómo está organizado

Las piezas se agrupan **por entidad**, una carpeta cada una, salvo cuando dos entidades no se pueden montar por separado: `landing-page/` lleva la landing, el contenido rotativo y las campañas juntos porque ninguno de los otros dos tiene query propia con su propia carpeta que valga la pena — la campaña es sub-proyección de la de landing, y el contenido rotativo comparte pantalla con la landing aunque tenga su propio documento y su propia query. `document/` y `media/` agrupan por concern por el mismo motivo. Los mocks y fixtures conservan igualmente el infijo de entidad en el nombre, así que siguen siendo unívocos fuera de contexto; la prosa no lo lleva, porque su extensión ya la distingue:

```
onoff/
├── literary-work/  <slug>.literary-work.document.ts · <slug>.literary-work.raw.mock.ts (generado)
│                   <slug>.literary-work.mock.ts + su prosa: <slug>.md · <slug>.editorial-note.md · <slug>.epigraph.ts
├── collection/     <slug>.collection.document.ts · <slug>.collection.raw.mock.ts (generado) · <slug>.collection.md
├── landing-page/   onoff.landing-page.document.ts · <slug>.content-campaign.document.ts
│                   onoff.rotating-content.document.ts
│                   landing-page.raw.mock.ts · rotating-content.raw.mock.ts (generados)
├── author/         francois-onoff.biography.md · author.document.projection.ts
├── media/          <slug>.media.ts · <slug>.media.mock.ts · <slug>.media.raw.mock.ts
└── document/       la factory de campos de sistema y los documentos de soporte
```

**Los agregadores no viven acá:** están un nivel arriba, en `src/mocks/`, y son lo que el resto del repo importa. Una regla de ESLint prohíbe importar una pieza puntual desde fuera de `src/mocks/**`. Por eso la tabla de assets de imagen (`../onoff-image-assets.mock.ts`, ver [Imágenes](#imágenes-el-puente-a-los-assets-locales)) también vive arriba: la consume un spec de `src/api/`.

## Las tres capas

```
documentos (a mano)  →  (groq-js, query real)  →  raw (generado)  →  (ACL del repository)  →  dominio
```

- **Documentos** (`<slug>.<entidad>.document.ts`): lo que vive en el content lake. Es la única capa escrita a mano.
- **Raw** (`<slug>.<entidad>.raw.mock.ts`): el resultado de evaluar la query GROQ real sobre los documentos, tipado contra los `*QueryResult`. Se **genera** con `pnpm corpus:generate`; no se edita a mano. Lo consumen los specs de repository y mapper.
- **Dominio** (`<slug>.<entidad>.mock.ts`): el agregado construido por su factory. Lo consume el frontend.

Antes de esta capa de documentos el flujo corría al revés: el raw se escribía a mano y los documentos se derivaban invirtiendo a mano la proyección de la query. El sentido actual evita esa inversión manual: la query real, evaluada con `groq-js`, es la única fuente de verdad de qué shape produce.

### El generador (`pnpm corpus:generate`)

`pnpm corpus:generate` → `node --import tsx ./scripts/generate-raw-corpus/generate-raw-corpus.ts`. Por cada obra, cada colección, la página de inicio y el contenido rotativo, evalúa la query GROQ real (`literaryWorkBySlugQuery`, `collectionBySlugQuery`, `collectionsQuery` para el listado, `landingPageContentQuery` para la landing —que va con su semana como parámetro— y `rotatingContentQuery` para lo más leído) con `groq-js` sobre `onoffDatasetMock` — el dataset plano de todos los documentos del corpus — y escribe el resultado en su fixture `*.raw.mock.ts`.

**Archivos generados (13):**

- Las 8 `literary-work/<slug>.literary-work.raw.mock.ts`.
- Las 2 `collection/<slug>.collection.raw.mock.ts`.
- `collection/collection-teasers.raw.mock.ts` (resultado de `collectionsQuery`, el listado).
- `landing-page/landing-page.raw.mock.ts` (resultado de `landingPageContentQuery`).
- `landing-page/rotating-content.raw.mock.ts` (resultado de `rotatingContentQuery`, lo más leído).

Cada uno abre con un banner de dos líneas ("Este archivo lo escribe `pnpm corpus:generate`... No se edita a mano: cualquier cambio se pierde en la próxima corrida.") y está marcado `linguist-generated=true` en `.gitattributes`.

**Qué impide que la generación mienta:** `src/mocks/onoff-documents.mock.spec.ts` vuelve a evaluar las mismas queries sobre los mismos documentos y compara **valores** (no bytes: el formato lo fija Prettier dentro del generador, así que un desvío de formato no es una desincronización, pero una diferencia de valor sí) contra las fixtures crudas commiteadas. Este spec corre dentro de `pnpm test` (gate `test`, ya required) — **no se agregó ningún gate de CI nuevo**.

**Un documento faltante no falla en silencio.** Si una referencia apunta a un `_id` que no está en el dataset, `groq-js` la resuelve a `null` sin lanzar — la fixture generada afirmaría ese `null`. El generador lo evita evaluando por adelantado (`scripts/generate-raw-corpus/generate-raw-corpus.helpers.ts`): recorre el dataset entero y exige que todo `_ref` resuelva a un documento, y **corta antes de generar nada** si encuentra una referencia colgada. Excluye los assets de imagen a propósito: ninguna query los dereferencia (proyectan el objeto entero y la URL la arma `urlFor` al renderizar, fuera de GROQ); el único `->` sobre un asset en todo el conjunto de queries es `audioFile.asset->url`. Exigirle documento a cada imagen del corpus obligaría a inventar contenido que nada lee.

**El generador carga el corpus con Vite programático, no con `tsx`** (`scripts/generate-raw-corpus/generate-raw-corpus.loader.ts`): los documentos importan prosa con el sufijo `?raw`, que solo resuelve un bundler. Usa `resolve.tsconfigPaths` nativo de Vite y no el plugin `vite-tsconfig-paths` — el mismo motivo que documenta `vitest.config.ts`: el plugin recorre las copias del repo bajo `.claude/worktrees/` y aborta si el tsconfig de alguna no le parsea.

**El emisor preserva los imports de prosa** (`scripts/generate-raw-corpus/generate-raw-corpus.emitter.ts`): su tabla de sustitución se indexa por el **valor serializado**, no por el tipo, así que una misma pasada reconoce tanto la prosa de un `.md` como el objeto entero de una etiqueta o del autor y los reemplaza por su import en vez de inlinearlos. Sin eso, cada obra generada duplicaría ~3 KB de prosa en git.

**La contracara: una proyección que transforma la prosa deja de ser reconocible.** El extracto de las obras de una colección se recorta en la query, así que el valor que emite ya no coincide con el archivo `.md` y la tabla no puede sustituirlo por su import: las fixtures de colección **inlinean** ese fragmento. Es la consecuencia buscada: el emisor indexa por valor y no conoce las heurísticas de las queries que evalúa.

**El recorte no acota por longitud, y eso importa acá.** Corta por el primer doble salto de línea, así que una obra cuya sección de apertura no lo tenga —un texto de un solo bloque— produce un "extracto" que es el cuerpo entero, y la fixture lo inlinea completo. En el dataset de producción son 28 de 444 obras. El ahorro es grande en agregado, pero no es una garantía por obra.

### Qué queda fuera de la generación

Las exclusiones no son todas de la misma naturaleza, y la diferencia importa: algunas son permanentes y otras solo describen hasta dónde llegó la generación.

| Qué                                           | Por qué queda afuera                                                                        | Clase                      |
| --------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------- |
| `onoff-raw-tags.mock.ts` (`RawTag`)           | Sub-proyección repetida en varias queries; ninguna la devuelve top-level                    | Fuera por **construcción** |
| `onoff-raw-author.mock.ts` (`rawOnoffAuthor`) | Tipado contra el autor **embebido** en la obra; ese shape no lo devuelve ninguna query sola | **Todavía no**             |

**Fuera por construcción:** son sub-proyecciones que ninguna query devuelve como resultado top-level, así que ningún generador —presente o futuro— podría apuntarlas como target apuntando una query real. Por eso `document/support-documents.projection.ts` sigue yendo en la dirección **inversa** (documento ← raw) para tags, nacionalidad y tipo de recurso: son de esta segunda clase, y esa inversión manual es la única forma de tenerlos.

**Todavía no:** el autor **sí** es derivable —tiene queries top-level (`authorBySlugQuery`, `authorsQuery`) y su documento ya está en el dataset—, pero el shape que hoy declara `rawOnoffAuthor` es el del autor embebido en la obra, que ninguna query devuelve sola. Generarlo exige apuntar a la query de autor y aceptar el shape que esa devuelve. Es trabajo pendiente, no un imposible: la única exclusión de esta tabla que puede desaparecer sin cambiar nada del diseño.

Una sub-proyección **sí** puede generarse cuando su query tiene capa de documentos: es lo que pasa con `ContentCampaign`, que se deriva del resultado generado de la landing page (ver [Corpus raw: página de inicio](#corpus-raw-página-de-inicio-contenido-rotativo-y-contentcampaign-generado)). Lo que la vuelve inderivable no es ser sub-proyección, sino que ninguna query la devuelva.

Los mocks TS de este directorio son la fuente única del corpus: no hay fichas de otro formato ni ubicación paralela con la que puedan desincronizarse.

## Corpus de dominio: `LiteraryWork` (#1653)

Elenco de las 8 obras de François Onoff.

Origen del contenido:

- **Cuerpo (`bodyHtml`):** vive como Markdown plano en `literary-work/<slug>.md` (solo el cuerpo, sin metadata) y se importa con `?raw` de Vite. El mock corre `markdownToSanitizedHtml` (`@utils/markdown-pipeline.utils`) al cargar el módulo para obtener el `SanitizedHtml`; el `.md` es la fuente literal editable, y el documento (`<slug>.literary-work.document.ts`) importa el mismo archivo.
- **`readingTime`:** se **deriva** del propio cuerpo (`deriveSectionReadingTime`); `totalReadingTime` lo suma la factory. No se hardcodea.
- **Metadata** (título, slug, portada, autor, tags, publicación): literales TS en el mock.
- **Secciones:** una por obra (`position: 0`). La mayoría es prosa plana (sin `title` ni `epigraphs`), pero un subconjunto — `el-odio`, `el-palacio-de-las-nueve-fronteras`, `geometria` — lleva `title` (`SectionTitle`) + `epigraphs` para darle sustancia a los selectores por capacidad del canon (`onoffLiteraryWorksWithSectionTitles` / `onoffLiteraryWorksWithEpigraphs` en `onoff-literary-works.mock.ts`).
- **Citas dentro del cuerpo:** `el-palacio-de-las-nueve-fronteras` transcribe un bando en su primera frontera, escrito como cita de Markdown. Es la construcción que el Portable Text original marcaba con alineación centrada y que el corpus no tenía: sin ella no hay dónde afirmar su tratamiento tipográfico. Sostiene el selector `onoffLiteraryWorksWithBlockquotes`, derivado por predicado sobre el `bodyHtml`.
- **`epigraphs`:** cada obra que lleva uno lo declara como export nombrado (`<slugCamelCase>EpigraphMock`) y lo consume desde su propia sección, para que specs y stories puedan tomar un epígrafe concreto sin hand-authorear prosa. El conjunto de todos vive en `../onoff-literary-works.mock.ts` → `onoffLiteraryWorkEpigraphsMock`, **derivado** del corpus (no una lista en paralelo): quien necesita el shape `{ text, reference? }` (`AttributedText`) y no la obra que lo contiene lo toma de ahí.
- **Fuente compartida del título + epígrafe:** el título de sección y los textos crudos del epígrafe (el Markdown de `text` y `reference`) viven en un módulo neutral `literary-work/<slug>.epigraph.ts` (solo strings, sin dependencias). Del mismo módulo tiran el mock de dominio (envolviendo los strings con `createSectionTitle` / `createAttributedText` + `markdownToSanitizedHtml`), el documento (que los transporta crudos) y, por consiguiente, la fixture raw generada, que hereda el mismo import gracias al emisor del generador (ver [Las tres capas](#las-tres-capas)). Así las tres capas comparten una única fuente literal y no pueden divergir ([#2016](https://github.com/cuentoneta/cuentoneta/issues/2016)).
- **`mediaSources`:** dos obras traen multimedia, y la diferencia entre ellas es la que le importa a quien ofrece elegir formato. `geometria` cubre los cuatro tipos que el dominio modela más un `pdfLink`, que el schema admite y el ACL descarta — el caso real de tipo no mapeado; `las-escaleras` trae **un solo** medio, el contracaso donde no hay entre qué elegir. Los separan los selectores `onoffLiteraryWorksWithSingleMediaSource` y `onoffLiteraryWorksWithMultipleMediaSources`. Sus textos de descripción viven en el módulo neutral `media/<slug>.media.ts` (solo strings, misma convención que `<slug>.epigraph.ts`). El array crudo (`media/<slug>.media.raw.mock.ts`, export `geometriaRawMediaSources`) ya no se declara aparte: se **deriva** de la fixture generada de la cara de obra literaria (`geometriaRawLiteraryWork.mediaSources`), porque las dos proyecciones resuelven `audioUrl` igual y declararlas por separado las dejaría desincronizar sin aviso. Sostiene los selectores `onoffRawLiteraryWorksWithMediaSources`, `onoffLiteraryWorksWithMediaSources` y `onoffLiteraryWorkTeasersWithMediaSources`.
- **`editorialNote`:** vive como Markdown plano en `literary-work/<slug>.editorial-note.md`, importado con `?raw`, la misma convención que `<slug>.md` para el cuerpo. `neron` es la **excepción deliberada**: no tiene `literary-work/<slug>.editorial-note.md`, su documento y su mock de dominio omiten el campo (`null`) — es el fixture que sostiene el selector `onoffLiteraryWorksWithoutEditorialNote` y ejercita, extremo a extremo, la rama de una obra sin nota.

Archivos:

- **`LiteraryWork` completa:** `literary-work/<slug>.literary-work.mock.ts`, export `<slugCamelCase>LiteraryWorkMock: LiteraryWork` (vía `createLiteraryWork`).
- **Agregador:** `../onoff-literary-works.mock.ts` → `onoffLiteraryWorksMock: LiteraryWork[]`.
- **Teasers derivados:** `../onoff-literary-work-teasers.mock.ts` (`toTeaser`) → `<slugCamelCase>LiteraryWorkTeaserMock` + `onoffLiteraryWorkTeasersMock`.

## Corpus de dominio: `Author`

La biografía de François Onoff vive como Markdown plano en un único archivo, `author/francois-onoff.biography.md` (solo la prosa, sin metadata), importado con `?raw` — misma convención que `<slug>.editorial-note.md` para `LiteraryWork`. `../onoff-raw-author.mock.ts` (`rawOnoffAuthor.biography`) transporta ese Markdown crudo; `../author.mock.ts` deriva el `SanitizedHtml` corriendo `markdownToSanitizedHtml(createMarkdown(...))` sobre la misma fuente. Es el único archivo de biografía del corpus: el elenco modela un solo autor (Onoff), así que no hay un `<slug>.biography.md` por obra. `rawOnoffAuthorTeaser` no declara `biography`, en paridad con `AuthorTeaser` de dominio.

`rawOnoffAuthor` se sigue escribiendo a mano, pero **no porque sea inderivable**: el autor tiene queries top-level (`authorBySlugQuery` y `authorsQuery`) y su documento ya está en el dataset, así que podría tener su raw generado como cualquier otra entidad. Lo que no devuelve ninguna query sola es el shape que este archivo declara —el autor tal como lo **embebe** la obra—, y por eso quedó fuera de la primera pasada de generación. `author/author.document.projection.ts` deriva mientras tanto el **documento** a partir del raw, la dirección inversa a la de `literary-work/` y `collection/`.

El autor embebido sí está anclado, aunque su raw sea a mano: las fixtures generadas de obra lo importan en vez de inlinearlo, así que el gate de frescura lo compara contra lo que la query devuelve, y el cruce contra el ACL lo compara entero. Lo que queda sin anclar es el autor de la **ficha** y el del **listado**, que no tienen cruce.

## Corpus de dominio: `Collection`

Corpus mínimo de dos colecciones de `LiteraryWork`, una por cada rama de `imagery`.

- **Descripciones:** Markdown plano por colección — `collection/<slug>.collection.md`, importados con `?raw` y saneados con `markdownToSanitizedHtml`, misma convención que `<slug>.editorial-note.md` de `LiteraryWork`.
- **Colecciones:** `../onoff-collections.mock.ts`, export `geometriasDelDesveloCollectionMock` (rama `representative`, con portada editorial propia) e `inventarioDeLasPasionesCollectionMock` (rama `sample`, sin portada propia) — ambas construidas vía `createCollection`.
- **Obras:** cada colección se cura con las obras que su propia prosa nombra —`geometria`/`losPeldanos`/`lasEscaleras` y `elTratadoDeLosPlaceres`/`elOdio`/`lasDosAntorchas`—, importadas del agregador por nombre. No cortar el agregador por índice: las dos colecciones quedarían indistinguibles por contenido.
- **Agregador:** `onoffCollectionsMock: Collection[]`.
- **Selectores por capacidad:** `onoffCollectionsWithRepresentativeImageryMock`, `onoffCollectionsWithSampleImageryMock` y `onoffCollectionsWithMediaSourcesMock`, derivados por predicado sobre el agregador.
- **Teasers derivados:** `toTeaser` (vacía `literaryWorks`) → `onoffCollectionTeasersMock: CollectionTeaser[]`.
- **Nada se escribe a mano:** las obras (`literaryWorks`), los tags y las tres portadas de la rama `sample` se **derivan** del canon existente — `onoffLiteraryWorkTeasersMock` y `onoff-tags.mock.ts` — en vez de hardcodearse.

## Corpus raw: `Collection` (generado)

`../onoff-raw-collections.mock.ts` consolida las fixtures generadas de `collection/<slug>.collection.raw.mock.ts` (`onoffRawCollectionsMock`) y el listado generado `collection/collection-teasers.raw.mock.ts` (`onoffRawCollectionTeasersMock`, resultado real de `collectionsQuery`, ya ordenado como en producción) y deriva de ahí los selectores por capacidad y los escenarios de borde por `spread` sobre el canon generado.

## Corpus raw: `LiteraryWork` (generado, #1981)

Contraparte cruda del corpus de dominio `LiteraryWork`, tipada contra `NonNullable<LiteraryWorkBySlugQueryResult>`. Alimenta los tests de la capa de datos de `LiteraryWork` (mapper/repository/service). Cada `literary-work/<slug>.literary-work.raw.mock.ts` lo escribe `pnpm corpus:generate` evaluando `literaryWorkBySlugQuery` sobre `literary-work/<slug>.literary-work.document.ts` (ver [Las tres capas](#las-tres-capas)) — no se edita a mano.

- **Agregador:** `../onoff-raw-literary-works.mock.ts` → `onoffRawLiteraryWorksMock` (las 8, en el mismo orden que `onoffLiteraryWorksMock`).
- **Selector por capacidad:** `onoffRawLiteraryWorksWithEpigraphs` (contraparte cruda de `onoffLiteraryWorksWithEpigraphs`), derivado por predicado — las obras crudas con epígrafes, para ejercitar el mapeo raw→dominio del epígrafe sin conocer un slug concreto.
- **Escenarios de borde** (overrides `{ ...base, … }` sobre las obras canónicas generadas), para ejercitar el mapper y la materialización sin depender del contenido base:
  - `multiSectionRawLiteraryWork` — obra multi-sección (`sectionCount > 1`). Los strings de su segunda sección viven en `literary-work/el-palacio-de-las-nueve-fronteras.multi-section.ts`, compartidos con el escenario homónimo de la capa de documentos (`onoff-documents.mock.ts`), para que las dos no puedan divergir.
  - `unmaterializedRawLiteraryWork` — `totalReadingTime` y `content[].readingTime` en `null` (ejercita el fallback puro de lectura del repository y el backfill, que es el único que persiste).
- **Autor raw:** `rawOnoffAuthor`.

## Corpus raw: página de inicio, contenido rotativo y `ContentCampaign` (generado)

`landing-page/landing-page.raw.mock.ts` (`onoffRawLandingPageMock`) es el resultado de `landingPageContentQuery` sobre la capa de documentos de `landing-page/`: un documento de landing y los dos de campaña que referencia. La semana de la landing —su `config` y su `slug`— es la del timestamp de sistema del corpus, para que el elenco siga hablando de un solo momento; el target del generador **la lee del documento** en vez de declararla por su cuenta, porque es el parámetro de entrada de la query y no una de las capas que los cruces comparan.

El documento de landing es el único que no lleva su slug en el nombre del archivo (`onoff.landing-page.document.ts`): su slug es una semana, y nombrarlo así obligaría a renombrar el archivo cada vez que el corpus se moviera de fecha.

**La landing declara `collections` y `latestLiteraryWorks`.** Referencian `collection` y `literaryWork`, que están en el dataset; `landingPageContentQuery` proyecta exactamente esos campos, y la fixture generada los transporta tal cual.

**Se genera el resultado entero de la query, no solo `campaigns`.** Un archivo generado afirma "esto es lo que la query devuelve", y recortar obligaría al gate de frescura a replicar el mismo recorte para poder comparar: la transformación quedaría afirmada por sí misma.

- **Agregador:** `../onoff-raw-landing-page.mock.ts`, que expone `onoffRawLandingPageMock` —el generado alcanzable desde afuera de `src/mocks/`— y `onoffRawContentCampaignsMock`, derivado de `….campaigns` (mismo patrón que `geometriaRawMediaSources` derivando de la cara de obra). La campaña no tiene agregador propio por el mismo motivo por el que no tiene carpeta propia: sin query propia, un módulo aparte sacaría su valor entero de este. Vive un nivel arriba porque lo importan specs de `src/api/`, desde donde la regla de ESLint prohíbe alcanzar `@mocks/onoff/**`; y declara consts propias en vez de re-exportar, que la prohibición de barrels rechaza.
- **Cruce contra el ACL:** `../onoff-content-campaigns.acl-alignment.spec.ts`. El corpus de dominio (`../content-campaign.mock.ts`) se sigue escribiendo a mano en vez de derivarse del mapper: derivarlo lo volvería una tautología del ACL y ninguna regresión del mapeo se notaría en sus consumidores.
- **Los literales de `title`, `slug` y `url` se duplican a propósito** entre el documento y el mock de dominio. Compartirlos por un módulo neutral dejaría al cruce sin filo: una fuente única mueve las dos capas a la vez y la comparación no podría fallar nunca. La prosa larga sí se comparte; las imágenes también, pero por sus dos caras (`ref` y `path`), que no son el mismo valor.

**Contenido rotativo:** `landing-page/rotating-content.raw.mock.ts` (`onoffRawRotatingContentMock`) es el resultado de `rotatingContentQuery` sobre `landing-page/onoff.rotating-content.document.ts` — otro documento y otra query, aunque las dos alimenten la misma pantalla que la landing. Referencia dos obras (`el-odio`, `las-escaleras`) **distintas** de las que la landing destaca como novedades: compartir el elenco entre los dos slots volvería indistinguible, en el cruce contra el ACL, un mapeo que los confundiera. Tiene agregador propio en `../onoff-raw-landing-page.mock.ts` (`onoffRawRotatingContentMock`, re-exportado) en vez de vivir como sub-proyección de la landing, porque es la contraparte cruda de un documento y una query independientes.

## Imágenes: el puente a los assets locales

Las referencias de imagen del corpus no apuntan a ningún asset de Sanity: son inventadas, y ninguna query las dereferencia. Lo que sí existe es el archivo local, servido por la app y por Storybook. **La tabla `../onoff-image-assets.mock.ts` (`onoffImageAssets`) es lo que une las dos puntas**: una entrada por asset, con la referencia que declara la capa de documentos y la ruta que declara el corpus de dominio.

```
documento  →  onoffImageAssets.<clave>.ref        dominio  →  onoffImageAssets.<clave>.path
```

Nadie escribe una referencia ni una ruta a mano: las dos caras salen de la misma entrada, así que no pueden divergir por edición. La tabla vive **un nivel arriba**, junto a los agregadores, porque también la consume `src/api/` (ver [Cómo está organizado](#cómo-está-organizado)).

**Formato de la referencia:** `image-<camelCase>-<ancho>x<alto>-<ext>`.

- **camelCase, no el slug.** El parser de `_ref` de `@sanity/image-url` corta por guiones y exige exactamente cuatro segmentos: un identificador como `francois-onoff` no produce una URL, lanza `Malformed asset _ref`.
- **El identificador repite la clave de la tabla**, para que la entrada no pueda quedar nombrada por un asset y apuntar a otro.
- **Las dimensiones y la extensión describen el archivo real**, medidas de su cabecera. No son relleno: son parte de la URL que arma el builder, así que una que miente se vuelve una URL rota apenas algo dereferencie la referencia.
- **Una entrada por archivo.** La clave de la tabla nombra el archivo, no a quien lo usa: dos consumidores de la misma imagen comparten entrada. Los dos viewports de un banner de campaña, en cambio, son archivos distintos y llevan entrada cada uno.
- **Excepción: los banners de campaña llevan identificador hexadecimal.** El Studio valida ese campo con un patrón que solo admite hexadecimal (`decodeAssetId` en `cms/utils/content-campaign-image.ts`, que lanza ante cualquier otra forma), así que un identificador legible modelaría algo que el CMS rechazaría. Ahí la legibilidad vive en la clave de la tabla.

`../onoff-image-assets.mock.spec.ts` lo hace cumplir en cinco frentes: que el archivo exista, que la referencia parsee con el builder real, que el identificador corresponda a su clave, que no mienta sobre las dimensiones ni la extensión, y que **ninguna referencia de imagen del corpus quede fuera de la tabla** — con las fuentes enumeradas una por una, obras y colecciones y autor y campañas.

**Qué habilita.** Que las dos capas resuelvan la misma imagen es lo que permite que los tres cruces del corpus de dominio contra el ACL (`../onoff-literary-works.acl-alignment.spec.ts`, `../onoff-collections.acl-alignment.spec.ts` y `../onoff-content-campaigns.acl-alignment.spec.ts`) sean **totales**: esos specs sustituyen el builder de imágenes por un resolutor sobre esta tabla y no excluyen ningún campo. El de campañas encadena además `auto()` en el doble, porque su mapeo resuelve las imágenes con formato automático.

**Qué no habilita.** La guarda de referencias colgadas del generador sigue excluyendo los assets de imagen (ver [Las tres capas](#las-tres-capas)). Esa guarda exige que todo `_ref` resuelva a un documento del dataset, y la tabla no crea documentos `sanity.imageAsset` — son problemas distintos, y el de la guarda no vale la pena resolver mientras ninguna query dereferencie imágenes.

### Convención de portadas

- **Directorio:** `src/assets/img/mocks/stories/`
- **Nombre:** `<slug>.png` (la misma cadena que el campo `slug` del mock)
- **Path en el mock:** `assets/img/mocks/stories/<slug>.png` (sin `./` ni `/` inicial), declarado por la tabla
- **Aspecto:** portrait 3:4 (referencia 118×164 del `CoverImageComponent`)

El resto de los assets del corpus vive junto a estas portadas, todos bajo `src/assets/img/mocks/`: `author/` (retrato), `collections/` (portadas editoriales), `media/` (el avatar del host de una grabación) y `banners/` (campañas, un archivo por viewport).

**Las banderas son la excepción, y no son del corpus.** El set completo por código ISO vive en `public/flags/`, que la app publica en la raíz: es un recurso general, no una fixture, y ponerlo bajo `mocks/` lo habría etiquetado como lo que no es. Por eso su entrada en la tabla es la única cuya ruta no empieza con `assets/` — el prefijo es lo que distingue las dos raíces publicadas, y de eso depende que el spec sepa dónde buscar el archivo en disco.

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
