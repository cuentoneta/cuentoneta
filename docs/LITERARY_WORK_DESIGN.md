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
8. [Estrategia de materialización](#8-estrategia-de-materialización)
9. [Allow-list de sanitización](#9-allow-list-de-sanitización)
10. [Autoría 0..N y obra anónima](#10-autoría-0n-y-obra-anónima)
11. [Corte de #1852 vs. Slice 1 (#1853)](#11-corte-de-1852-vs-slice-1-1853)

---

## 1. Contexto y decisiones heredadas

Decisiones cerradas en la planificación del epic #1481 — **no se reabren**:

| Decisión              | Detalle                                                                                                                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entidad paralela      | `LiteraryWork` no toca `Story` ni acopla su vocabulario: contrato limpio, **sin supertipo compartido**.                                                                                                                               |
| Contenido             | Array de **secciones**; el teaser expone la **primera sección**. La navegación multi-sección en UI se difiere (Slice 2).                                                                                                              |
| Pipeline de contenido | Markdown → HTML **saneado server-side** vía `unified` (`remark-parse → remark-rehype → rehype-sanitize → rehype-stringify`); el cliente solo hace `bypassSecurityTrustHtml` + `[innerHTML]`. Ningún markdown crudo cruza al frontend. |
| Ruta                  | `/read/:slug`, self-canonical 200 (sin redirect), un documento SSR indexable.                                                                                                                                                         |
| Repository            | Puerto + adaptador + doble (ver [§6](#6-repository-puerto-adaptador-y-doble)).                                                                                                                                                        |
| Reading time          | **No se persiste** en el documento fuente; se materializa fuera del CMS (webhook → función → documento derivado, decisión T1b — ver [§8](#8-estrategia-de-materialización)).                                                          |
| Imágenes              | Assets de Sanity. La URL de `cdn.sanity.io` codifica dimensiones (`assetId-WxH`) → CLS recuperable vía rewrite en un plugin `rehype` (ver [§9](#9-allow-list-de-sanitización)).                                                       |

Hallazgos del prototipo (validados, rama `spike/1481-literarywork-schema`):

- `sanity-plugin-markdown@^9.0.6` es compatible con Sanity v5; `sanity build` (gate `studio-build`) verde, incluso en Node 26.
- El tipo `markdown` se almacena como `string` crudo → en la frontera se valida como `Markdown` y el ACL produce `SanitizedHtml`.
- El hallazgo del spike "typegen tipa todo `optional`" aplicaba a una extracción **sin** `--enforce-required-fields`; el target `extract-schema` del repo (`cms/project.json`) extrae **con** ese flag, así que los campos con `Rule.required()` sí se tipan como no opcionales en `types.ts`. Las invariantes se hacen cumplir **igualmente** en el mapper/dominio: el flag garantiza el tipo, no los datos en runtime (documentos legacy o drafts pueden violar el schema), y las proyecciones GROQ parciales tienen sus propios shapes.
- Autoría 0..N con array vacío = obra anónima, y default de alta en Studio (ver [§10](#10-autoría-0n-y-obra-anónima)).

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
}

export interface LiteraryWork extends LiteraryWorkBase {
	readonly authors: readonly Author[]; // 0..N; [] = obra anónima (ver §10)
	readonly content: readonly LiteraryWorkSection[]; // >= 1
	readonly mediaSources: readonly MediaTypes[];
	readonly resources: readonly Resource[];
	readonly badLanguage?: boolean;
	readonly originalPublication: string;
	readonly publishedAt: IsoDateTime;
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

**Diferencias deliberadas con las vistas de `Story`:**

- `StoryTeaser` **vacía** su contenido (`paragraphs: []`); `LiteraryWorkTeaser` expone la **primera sección completa** (`teaserSection`) — decisión del epic: el teaser de una obra es su primera sección.
- `Story.author` es exactamente uno; `LiteraryWork.authors` es 0..N.
- `Story.approximateReadingTime` viene persistido del CMS; `LiteraryWork.totalReadingTime` es **derivado** (suma de los `readingTime` de sus secciones, calculado en la factory).

**Invariantes del agregado** (validadas en `createLiteraryWork`, la única vía de construcción):

| Invariante                                | Enforcement                                                                                                                                                      |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `slug` con formato válido e inmutable     | VO `Slug` (`createSlug` lanza ante formato inválido); unicidad garantizada por Sanity                                                                            |
| `title` no vacío                          | `createLiteraryWork` lanza                                                                                                                                       |
| Al menos una sección de contenido         | `createLiteraryWork` lanza si `content.length === 0`                                                                                                             |
| `totalReadingTime` = suma de secciones    | Derivado en la factory (no es input)                                                                                                                             |
| `sectionCount` = número real de secciones | Derivado en la factory (`content.length`); en las vistas parciales/teaser lo provee el mapper (GROQ `count()`) y puede ser mayor que las secciones transportadas |
| `authors` admite 0..N                     | **Sin** invariante de longitud — `[]` es un valor válido (obra anónima), a diferencia de `Story`                                                                 |

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
	readonly chapterTitle?: ChapterTitle;
	readonly epigraphs?: readonly LiteraryWorkEpigraph[];
	readonly bodyHtml: SanitizedHtml;
	readonly readingTime: ReadingTime;
}
```

### Mapeo campo a campo (CMS → dominio, responsabilidad del ACL de Slice 1)

| CMS                                        | Dominio                                 | Transformación                                                                                                                         |
| ------------------------------------------ | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `chapterTitle?: string`                    | `chapterTitle?: ChapterTitle`           | `createChapterTitle` (si presente); habilita `toAnchor(): Slug` para anclas de navegación                                              |
| `epigraphs[].text: markdown`               | `epigraphs[].text: SanitizedHtml`       | **Pasa por el mismo pipeline MD→HTML que el body** (el texto del epígrafe también es markdown)                                         |
| `epigraphs[].reference: string (markdown)` | `epigraphs[].reference?: SanitizedHtml` | **Mismo pipeline MD→HTML** (paridad con `Story.Epigraph.reference`, que es rich text); ausente o vacío en CMS → `undefined` en dominio |
| `body: markdown`                           | `bodyHtml: SanitizedHtml`               | Pipeline `unified` + rewrite de imágenes ([§9](#9-allow-list-de-sanitización))                                                         |
| —                                          | `readingTime: ReadingTime`              | Derivado: texto plano del markdown → `WordCount` → `deriveReadingTime` ([§5](#5-helper-de-reading-time))                               |

---

## 4. Value objects

Implementados en `src/app/models/*.model.ts` (#1852) — primera implementación real del patrón branded-type + factory del roadmap de [`domain-model.md`](../.claude/references/domain-model.md). `Story`/`Author` siguen sin brandear (roadmap #1503, sin cambios).

| VO              | Tipo                          | Invariante (la factory lanza si no se cumple)                                                                          | Archivo                   |
| --------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `Slug`          | `string & Brand`              | Formato `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`                                                                                 | `slug.model.ts`           |
| `WordCount`     | `number & Brand`              | Entero `>= 0`. **Interno**: no forma parte de ninguna interfaz de dominio pública; solo lo consume `deriveReadingTime` | `word-count.model.ts`     |
| `ReadingTime`   | `number & Brand`              | Entero `>= 1` (minutos)                                                                                                | `reading-time.model.ts`   |
| `Markdown`      | `string & Brand`              | No vacío (`trim() !== ''`). Marca la **frontera CMS**: markdown crudo validado                                         | `markdown.model.ts`       |
| `SanitizedHtml` | `string & Brand`              | No vacío. **No sanitiza** (ver corte abajo)                                                                            | `sanitized-html.model.ts` |
| `ChapterTitle`  | `{ value; toAnchor(): Slug }` | No vacío; `toAnchor()` deriva un `Slug` válido vía `slugify`                                                           | `chapter-title.model.ts`  |

### Anclas de sección — cómo funciona `toAnchor()`

`toAnchor()` normaliza el título del capítulo vía `slugify` (`lower: true, strict: true` — quita tildes y signos, kebab-case) y valida el resultado con `createSlug`: `createChapterTitle('¡Capítulo Uno!').toAnchor()` → `'capitulo-uno'` (tipado `Slug`). Su propósito es la **navegación intra-documento** en `/read/:slug`: anclas estables para la tabla de contenidos y deep-links (`/read/la-obra#capitulo-uno`), a consumir por la navegación multi-sección (Slice 2). Es complementario a `?section=N` ([§7](#7-contrato-del-endpoint)): el ancla desplaza dentro del documento **ya cargado**; el query param trae **una porción** por request.

Casos límite documentados para Slice 2 (no resueltos acá):

- **Títulos duplicados** producen anclas duplicadas — la deduplicación (p. ej. sufijo `-2`) es responsabilidad de la capa que renderiza la navegación.
- **Secciones sin `chapterTitle`** no tienen ancla derivable — el fallback (p. ej. ancla posicional `#seccion-3`) se decide al construir la navegación.

**`IsoDateTime` — reutilizado, no duplicado.** `publishedAt` usa el tipo `IsoDateTime` ya existente en `src/app/utils/date.utils.ts`; #1852 le suma la factory validadora `createIsoDateTime(value: string): IsoDateTime`. No se crea un segundo símbolo ni se brandea el tipo existente (lo consumen `Author`/`AuthorProfile` sin factory; migrarlos excede este issue).

> **Corte importante — qué hace `createSanitizedHtml` hoy:** brandea + valida no-vacío un string que el llamador **garantiza** que ya pasó por el pipeline compartido de sanitización. **No ejecuta sanitización.** El pipeline real (`unified`/`rehype-sanitize`, [§9](#9-allow-list-de-sanitización)) se implementa en Slice 1, donde vive su único caller (el mapper del ACL). Ídem el cómputo de reading time desde markdown ([§5](#5-helper-de-reading-time)): la conversión markdown→texto plano es de Slice 1; la aritmética es de #1852.

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

**Contrato para Slice 1** (no implementado — requiere `unified`/`remark-parse`/`mdast-util-to-string`, que no se instalan sin caller real):

```typescript
export function countWords(markdown: Markdown): WordCount;
// mdast-util-to-string sobre el AST de remark-parse → split por whitespace → createWordCount
```

El flujo completo por sección: `body (Markdown) → countWords → WordCount → deriveReadingTime → ReadingTime`; el total del agregado: `sumReadingTimes(sections.map(s => s.readingTime))` (derivado en `createLiteraryWork`).

---

## 6. Repository: puerto, adaptador y doble

Contrato para Slice 1 (patrón `fetch*`/`get*` de [`sanity-acl.md`](../.claude/references/sanity-acl.md) + Qualified Implementation de [`clean-architecture.md`](../.claude/references/clean-architecture.md)):

```typescript
// Puerto (nombre limpio)
interface LiteraryWorkRepository {
	fetchBySlug(slug: string): Promise<RawLiteraryWork | null>; // crudo de GROQ, tipado por typegen
}

// Adaptador real: SanityLiteraryWorkRepository implements LiteraryWorkRepository (GROQ)
// Doble de test:  InMemoryLiteraryWorkRepository implements LiteraryWorkRepository
//                 (Fake* de almacenamiento — taxonomía Stub*/Fake*/Spy*, nunca Mock*)
```

Firma del módulo backend (service, mapea vía ACL):

```typescript
getLiteraryWorkBySlug(slug: string, section?: number): Promise<LiteraryWork>;
```

El mapper del ACL (`src/api/_utils/`) es responsable de: validar invariantes contra el shape `optional` de typegen, correr el pipeline MD→HTML sobre body y epígrafes, derivar reading times, y **normalizar la autoría anónima** ([§10](#10-autoría-0n-y-obra-anónima)).

---

## 7. Contrato del endpoint

### `GET /literary-work/:slug[?section=N]`

| Aspecto         | Contrato                                                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Params          | `{ slug: string }` — validación zod con el `slugSchema` existente de `src/api/schemas/common.schemas.ts` (reutilizar, no duplicar)                     |
| Query params    | `section?: number` — **1-based**, opcional. Validación zod: entero `>= 1`. Ausente ⇒ la obra completa; presente ⇒ solo esa sección (ver abajo)         |
| Respuesta 200   | `LiteraryWork` (JSON; forma idéntica a la interfaz de dominio de [§2](#2-modelo-de-dominio-y-vistas-polimórficas))                                     |
| Registro        | `apiRoutes.route('/literary-work', literaryWorkController)` en `src/api/routes.ts`                                                                     |
| Colección Bruno | `docs/api/bruno/literary-work/get-literary-work-by-slug.bru` — se crea **en el mismo PR** que el endpoint (DoD de Slice 1); este contrato es su fuente |

### Semántica de `?section=N` (obtención parcial)

El consumidor decide por query param si obtiene **toda la obra o un capítulo**:

- **Sin `section`**: `content` transporta **todas** las secciones. `sectionCount === content.length`.
- **Con `section=N`**: `content` transporta **únicamente la sección N** (1-based). El resto de la respuesta describe la obra completa: `totalReadingTime` sigue siendo el **total de la obra** (no el de la sección) y `sectionCount` el total real — con ellos el cliente pagina/navega (`N` de `sectionCount`) sin otra request de metadata. La respuesta parcial es una **proyección**: `sectionCount > content.length` es el indicador de parcialidad.
- **`N` fuera de rango** (`N > sectionCount`): mismo tratamiento que el recurso inexistente (ver nota abierta abajo) — no responde 200 con `content` vacío, porque violaría la invariante `content.length >= 1`.

El SSR de `/read/:slug` (Slice 1) consume la forma completa; la obtención por sección habilita la navegación multi-capítulo (Slice 2) sin transferir la obra entera, y se apoya en la materialización **por sección** ([§8](#8-estrategia-de-materialización)).

> **Nota abierta para Slice 1 — slug inexistente / sección fuera de rango:** el comportamiento vigente del módulo `story` ante slug no encontrado es que el service lanza `Error` genérico sin handler `onError` global en `routes.ts` → HTTP **500 sin body estructurado**, no un 404 JSON. Slice 1 debe decidir si `literary-work` introduce un 404 propio (y sienta el precedente) o mantiene paridad con `story` y se difiere el manejo de errores a un issue transversal. La decisión que se tome aplica por igual a ambos casos (slug y sección). Es una decisión **diferida a propósito**, no una omisión de este diseño.

---

## 8. Estrategia de materialización

Decisión T1b del epic; implementación en **Slice 4**. Hasta entonces rige **transform-on-read** (el ACL transforma en cada lectura, Slice 1).

| Elemento     | Diseño                                                                                                                                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Trigger      | Webhook de Sanity → función serverless ante cambio de documento                                                                                                                                                                      |
| Persistencia | **Documento derivado separado** del source: `{ HTML por sección, readingTimes, stamp de revisión / hash de contenido de origen }`. Separado para esquivar el loop de `_rev` (patchear derivados no debe re-disparar la regeneración) |
| Pipeline     | **El mismo código del ACL** (función pura compartida) — una sola implementación de MD→HTML                                                                                                                                           |
| Fallback     | Si el derivado falta o está stale respecto del hash/rev: el ACL transforma on-the-fly esa vez y dispara la regeneración                                                                                                              |
| Regen masivo | Tarea/función para re-materializar todo ante cambio de allow-list o de estrategia de imágenes                                                                                                                                        |
| Source doc   | `literaryWork` **no persiste** `approximateReadingTime` ni HTML — solo markdown                                                                                                                                                      |

**Granularidad por sección y `?section=N`.** El documento derivado persiste los transformados **por sección** (HTML + `readingTime` de cada una, más los agregados de la obra: `totalReadingTime`, `sectionCount`). Eso hace que servir `GET /literary-work/:slug?section=N` ([§7](#7-contrato-del-endpoint)) sea una lectura directa de la porción N del derivado — sin recomputar la obra completa — y que la respuesta parcial conserve los metadatos totales sin costo extra. El webhook regenera el derivado por documento; la invalidación de caché de una obra cubre todas sus secciones de una vez (una edición cambia el hash de origen → todas las porciones vuelven a servirse frescas).

---

## 9. Allow-list de sanitización

Constante **compartida** (única fuente de verdad para el pipeline del ACL de Slice 1 y la materialización de Slice 4). Base: el schema por defecto de `rehype-sanitize` (`hast-util-sanitize`, basado en la sanitización de GitHub), con esta extensión explícita:

| Tag     | Atributos permitidos                                             | Motivo                                                                                                                                                      |
| ------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<img>` | `src`, `srcset`, `width`, `height`, `loading`, `decoding`, `alt` | Las imágenes del contenido son assets de Sanity; `width`/`height` recuperados del `assetId-WxH` de la URL evitan CLS; `loading`/`decoding` para performance |

El **rewrite de imágenes** (`cdn.sanity.io` → `<img srcset width height loading decoding>`) ocurre en un plugin `rehype` custom que corre **antes** de `rehype-sanitize` en el pipeline, de modo que la salida final siempre pasa por la allow-list. Contrato documentado acá; implementación en Slice 1.

Reglas duras del pipeline:

- Todo HTML servido al frontend pasó por `rehype-sanitize` con esta allow-list — **sin excepciones** (body y epígrafes por igual).
- Scripts, estilos inline, iframes y handlers de eventos quedan **fuera** (no están en el schema por defecto y no se agregan).
- Cambiar la allow-list exige regen masivo de derivados (ver [§8](#8-estrategia-de-materialización)) y actualizar los tests de XSS del pipeline.

---

## 10. Autoría 0..N y obra anónima

### Schema (CMS)

- `authors: array<reference → author>`, sin `required`, con `.unique()`. El **orden expresa prioridad** (primer autor = principal).
- **Default de alta en Studio:** `initialValue` a nivel documento pre-carga `authors[0]` con la referencia al author de slug `anonimo` (`_id: a9af4fc4-25d4-48c0-8776-5b0a14c758c5`, idéntico en los datasets production/staging/development; name "Anónimo"). El editor arranca con una atribución válida y visible en lugar de un vacío ambiguo, y la reemplaza cuando corresponde.

### Dominio — representación canónica: `authors: []`

**La única señal de "obra anónima" que el dominio conoce es `authors.length === 0`.** El mapper del ACL (Slice 1) **filtra** cualquier referencia al author `anonimo` antes de construir el array que recibe `createLiteraryWork`; el dominio nunca ve esa referencia especial.

Justificación:

- **Menor superficie de invariante.** Si el dominio aceptara tanto `[]` como `[ref(anonimo)]`, todo consumidor de `authors` (componentes, JSON-LD, policies futuras) tendría que conocer el `_id` mágico para no tratar a "Anónimo" como autor real.
- **El `_id` de Sanity es infraestructura**, no dominio. Que el dominio compare `author._id === 'a9af…'` sería exactamente la fuga que el ACL existe para prevenir.
- **La ergonomía de alta no se pierde:** el `initialValue` sigue en el schema; solo cambia lo que el ACL construye a partir del dato, no la experiencia de edición.

Policy pura (único punto de verdad de la regla, `literary-work.model.ts`):

```typescript
export function isAnonymous(authors: readonly unknown[]): boolean; // authors.length === 0
```

Consecuencia para JSON-LD (Slice 3): obra anónima ⇒ **omitir** la propiedad `author` de schema.org (no inventar un `Person` "Anónimo"); multi-autor ⇒ array de `Person`.

---

## 11. Corte de #1852 vs. Slice 1 (#1853)

| Pieza                                                                                                       | #1852 (este issue)                                              | Slice 1 (#1853) |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | --------------- |
| Doc de diseño (este archivo)                                                                                | ✅ Código de contratos cerrados                                 | Consume         |
| Schema `literaryWork` definitivo + registro + `markdownSchema()` + typegen                                  | ✅ Implementado                                                 | Consume         |
| VOs (`Slug`, `WordCount`, `ReadingTime`, `Markdown`, `SanitizedHtml`, `ChapterTitle`) + `createIsoDateTime` | ✅ Implementados con specs                                      | Consume         |
| Aritmética de reading time (`deriveReadingTime`, `sumReadingTimes`)                                         | ✅ Implementada con specs                                       | Consume         |
| Agregado `LiteraryWork` + secciones + vistas + `createLiteraryWork` + `isAnonymous`                         | ✅ Implementados con specs                                      | Consume         |
| `countWords` (markdown → texto plano, `mdast-util-to-string`)                                               | Contrato ([§5](#5-helper-de-reading-time))                      | ⚙️ Implementa   |
| Pipeline MD→HTML (`unified`/`rehype-sanitize`) + allow-list como constante + rewrite de imágenes            | Contrato ([§9](#9-allow-list-de-sanitización))                  | ⚙️ Implementa   |
| Normalización de autoría anónima en el mapper                                                               | Contrato ([§10](#10-autoría-0n-y-obra-anónima))                 | ⚙️ Implementa   |
| Repository (puerto + `Sanity*` + `InMemory*`) + módulo backend                                              | Contrato ([§6](#6-repository-puerto-adaptador-y-doble))         | ⚙️ Implementa   |
| Endpoint `GET /literary-work/:slug` + `.bru`                                                                | Contrato ([§7](#7-contrato-del-endpoint))                       | ⚙️ Implementa   |
| Frontend (`LiteraryWorkApi`, ruta `/read/:slug`, página SSR)                                                | —                                                               | ⚙️ Implementa   |
| Materialización de derivados                                                                                | Contrato ([§8](#8-estrategia-de-materialización))               | Slice 4         |
| JSON-LD                                                                                                     | Consecuencia documentada ([§10](#10-autoría-0n-y-obra-anónima)) | Slice 3         |
