# LiteraryWork — Diseño y contratos cerrados

> **Origen:** entregable del Slice 0 del epic [#1481](https://github.com/cuentoneta/cuentoneta/issues/1481) (issue [#1852](https://github.com/cuentoneta/cuentoneta/issues/1852)). Este documento **cierra los contratos** del módulo `LiteraryWork` para que los slices siguientes (walking skeleton [#1853](https://github.com/cuentoneta/cuentoneta/issues/1853) en adelante) los implementen sin rediseñar. El prototipo descartable que validó los riesgos vive en la rama `spike/1481-literarywork-schema` (PR draft #1859, no mergeable).

---

## Índice

1. [Contexto y decisiones heredadas](#1-contexto-y-decisiones-heredadas)
2. [Modelo de dominio y vistas polimórficas](#2-modelo-de-dominio-y-vistas-polimórficas)
3. [Shape de sección](#3-shape-de-sección)
4. [Value objects](#4-value-objects)
5. [Helper de reading time](#5-helper-de-reading-time)
6. [Repository: puerto, adaptador y doble](#6-repository-puerto-adaptador-y-doble)
7. [Contrato del endpoint](#7-contrato-del-endpoint)
8. [Estrategia de caché de borde](#8-estrategia-de-caché-de-borde)
9. [Allow-list de sanitización](#9-allow-list-de-sanitización)
10. [Autoría y obra anónima](#10-autoría-y-obra-anónima)
11. [Corte de #1852 vs. Slice 1 (#1853)](#11-corte-de-1852-vs-slice-1-1853)

---

## 1. Contexto y decisiones heredadas

Decisiones cerradas en la planificación del epic #1481 — **no se reabren**:

| Decisión              | Detalle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entidad paralela      | `LiteraryWork` no toca `Story` ni acopla su vocabulario: contrato limpio, **sin supertipo compartido**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Contenido             | Array de **secciones**; el teaser expone la **primera sección**. La navegación multi-sección en UI se difiere (Slice 2). El endpoint de lectura ([§7](#7-contrato-del-endpoint)) expone únicamente la **obra completa por slug** (`fetchBySlug`); la lectura de una sección puntual se difiere hasta que exista un caso de uso concreto — en la migración Story → LiteraryWork todo el texto ocupa `content[0]`, así que hoy no hay consumidor.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Pipeline de contenido | Markdown → HTML **saneado server-side** vía `unified` (`remark-parse → remark-rehype → rehype-sanitize → rehype-stringify`); el cliente solo hace `bypassSecurityTrustHtml` + `[innerHTML]`. Ningún markdown crudo cruza al frontend.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Ruta                  | `/read/:slug`, self-canonical 200 (sin redirect), un documento SSR indexable.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Repository            | Puerto + adaptador + doble (ver [§6](#6-repository-puerto-adaptador-y-doble)).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Reading time          | **Persistido write-once**: `readingTime` por sección (`section.readingTime`) y `totalReadingTime` en el documento `literaryWork` — el texto de la obra es inmutable una vez creada, no hace falta recalcular en lectura. Poblado por un **script de backfill on-demand/cron** ([#1959](https://github.com/cuentoneta/cuentoneta/issues/1959)), única vía de persistencia; la lectura (`fetchBySlug`) deriva un **fallback puro, sin persistir**, cuando el campo todavía viene vacío (ver [§5](#5-helper-de-reading-time)). **Decisión actualizada:** la Opción B de [#1953](https://github.com/cuentoneta/cuentoneta/issues/1953) (materialización self-healing en la primera lectura del backend) queda **superseded** por el script — se prefirió simplicidad: sin patch en un endpoint público, sin estado de coalescing en el adaptador. La caché de borde de [§8](#8-estrategia-de-caché-de-borde) es una capa aparte, sobre la respuesta ya renderizada: no depende de este campo ni lo materializa. |
| Imágenes              | Assets de Sanity. La URL de `cdn.sanity.io` codifica dimensiones (`assetId-WxH`) → CLS recuperable vía rewrite en un plugin `rehype` (ver [§9](#9-allow-list-de-sanitización)).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

Hallazgos del prototipo (validados, rama `spike/1481-literarywork-schema`):

- `sanity-plugin-markdown@^9.0.6` es compatible con Sanity v5; `sanity build` (gate `studio-build`) verde, incluso en Node 26.
- El tipo `markdown` se almacena como `string` crudo → en la frontera se valida como `Markdown` y el ACL produce `SanitizedHtml`.
- El hallazgo del spike "typegen tipa todo `optional`" aplicaba a una extracción **sin** `--enforce-required-fields`; el target `extract-schema` del repo (`cms/project.json`) extrae **con** ese flag, así que los campos con `Rule.required()` sí se tipan como no opcionales en `types.ts`. Las invariantes se hacen cumplir **igualmente** en el mapper/dominio: el flag garantiza el tipo, no los datos en runtime (documentos legacy o drafts pueden violar el schema), y las proyecciones GROQ parciales tienen sus propios shapes.
- Autoría multi-autor como `array<reference → author>` con default de alta en Studio verificado (`initialValue` con referencia al author `anonimo`); el modelo de anonimato quedó definido en [§10](#10-autoría-y-obra-anónima).

---

## 2. Modelo de dominio y vistas polimórficas

`LiteraryWork` es la **segunda raíz de agregado** del contexto **Catálogo de Contenido** (junto a `Story`/`Author`). Es **standalone**: no extiende ni comparte tipos con `Story`.

```typescript
interface LiteraryWorkBase {
	readonly _id: string;
	readonly slug: Slug;
	readonly title: string;
	readonly coverImage: string;
	readonly totalReadingTime: ReadingTime;
	readonly sectionCount: number; // total de secciones de la obra (>= 1)
	readonly tags: readonly Tag[];
	readonly mediaSources: readonly Media[]; // en la base: todas las vistas (incl. teaser/navegación) lo exponen
}

export interface LiteraryWork extends LiteraryWorkBase {
	readonly authors: readonly Author[]; // 1..N; la obra anónima referencia al author "Anónimo" (ver §10)
	readonly content: readonly LiteraryWorkSection[]; // >= 1
	readonly resources: readonly Resource[];
	readonly badLanguage?: boolean;
	readonly originalPublication: string;
	readonly publishedAt: IsoDateTime;
	readonly editorialNote?: SanitizedHtml; // paratexto editorial sobre la obra, ver nota abajo
}

export interface LiteraryWorkTeaser extends LiteraryWorkBase {
	readonly authors: readonly AuthorTeaser[];
	readonly teaserSection: LiteraryWorkSection; // primera sección completa
}

export interface LiteraryWorkNavigationTeaser extends LiteraryWorkBase {
	readonly authors: Array<never>;
}

export interface LiteraryWorkNavigationTeaserWithAuthors extends LiteraryWorkBase {
	readonly authors: readonly AuthorTeaser[];
}
```

**`editorialNote` es exclusivo del agregado completo.** Vive únicamente en `LiteraryWork` — no en `LiteraryWorkBase` ni en ninguna vista de teaser/navegación (`LiteraryWorkTeaser`, `LiteraryWorkNavigationTeaser`, `LiteraryWorkNavigationTeaserWithAuthors`): las tarjetas de listado y la navegación no lo muestran ni deben transportarlo — misma razón por la que `resources`, `badLanguage`, `originalPublication` y `publishedAt` tampoco están en la base. Es un campo opcional puro: **no agrega invariante** a `createLiteraryWork` (a diferencia de `title`, `content` o `authors`, su ausencia es un estado válido del agregado).

### Mapeo de `editorialNote` (CMS → dominio)

| CMS                                                                            | Dominio                         | Transformación                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `editorialNote?: markdown` (opcional, **a nivel de documento**, no de sección) | `editorialNote?: SanitizedHtml` | **Mismo pipeline MD→HTML que el cuerpo y los epígrafes** ([§9](#9-allow-list-de-sanitización)); ausente o vacío en el CMS → `undefined` en dominio, **nunca** string vacío (las factories de `Markdown`/`SanitizedHtml` rechazan contenido vacío) |

**Diferencias deliberadas con las vistas de `Story`:**

- `StoryTeaser` **vacía** su contenido (`paragraphs: []`); `LiteraryWorkTeaser` expone la **primera sección completa** (`teaserSection`) — decisión del epic: el teaser de una obra es su primera sección.
- `Story.author` es exactamente uno; `LiteraryWork.authors` es 1..N (el anonimato se expresa con el author "Anónimo", ver [§10](#10-autoría-y-obra-anónima)).
- `Story.approximateReadingTime` viene persistido del CMS (lo entra el editor); `LiteraryWork.totalReadingTime` es **derivado del texto** (suma de los `readingTime` de sus secciones, ensamblado en la factory) y **materializado write-once** en Sanity — ver [§5](#5-helper-de-reading-time).
- `Story.review` es el análogo más cercano de `LiteraryWork.editorialNote`: mismo propósito (paratexto editorial sobre la obra), pero acá en Markdown saneado (`SanitizedHtml`) en lugar de rich text, y con nombre propio en vez de reutilizar el vocabulario de `Story`.

**Invariantes del agregado** (validadas en `createLiteraryWork`, la única vía de construcción):

| Invariante                                   | Enforcement                                                                                                                                                                                                                              |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `slug` con formato válido e inmutable        | VO `Slug` (`createSlug` lanza ante formato inválido); unicidad garantizada por Sanity                                                                                                                                                    |
| `title` no vacío                             | `createLiteraryWork` lanza                                                                                                                                                                                                               |
| Al menos una sección de contenido            | `createLiteraryWork` lanza si `content.length === 0`                                                                                                                                                                                     |
| `totalReadingTime` = suma de secciones       | Derivado en la factory (suma de los `readingTime` de las secciones); persistido/editable a nivel schema y materializado por el backend (ver [§5](#5-helper-de-reading-time))                                                             |
| `sectionCount` = número real de secciones    | Derivado en la factory (`content.length`); en las vistas parciales/teaser lo provee el mapper (GROQ `count()`) y puede ser mayor que las secciones transportadas                                                                         |
| Posiciones contiguas en el agregado completo | `createLiteraryWork` lanza si `content[i].position !== i` — el agregado completo siempre transporta las secciones `0..sectionCount-1` en orden; las proyecciones parciales (construidas por el mapper) conservan el `position` de origen |
| `authors` con al menos un autor              | `createLiteraryWork` lanza si `authors.length === 0`; la obra anónima referencia al author "Anónimo" ([§10](#10-autoría-y-obra-anónima))                                                                                                 |

---

## 3. Shape de sección

### En el CMS (schema `literaryWork`, campo `content`)

```
section {
	chapterTitle?: string
	epigraphs?: Array<{ text: string (markdown), reference: string (markdown) }>
	body: string (markdown, required)
}
```

### En el dominio

```typescript
export interface LiteraryWorkEpigraph {
	readonly text: SanitizedHtml;
	readonly reference?: SanitizedHtml;
}

export interface LiteraryWorkSection {
	readonly position: number; // identidad numérica de la sección en la obra (0-based, igual al índice del array)
	readonly chapterTitle?: ChapterTitle;
	readonly epigraphs?: readonly LiteraryWorkEpigraph[];
	readonly bodyHtml: SanitizedHtml;
	readonly readingTime: ReadingTime;
}
```

### Mapeo campo a campo (CMS → dominio, responsabilidad de la ACL del repository, ver [§6](#6-repository-puerto-adaptador-y-doble))

| CMS                                        | Dominio                                 | Transformación                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------ | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chapterTitle?: string`                    | `chapterTitle?: ChapterTitle`           | `createChapterTitle` (si presente); habilita `toAnchor(): Slug` para anclas de navegación                                                                                                                                                                                                                                                                                                                                                       |
| `epigraphs[].text: markdown`               | `epigraphs[].text: SanitizedHtml`       | **Pasa por el mismo pipeline MD→HTML que el body** (el texto del epígrafe también es markdown)                                                                                                                                                                                                                                                                                                                                                  |
| `epigraphs[].reference: string (markdown)` | `epigraphs[].reference?: SanitizedHtml` | **Mismo pipeline MD→HTML** (paridad con `Story.Epigraph.reference`, que es rich text); ausente o vacío en CMS → `undefined` en dominio                                                                                                                                                                                                                                                                                                          |
| `body: markdown`                           | `bodyHtml: SanitizedHtml`               | Pipeline `unified` + rewrite de imágenes ([§9](#9-allow-list-de-sanitización))                                                                                                                                                                                                                                                                                                                                                                  |
| —                                          | `readingTime: ReadingTime`              | Derivado: texto plano del markdown → `WordCount` → `deriveReadingTime` ([§5](#5-helper-de-reading-time))                                                                                                                                                                                                                                                                                                                                        |
| —                                          | `position: number`                      | **Igual al índice en el array de secciones** (0-based, sin transformación: `position === index`) — el orden del array en Sanity es la fuente de verdad. Identidad numérica estable de la sección — su valor no depende de cómo se transporte la sección en una eventual obtención parcial futura ([§7](#7-contrato-del-endpoint)). La numeración humana ("Sección 1 de N") es un concern de presentación (`position + 1`), nunca del transporte |

> `editorialNote` no es un campo de sección — es a nivel de documento; su mapeo está en [§2](#2-modelo-de-dominio-y-vistas-polimórficas).

---

## 4. Value objects

Implementados en `src/models/*.model.ts` (#1852) — primera implementación real del patrón branded-type + factory del roadmap de [`domain-model.md`](../.claude/references/domain-model.md). `Story`/`Author` siguen sin brandear (roadmap #1503, sin cambios).

| VO              | Tipo                          | Invariante (la factory lanza si no se cumple)                                                                          | Archivo                   |
| --------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `Slug`          | `string & Brand`              | Formato `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`                                                                                 | `slug.model.ts`           |
| `WordCount`     | `number & Brand`              | Entero `>= 0`. **Interno**: no forma parte de ninguna interfaz de dominio pública; solo lo consume `deriveReadingTime` | `word-count.model.ts`     |
| `ReadingTime`   | `number & Brand`              | Entero `>= 1` (minutos)                                                                                                | `reading-time.model.ts`   |
| `Markdown`      | `string & Brand`              | No vacío (`trim() !== ''`). Marca la **frontera CMS**: markdown crudo validado                                         | `markdown.model.ts`       |
| `SanitizedHtml` | `string & Brand`              | No vacío. **No sanitiza** (ver corte abajo)                                                                            | `sanitized-html.model.ts` |
| `ChapterTitle`  | `{ value; toAnchor(): Slug }` | No vacío; `toAnchor()` deriva un `Slug` válido vía `slugify`                                                           | `chapter-title.model.ts`  |

### Anclas de sección — cómo funciona `toAnchor()`

`toAnchor()` normaliza el título del capítulo vía `slugify` (`lower: true, strict: true` — quita tildes y signos, kebab-case) y valida el resultado con `createSlug`: `createChapterTitle('¡Capítulo Uno!').toAnchor()` → `'capitulo-uno'` (tipado `Slug`). Su propósito es la **navegación intra-documento** en `/read/:slug`: anclas estables para la tabla de contenidos y deep-links (`/read/la-obra#capitulo-uno`), a consumir por la navegación multi-sección (Slice 2). Es complementaria a una eventual obtención parcial futura por sección ([§7](#7-contrato-del-endpoint), hoy diferida): el ancla desplaza dentro del documento **ya cargado**, mientras que traer una porción por request es un caso de uso todavía sin implementar.

Casos límite documentados para Slice 2 (no resueltos acá):

- **Títulos duplicados** producen anclas duplicadas — la deduplicación (p. ej. sufijo `-2`) es responsabilidad de la capa que renderiza la navegación.
- **Secciones sin `chapterTitle`** no tienen ancla derivable del título — el fallback natural es el ancla posicional construida desde `position` (p. ej. `#seccion-3`); su formato exacto se decide al construir la navegación.

**`IsoDateTime` — reutilizado, no duplicado.** `publishedAt` usa el tipo `IsoDateTime` ya existente en `src/utils/date.utils.ts`; #1852 le suma la factory validadora `createIsoDateTime(value: string): IsoDateTime`. No se crea un segundo símbolo ni se brandea el tipo existente (lo consumen `Author`/`AuthorProfile` sin factory; migrarlos excede este issue).

> **Corte importante — qué hace `createSanitizedHtml` hoy:** brandea + valida no-vacío un string que el llamador **garantiza** que ya pasó por el pipeline compartido de sanitización. **No ejecuta sanitización.** El pipeline real (`unified`/`rehype-sanitize`, [§9](#9-allow-list-de-sanitización)) se implementa en Slice 1, donde vive su único caller (la ACL del repository). Ídem el cómputo de reading time desde markdown ([§5](#5-helper-de-reading-time)): la conversión markdown→texto plano es de Slice 1; la aritmética es de #1852.

---

## 5. Helper de reading time

Dos partes con acoplamiento distinto:

**Implementado en #1852** (`reading-time.model.ts`, aritmética pura, sin dependencias):

```typescript
export function deriveReadingTime(wordCount: WordCount, wordsPerMinute?: number): ReadingTime;
// Math.max(1, Math.ceil(wordCount / (wordsPerMinute ?? 200))) — mínimo 1 minuto

export function sumReadingTimes(times: readonly ReadingTime[]): ReadingTime;
// suma por sección → total del agregado; mínimo 1
```

**Implementado** (`reading-time.model.ts`, sobre `unified`/`remark-parse`):

```typescript
export function countWords(markdown: Markdown): WordCount;
// texto legible del AST de remark-parse → split por whitespace → createWordCount

export function deriveSectionReadingTime(body: Markdown): ReadingTime;
// deriveReadingTime(countWords(body)) — reading time de una sección desde su cuerpo

export function deriveTotalReadingTime(bodies: readonly Markdown[]): ReadingTime;
// sumReadingTimes(bodies.map(deriveSectionReadingTime)) — total = suma pura del texto
```

`deriveSectionReadingTime`/`deriveTotalReadingTime` son la **fuente única** del algoritmo, para que el script de backfill ([#1959](https://github.com/cuentoneta/cuentoneta/issues/1959)) y el fallback de lectura del repository produzcan el mismo número por sección.

### Persistencia por script, no en el read path (supersede a la Opción B de #1953)

El texto de una obra es **inmutable una vez creada**, así que el reading time es **write-once**: se computa una sola vez y se **persiste** en Sanity en lugar de recalcularse en cada lectura —

- `readingTime` **por sección**, en `section.readingTime` (campo del object `section` del schema).
- `totalReadingTime` **en el documento `literaryWork`**.

Ambos campos son **opcionales** en el schema y arrancan vacíos. El poblado lo hace un **script on-demand / cron** ([#1959](https://github.com/cuentoneta/cuentoneta/issues/1959)) — la **única vía de persistencia** de estos campos: no ocurre en el Studio, ni por migración, ni en el read path del backend.

> **Decisión actualizada.** La planificación original ([#1953](https://github.com/cuentoneta/cuentoneta/issues/1953), Opción B) proponía poblar estos campos por **materialización self-healing en la primera lectura** del backend: el repository computaba y, si algo faltaba, lo **persistía de vuelta** (patch) antes de responder, con coalescing de escrituras concurrentes por documento para acotar el consumo de cuota en un endpoint público. Esa vía queda **superseded** por el script — patchear Sanity dentro del read path se consideró un detalle de implementación excesivo frente al beneficio: se prefirió la opción más simple (adaptador sin estado de coalescing ni dependencia de un cliente con token de escritura en el read path), a cambio de que el backfill sea un paso operativo explícito en vez de automático.

El flujo por sección sigue siendo el mismo de siempre —

```
body (Markdown) → countWords → WordCount → deriveReadingTime → ReadingTime
```

— y el total del agregado sigue siendo `sumReadingTimes(sections.map(s => s.readingTime))`.

### Fallback puro en lectura (sin persistir)

Cuando `fetchBySlug` ([§6](#6-repository-puerto-adaptador-y-doble)) lee una obra a la que le falta `readingTime`/`totalReadingTime` (todavía no pasó por el script), el adaptador Sanity **deriva** el valor faltante con los mismos helpers de dominio (`deriveSectionReadingTime` por sección; `createLiteraryWork` deriva el total como `sumReadingTimes` cuando no hay un valor editorial persistido) para servir una respuesta válida — **sin escribir nada de vuelta en Sanity**. Es cómputo de lectura puro: mientras la obra no pase por el script, cada lectura vuelve a derivar; no hay estado ni caché en el adaptador.

### Unidad compartida de cómputo + persistencia (consumida por el script)

`buildReadingTimeMaterialization` + `applyReadingTimeMaterialization` (`src/models/reading-time-materialization.model.ts`) son la **fuente única** del patch `setIfMissing` y de la semántica de campos descrita arriba. Es la unidad que consume, en exclusiva, el **script de backfill** ([#1959](https://github.com/cuentoneta/cuentoneta/issues/1959)) — el repository **no** la usa: su fallback de lectura (arriba) deriva directo con `deriveSectionReadingTime`, sin patch ni escritura.

```typescript
export function buildReadingTimeMaterialization(input: ReadingTimeMaterializationInput): ReadingTimeMaterialization;
// compute-if-missing puro: por cada sección ausente deriva con `deriveSectionReadingTime`; el total ausente lo computa
// como `sumReadingTimes` de las secciones resueltas (mismo contrato que `createLiteraryWork`, sin re-parsear bodies).
// Arma el patch `setIfMissing` (secciones direccionadas por `_key`: `content[_key=="…"].readingTime`; total como
// `totalReadingTime`); un `totalReadingTime` presente (duración editorial de un recitado) se sirve tal cual y nunca
// se pisa ni se recalcula del texto. Devuelve también los reading times resueltos (presente ∪ computado) para que el
// script no tenga que releer el documento tras persistir.

export function applyReadingTimeMaterialization(
	writer: ReadingTimeMaterializationWriter,
	documentId: string,
	materialization: ReadingTimeMaterialization,
): Promise<void>;
// persiste `setIfMissing` vía un puerto de escritura angosto (la capa de dominio no importa `@sanity/client`); sin
// campos faltantes (`isEmpty`) no hace round-trip de red.
```

El **guard de `_key`** (validación del patrón alfanumérico antes de interpolarlo en el path del patch, [#2003](https://github.com/cuentoneta/cuentoneta/issues/2003)) protege esta misma unidad — hoy, exclusivamente al script, su único consumidor.

> **Estado de implementación:** el schema (campos opcionales, arrancan vacíos), esta unidad de cómputo + persistencia (#1986) y el **repository** (con su fallback puro de lectura) ya existen en `develop`/en review. `SanityLiteraryWorkRepository` (`src/api/modules/literary-work/literary-work.repository.sanity.ts`) es dueño de la traducción raw Sanity → dominio (la ACL vive **dentro del repository**, como métodos privados, no como un mapper separado en `_utils/`) y, ante `readingTime`/`totalReadingTime` ausentes, deriva el fallback puro descrito arriba — **no** escribe en Sanity. Es el **Slice 1a**, revisado en **PR #2002**, desde `develop` (el PR #1929 fue solo el draft del modelo de #1852, no la base de este incremento). El **script de backfill** ([#1959](https://github.com/cuentoneta/cuentoneta/issues/1959)) y el **service** (`getLiteraryWorkBySlug`) siguen pendientes.

### Duración de obras recitadas/audiovisuales

Para obras cuyo contenido principal es un **recitado o audiovisual** (p. ej. narraciones verbales sin texto fuente), la duración relevante es la del medio, no la del texto. No hay un campo aparte para esto: `literaryWork.totalReadingTime` es **editable** en el schema, así que el editor lo carga a mano con la duración del medio y tanto el script de backfill como el fallback de lectura del backend lo **respetan** (`setIfMissing`/la derivación no pisan un valor ya cargado). En obras de texto ese mismo campo lo completa el backend con `sumReadingTimes` sobre las secciones.

`createLiteraryWork` deriva `totalReadingTime` de las secciones en cada construcción del agregado; el valor persistido/editorial vive en el campo del schema y lo sirve el repository del backend. El `readingTime` **por sección** siempre se deriva del texto; lo persiste el script [#1959](https://github.com/cuentoneta/cuentoneta/issues/1959) en `section.readingTime` (con el fallback puro en lectura mientras tanto, ver arriba).

### Obras solo-recitado (sin texto fuente)

La invariante `content >= 1` **se mantiene**: una obra cuyo contenido es únicamente un recitado (p. ej. narraciones de Alberto Laiseca adaptadas de una película, sin versión textual) se publica con:

1. Una **sección editorial mínima** (presentación/contexto curatorial del recitado) — le da a `/read/:slug` el cuerpo SSR indexable que la estrategia SEO del epic exige, y mantiene válidos `teaserSection` y `sectionCount`.
2. El medio en **`mediaSources`** (el schema ya soporta `youTubeVideo`/`audioRecording`/etc.).
3. **`totalReadingTime`** (editable) cargado a mano con la duración real del medio.

Permitir `content: []` se evaluó y descartó: degeneraría `totalReadingTime` (mínimo 1 falso), `teaserSection` (pasaría a opcional en cascada) y la premisa "un documento SSR indexable" del epic. Una `MediaSection` como tipo de sección (unión `TextSection | MediaSection`) queda como extensión futura si surge necesidad curatorial concreta — reabre pipeline, reading time y render, y no se justifica hoy.

---

## 6. Repository: puerto, adaptador y doble

Contrato para Slice 1 (patrón `fetch*`/`get*` de [`sanity-acl.md`](../.claude/references/sanity-acl.md) + Qualified Implementation de [`clean-architecture.md`](../.claude/references/clean-architecture.md)):

```typescript
// Puerto (nombre limpio)
interface LiteraryWorkRepository {
	// Desviación intencional del patrón fetch*()-crudo de sanity-acl.md: devuelve dominio mapeado
	// (repositorio-como-puerto, dirección roadmap #1503). Materializa el shape crudo puertas adentro.
	// Única lectura expuesta: la obra completa por slug. La lectura de una sección puntual se difiere
	// hasta que exista un caso de uso.
	fetchBySlug(slug: string): Promise<LiteraryWork | null>;
}

// Adaptador real: SanityLiteraryWorkRepository implements LiteraryWorkRepository (GROQ)
// Doble de test:  InMemoryLiteraryWorkRepository implements LiteraryWorkRepository
//                 (calificado InMemory* por sustituir almacenamiento; categoría Fake* de la
//                  taxonomía Stub*/Fake*/Spy*, nunca Mock*)
```

**La ACL vive dentro del repository, no en `_utils/`.** A diferencia del resto de los módulos backend (ver [`sanity-acl.md`](../.claude/references/sanity-acl.md)), `SanityLiteraryWorkRepository` no delega la traducción raw → dominio a funciones separadas en `src/api/_utils/*.functions.ts`: la implementa como **métodos privados propios** (`mapWork`, `mapMetadata`, `mapSection`, `mapEpigraph`, …), reutilizando como building blocks los sub-mappers transversales ya existentes (`mapAuthor`, `mapResources`, `mapTags`, `mapMediaSources`). Es una **divergencia intencional**: el repository es la única frontera que conoce el shape de Sanity y entrega `LiteraryWork` de dominio listo — la dirección arquitectónica objetivo del backend (repository dueño de su propia ACL), no todavía adoptada por `story` ni por el resto de los módulos. `InMemoryLiteraryWorkRepository` almacena y devuelve dominio (`LiteraryWork[]`), no crudo. Implementación revisada en **PR #2002** (Slice 1a).

**Estructura de archivos (puerto / adaptador / doble separados).** Para que el doble no dependa del adaptador concreto —DIP: la interfaz vive con quien la _usa_, no con quien la _implementa_— el trío se reparte en tres archivos del módulo, en vez de alojar la interfaz junto a un implementador:

| Archivo                              | Rol                                                                                                                                                                                                   |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `literary-work.repository.ts`        | **Puerto**: la interfaz `LiteraryWorkRepository`, con una única firma (`fetchBySlug`)                                                                                                                 |
| `literary-work.repository.sanity.ts` | **Adaptador Sanity**: `SanityLiteraryWorkRepository` + su ACL privada (traducción raw→dominio); deriva un fallback puro de reading time cuando falta, sin persistir ([§5](#5-helper-de-reading-time)) |
| `literary-work.repository.mock.ts`   | **Doble**: `InMemoryLiteraryWorkRepository` (almacena dominio)                                                                                                                                        |

Ambos adaptadores importan del **puerto**, nunca entre sí (ADP: ningún adaptador conoce al otro). Es el patrón de nombres (`<dominio>.repository.ts` / `.repository.sanity.ts` / `.repository.mock.ts`) a reutilizar en los próximos módulos backend que adopten "repository dueño de su ACL".

Firma del módulo backend (service, consume el repository ya en dominio):

```typescript
getLiteraryWorkBySlug(slug: string): Promise<LiteraryWork>;
```

La ACL del repository (ver arriba) es responsable de: validar invariantes contra el shape de typegen, correr el pipeline MD→HTML sobre body, epígrafes y nota editorial, y derivar el reading time como fallback puro cuando falta (la persistencia queda a cargo del script [#1959](https://github.com/cuentoneta/cuentoneta/issues/1959), ver [§5](#5-helper-de-reading-time)). La autoría **no requiere normalización**: la referencia al author "Anónimo" viaja al dominio como cualquier otra ([§10](#10-autoría-y-obra-anónima)).

---

## 7. Contrato del endpoint

### `GET /literary-work/:slug`

| Aspecto         | Contrato                                                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Params          | `{ slug: string }` — validación zod con el `slugSchema` existente de `src/api/schemas/common.schemas.ts` (reutilizar, no duplicar)                                                                                 |
| Respuesta 200   | `LiteraryWork` **completo** (JSON; forma idéntica a la interfaz de dominio de [§2](#2-modelo-de-dominio-y-vistas-polimórficas)) — `content` transporta **todas** las secciones (`sectionCount === content.length`) |
| Respuesta 404   | `{ error: string }` JSON cuando el slug no existe — el controller atrapa `LiteraryWorkNotFoundError` y responde 404 propio, sin degradar al 500 del `onError` global (ver decisión abajo)                          |
| Registro        | `apiRoutes.route('/literary-work', literaryWorkController)` en `src/api/routes.ts`                                                                                                                                 |
| Colección Bruno | `docs/api/bruno/literary-work/get-literary-work-by-slug.bru` — se crea **en el mismo PR** que el endpoint (DoD de Slice 1); este contrato es su fuente                                                             |

### Lectura de sección puntual — trabajo futuro diferido

El endpoint expone únicamente la **obra completa** por slug: no existe hoy ninguna variante de obtención parcial. Se difiere hasta que exista un caso de uso concreto — en la migración Story → LiteraryWork todo el texto ocupa `content[0]`, así que hoy no hay consumidor que necesite traer una sección suelta. Cada sección ya transporta su **`position`** (0-based, [§3](#3-shape-de-sección)) — identidad numérica estable, independiente del índice del array de la respuesta —, condición que cualquier obtención parcial futura podría reutilizar sin cambiar el shape de sección. La query GROQ de obtención parcial (`literaryWorkSectionBySlugQuery`) ya proyecta `editorialNote` junto al resto de la metadata, aunque el endpoint que la consuma siga sin implementarse.

El SSR de `/read/:slug` (Slice 1) consume la forma completa; la navegación multi-capítulo (Slice 2) también parte de la obra completa ya cargada (ver anclas intra-documento, [§4](#4-value-objects)).

> **Decisión (Slice 1c) — slug inexistente → 404 propio.** El módulo `story` ante slug no encontrado lanza un `Error` genérico que el `onError` global degrada a HTTP **500 sin body estructurado**. `literary-work` **diverge a propósito** y sienta el precedente: el service lanza `LiteraryWorkNotFoundError` (error tipado por operación) y el controller lo traduce a **404 con envelope `{ error }`**. Devolver 404 para un recurso inexistente es el contrato correcto; alinear a `story` a este precedente queda para un issue transversal, no bloquea este slice.

### Consumo desde el frontend — DTO de wire y rehidratación en el provider

**Decisión.** El body de la respuesta **es** la proyección serializada del agregado (no se introduce un shape distinto tipo `LiteraryWorkHttpResponse` — misma repo, sin versionado ni multi-cliente: una tercera forma solo agregaría riesgo de drift). Pero el **tipo** con el que el frontend recibe ese body no es `LiteraryWork`: la serialización pierde exactamente lo que hace dominio al dominio —

- **Métodos**: `ChapterTitle.toAnchor()` no viaja por JSON — tipear la respuesta como `LiteraryWork` produciría un error en runtime al invocarlo.
- **Brands**: `Slug`/`SanitizedHtml`/`ReadingTime` son compile-time; `HttpClient.get<T>` es un cast, no una validación.
- **`Object.freeze`**: la inmutabilidad runtime no cruza el wire.

El contrato del frontend (Slice 1) es entonces:

| Pieza             | Contrato                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tipo de wire**  | `literaryWorkDtoSchema` (zod) es la **fuente única** del contrato: `LiteraryWorkDto = z.infer<...>` (sin type hand-maintained que driftee). Describe el agregado serializado (`slug: string`, `title?: { value: string }` — el `SectionTitle` `{ value, toAnchor() }` pierde el método al cruzar JSON, `bodyHtml: string`, `editorialNote?: string` — mismo nombre que en el dominio, opcional, presente solo si la obra tiene nota editorial, …). Vive en el **kernel** (`@models/literary-work.dto.ts`, framework-neutral) para poder compartirse con el backend. Los tipos de dominio anémicos anidados (`Author`/`Tag`/`Media`/`Resource`) se validan como **opacos** (es-objeto), no en profundidad — su contrato de wire propio es de sus módulos |
| **Rehidratación** | `HttpLiteraryWorkApi` (el ACL del frontend, simétrico a la ACL del repository de Sanity del backend) valida la respuesta con `literaryWorkDtoSchema.parse(...)` **en la frontera** (el `HttpClient.get<T>` es un cast sin chequear; zod da la garantía de runtime del shape) y luego mapea `dto → createLiteraryWork(...)` reutilizando **las mismas factories** del dominio (`editorialNote` se rehidrata con `createSanitizedHtml` cuando está presente). **Dos capas complementarias:** zod valida **shape/tipos**; las factories, las **invariantes de dominio** — ambas lanzan en la frontera, no en un template                                                                                                                                   |
| **Superficie**    | El DTO **no sale del provider**: services, señales públicas y componentes consumen exclusivamente `LiteraryWork` y sus vistas (regla "Binding en componentes: solo dominio" de `domain-model.md`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

**Alternativa evaluada y descartada:** volver el modelo _serialization-transparent_ demoviendo `toAnchor()` a función pura standalone y compartiendo el tipo de dominio como contrato de wire (paridad con el flujo actual de `Story`, que funciona porque sus interfaces son anémicas). Se descarta porque renuncia al modelo rico recién construido y porque las factories ya existen y están testeadas — el costo de la rehidratación es marginal frente a recuperar métodos, brands re-validados e inmutabilidad en el cliente.

---

## 8. Estrategia de caché de borde

**Alcance acotado a partir de [#1953](https://github.com/cuentoneta/cuentoneta/issues/1953): esta sección es exclusiva del HTML renderizado** — issue [#1856](https://github.com/cuentoneta/cuentoneta/issues/1856). El reading time (por sección y total) **no depende de esta sección**: se persiste write-once en campos propios del documento fuente, poblados por el **script de backfill** ([#1959](https://github.com/cuentoneta/cuentoneta/issues/1959)) descrito en [§5](#5-helper-de-reading-time) — sin relación con esta caché.

**Decisión actualizada: se descartó materializar un documento derivado.** El plan original de #1856 era un webhook que, ante cada publicación, materializaba un documento derivado con el HTML por sección ya transformado (`{ HTML por sección, stamp de revisión }`, con fallback on-the-fly si el derivado estaba stale). Esa vía queda **superseded**: el origen del HTML sigue siendo, exclusivamente, **transform-on-read** — la ACL del repository transforma MD→HTML en cada lectura (ya en `develop`, Slice 1a, ver [§6](#6-repository-puerto-adaptador-y-doble)) —, y lo que se agrega no es un derivado sino una **caché de la respuesta entera en el borde de Vercel**. Un hit de CDN elimina de un saque los tres costos (transformación MD→HTML, fetch a Sanity, render SSR); el contenido de una obra es **inmutable una vez creada** ([§5](#5-helper-de-reading-time)), así que el miss es el caso raro.

**Sin invalidación explícita: la frescura la da `stale-while-revalidate`.** Se evaluó un purge-on-publish (webhook de Sanity → endpoint propio → `invalidateByTag` de Vercel) y se descartó: pedía un módulo entero, un secreto compartido, verificación de firma HMAC, etiquetado por obra y un alta manual del webhook, todo para acelerar la propagación de un evento —la corrección de una obra ya publicada— que es infrecuente por diseño. La misma propiedad se obtiene sin infraestructura: vencido el `s-maxage`, el CDN **sigue sirviendo la respuesta cacheada al instante** y revalida contra el origen en background. El lector nunca espera al origen, el origen recibe una sola request por ventana, y una edición se propaga en la visita siguiente al vencimiento.

### Mecánica implementada

| Elemento          | Diseño                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Qué se cachea     | La **respuesta entera** de las dos superficies de lectura de una obra — la página SSR de `/read/:slug` y el JSON de `GET /literary-work/:slug` —, no un derivado intermedio.                                                                                                                                                                                                                                                                                                          |
| Página SSR        | Middleware `ssrCacheControl` (`src/api/_middleware/ssr-cache-control.middleware.ts`), montado solo en `/read/*`. **Guarda anti-CSR:** bufferiza e inspecciona el body (`c.res.clone().text()`) buscando el marcador `ng-server-context="ssr"` antes de cachear — el fallback CSR degradado responde con el mismo `200 text/html` sin ningún header distintivo, así que cachearlo serviría una página vacía durante todo el TTL. No cachea ante respuestas no-200.                     |
| Endpoint JSON     | `GET /api/literary-work/:slug` emite los mismos headers **inline en el controller** (`literary-work.controller.ts`) tras un 200: el JSON es determinístico y no tiene el riesgo de fallback CSR de la página, así que no necesita el guard de body.                                                                                                                                                                                                                                   |
| Headers           | `Vercel-CDN-Cache-Control` lleva `s-maxage` + `stale-while-revalidate=604800` (7 días) — lo honra únicamente el CDN de Vercel, no se reenvía al browser. `Cache-Control` del browser es `public, max-age=0, must-revalidate`: el TTL vive en un solo lugar, porque con un TTL propio en el navegador una edición ya revalidada por el CDN seguiría sin verse hasta que venciera el del browser. Fuente única de ambos: `applyReadCacheHeaders` (`src/api/_helpers/cache-control.ts`). |
| `s-maxage`        | Interruptor de entorno `READ_CACHE_S_MAXAGE` (`EnvironmentConfig.readCacheSMaxAge`), con default conservador de **5 minutos** si la variable no está seteada o es inválida. Es la ventana de propagación de una edición, no un límite de disponibilidad: el `stale-while-revalidate` de 7 días cubre el servido mientras se revalida.                                                                                                                                                 |
| Corte por entorno | `applyReadCacheHeaders` no emite nada fuera de producción (coherente con `noindexNonProduction`): un preview comparte el CDN y serviría contenido de un dataset que no es el público. La condición vive en el helper, no en cada llamador, para que la política de cacheabilidad tenga un solo dueño.                                                                                                                                                                                 |

La cache key del CDN de Vercel incluye el query string, así que si la página llega a tener variantes por query, cada una se cachea por separado (hoy no las tiene: la navegación por sección está diferida, ver [§7](#7-contrato-del-endpoint)).

---

## 9. Allow-list de sanitización

Constante **compartida** (única fuente de verdad para el pipeline de la ACL de Slice 1). Base: el schema por defecto de `rehype-sanitize` (`hast-util-sanitize`, basado en la sanitización de GitHub), con esta extensión explícita:

| Tag     | Atributos permitidos                                             | Motivo                                                                                                                                                      |
| ------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<img>` | `src`, `srcset`, `width`, `height`, `loading`, `decoding`, `alt` | Las imágenes del contenido son assets de Sanity; `width`/`height` recuperados del `assetId-WxH` de la URL evitan CLS; `loading`/`decoding` para performance |

El **rewrite de imágenes** (`cdn.sanity.io` → `<img srcset width height loading decoding>`) ocurre en un plugin `rehype` custom que corre **antes** de `rehype-sanitize` en el pipeline, de modo que la salida final siempre pasa por la allow-list. Contrato documentado acá; implementación en Slice 1.

Reglas duras del pipeline:

- Todo HTML servido al frontend pasó por `rehype-sanitize` con esta allow-list — **sin excepciones** (body, epígrafes y nota editorial por igual).
- Scripts, estilos inline, iframes y handlers de eventos quedan **fuera** (no están en el schema por defecto y no se agregan).
- Cambiar la allow-list deja stale a la caché de borde: no hay purga (ver [§8](#8-estrategia-de-caché-de-borde)), así que las respuestas ya cacheadas siguen sirviendo HTML sanitizado con la allow-list vieja hasta que venza el `s-maxage` y la revalidación las reemplace. Si el cambio es correctivo (cierra un vector), no alcanza con esperar: bajar el `s-maxage` acorta la ventana. Actualizar además los tests de XSS del pipeline.

---

## 10. Autoría y obra anónima

**Decisión: "Anónimo" es un Author real del catálogo.** La obra anónima referencia explícitamente al author de slug `anonimo` — en el CMS y en el dominio por igual. No hay estado "sin autores": una obra tiene **siempre al menos un autor**.

### Schema (CMS)

- `authors: array<reference → author>`, con `Rule.required().min(1).unique()`. El **orden expresa prioridad** (primer autor = principal).
- **Default de alta en Studio:** `initialValue` a nivel documento pre-carga `authors[0]` con la referencia al author de slug `anonimo` (`_id: a9af4fc4-25d4-48c0-8776-5b0a14c758c5`, idéntico en los datasets production/staging/development; name "Anónimo"). El editor arranca con una atribución válida — que ya es la representación correcta de la obra anónima — y la reemplaza cuando la obra tiene autoría real.
- Con `min(1)`, el array vacío **no es un estado válido** en el CMS: existe una única representación del anonimato (la referencia explícita), sin colisión entre `[]` y `[ref(anonimo)]`.

### Dominio — "Anónimo" viaja como `Author`

La ACL **no filtra ni normaliza** la referencia: el dominio recibe `authors: [Author('Anónimo')]` como cualquier otra autoría. La invariante del agregado pasa a ser `authors.length >= 1` (paridad conceptual con `Story`, que exige autor — acá generalizada a 1..N).

Policy pura (único punto de verdad de la regla, `literary-work.model.ts`):

```typescript
export const ANONYMOUS_AUTHOR_SLUG = 'anonimo';

export function isAnonymous(authors: ReadonlyArray<{ readonly slug: string }>): boolean;
// authors.length > 0 && authors.every(a => a.slug === ANONYMOUS_AUTHOR_SLUG)
```

- Se compara por **slug** (clave de negocio), nunca por `_id` (infraestructura). El slug `anonimo` es un **valor bien conocido del dominio** — el costo aceptado de esta decisión es que el dominio conoce ese valor especial; a cambio, el mapeo es directo (sin caso especial en la ACL) y la atribución "Anónimo" es visible y navegable como cualquier autor.
- `every` (y no `some`): si una obra referencia a Anónimo **y** a un autor real, tiene autoría real — no es anónima. Con `.unique()` en el schema, el caso esperado de anonimato es exactamente `[Anónimo]`.

Consecuencias:

- **UI:** el byline sale natural del modelo (`authors[0].name === 'Anónimo'`); la página `/author/anonimo` existe y lista las obras anónimas — comportamiento aceptado y deseado.
- **JSON-LD (Slice 3):** la obra anónima emite `author` como `Person` "Anónimo" (representación real del catálogo); multi-autor ⇒ array de `Person`.
- **Curaduría:** las obras anónimas se consultan por referencia al author `anonimo` (GROQ estándar), sin queries especiales por array vacío.

---

## 11. Corte de #1852 vs. Slice 1 (#1853)

| Pieza                                                                                                           | #1852 (este issue)                                           | Slice 1 (#1853)                                                    |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------ |
| Doc de diseño (este archivo)                                                                                    | ✅ Código de contratos cerrados                              | Consume                                                            |
| Schema `literaryWork` definitivo + registro + `markdownSchema()` + typegen                                      | ✅ Implementado                                              | Consume                                                            |
| VOs (`Slug`, `WordCount`, `ReadingTime`, `Markdown`, `SanitizedHtml`, `ChapterTitle`) + `createIsoDateTime`     | ✅ Implementados con specs                                   | Consume                                                            |
| Aritmética de reading time (`deriveReadingTime`, `sumReadingTimes`)                                             | ✅ Implementada con specs                                    | Consume                                                            |
| Agregado `LiteraryWork` + secciones + vistas + `createLiteraryWork` + `isAnonymous`                             | ✅ Implementados con specs                                   | Consume                                                            |
| `countWords` (markdown → texto plano, `mdast-util-to-string`)                                                   | Contrato ([§5](#5-helper-de-reading-time))                   | ⚙️ Implementa                                                      |
| Pipeline MD→HTML (`unified`/`rehype-sanitize`) + allow-list como constante + rewrite de imágenes                | Contrato ([§9](#9-allow-list-de-sanitización))               | ⚙️ Implementa                                                      |
| Repository (puerto `fetchBySlug` + `Sanity*` + `InMemory*`, ACL dentro del repository) + módulo backend         | Contrato ([§6](#6-repository-puerto-adaptador-y-doble))      | ⚙️ Implementa (repository revisado en PR #2002; service pendiente) |
| Reading time: fallback puro en lectura + script de backfill                                                     | Contrato ([§5](#5-helper-de-reading-time))                   | ⚙️ Repository implementa el fallback; script #1959 pendiente       |
| Endpoint `GET /literary-work/:slug` + `.bru`                                                                    | Contrato ([§7](#7-contrato-del-endpoint))                    | ⚙️ Implementa                                                      |
| Frontend (`LiteraryWorkApi` + `LiteraryWorkDto` + rehidratación en el provider, ruta `/read/:slug`, página SSR) | Contrato ([§7](#7-contrato-del-endpoint))                    | ⚙️ Implementa                                                      |
| Caché de borde `/read` (middleware + endpoint), con SWR y sin purga (#1856)                                     | Contrato ([§8](#8-estrategia-de-caché-de-borde))             | ✅ Implementado                                                    |
| JSON-LD                                                                                                         | Consecuencia documentada ([§10](#10-autoría-y-obra-anónima)) | Slice 3                                                            |
