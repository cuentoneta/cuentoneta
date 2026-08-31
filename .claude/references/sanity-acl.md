# Anti-Corruption Layer (ACL): GROQ → repository → mapper → modelo de dominio

> **Carga esta referencia** al trabajar sobre el backend (`src/api/`): cualquier lectura/escritura
> de Sanity, queries GROQ, mappers o tipos de dominio. Es el **patrón central** de cuentoneta.
>
> Relacionadas: [`clean-architecture.md`](clean-architecture.md) (capas y regla de dependencia) ·
> [`domain-model.md`](domain-model.md) (Author / Collection / LiteraryWork / Resource).

---

## Por qué existe el ACL

Sanity expone su contenido vía **GROQ**, y el typegen (`pnpm sanity:run-typegen-generator`) genera
tipos a partir del schema y de cada query (`AuthorBySlugQueryResult`, `LiteraryWorkBySlugQueryResult`,
`CollectionBySlugQueryResult`, …). Esos tipos describen el **shape crudo de Sanity**: campos
opcionales/nullables, referencias sin resolver, imágenes como `SanityImageSource`,
`coalesce(...)` con defaults, etc.

**Regla dura:** el resultado crudo de GROQ (los tipos `*QueryResult`) **nunca** se filtra al
frontend. El frontend consume únicamente el **modelo de dominio** (`Author`, `LiteraryWork`,
`Collection`, `Resource`, `Tag`, …, definidos en `@models/*`), que es **independiente del shape de
Sanity**.

El **Anti-Corruption Layer** son los **mappers**: funciones puras que traducen el resultado crudo de
Sanity al modelo de dominio. Si mañana se cambia el CMS o se reorganiza una query, el blast radius
queda contenido en el mapper; el dominio y el frontend no se enteran.

> **Alcance de los ejemplos de este archivo.** El pipeline se ejemplifica con el módulo `author`
> (`src/api/modules/author/`), hoy el ejemplo canónico de este patrón, con el ACL como **mappers
> puros en `_utils/*.functions.ts`** (ver más abajo). `contributor` y `sitemap` siguen la misma forma
> general (repository con `fetch*()` desacoplado del mapeo), aunque `contributor` resuelve su propio
> mapeo inline en vez de delegar en `_utils/`. `LiteraryWork`, `Collection` y `content` **divergen a
> propósito**: su ACL (la traducción raw Sanity → dominio) vive **dentro del repository** como
> métodos privados, no como funciones en `_utils/`. No es una variación accidental — es la
> **dirección arquitectónica objetivo**: el repository es dueño de su propia ACL y entrega el
> agregado de dominio listo; el service recibe dominio, sin una capa de mappers intermedia.
>
> **Split de archivos de los módulos que ya divergen** — tres archivos, no uno: `<dominio>.repository.ts`
> (el puerto, la interfaz), `<dominio>.repository.sanity.ts` (el adaptador, con la ACL en privados) y
> `<dominio>.repository.mock.ts` (el doble en memoria). Los errores tipados van en
> `<dominio>.errors.ts`. El cliente de Sanity se inyecta por el constructor con un default, que es el
> seam por el que los specs pasan un doble sin mockear el módulo.
>
> El módulo `literary-work` está completo de punta a punta (repository → service → controller), con
> el contrato en [`docs/LITERARY_WORK_DESIGN.md`](../../docs/LITERARY_WORK_DESIGN.md) §6.
> `collection` y `content` también, con la misma forma: la ACL vive dentro de su repository, y el
> service y el controller quedan del lado del dominio. Los ejemplos de código de abajo se conservan
> sobre `author`, que sigue vigente para ese patrón.
>
> **Qué sí se comparte desde `_utils/`.** La divergencia no es aislarse: los repositories que la
> adoptaron siguen usando las primitivas genéricas de traducción (`mapTags`, `mapAuthorTeaser`,
> `mapResources`, `urlFor`, `mapMediaSources`, `mapMediaTeasers`), que no son de ningún agregado en
> particular — el par de multimedia son dos porque las vistas completa y de teaser traen distinto. Lo que
> no se delega es el **ensamblado del agregado**. Cada primitiva compartida recibe la variante nueva
> en su tipo unión de entrada; si una proyección diverge, el mapeo deja de compilar en vez de fallar
> en silencio.
>
> **Un módulo que diverge también puede compartir ACL con otro, cuando los dos proyectan el mismo
> agregado ajeno.** `src/api/modules/collection/collection-teaser.acl.ts` (`mapSanityCollectionTeaser`,
> `mapSharedCollectionFields`, `resolveCollectionImagery`) no es una primitiva genérica de `_utils/`
> ni el ACL privado de un solo repository: es el ensamblado del teaser de `Collection`, y lo
> consumen tanto `SanityCollectionRepository` (el catálogo y el detalle de colecciones) como
> `SanityContentRepository` (las colecciones destacadas de la landing) porque las dos dereferencian
> una `Collection` y necesitan construir exactamente la misma vista. Vive en el módulo de `collection`
> — dueño del agregado que describe — y no en el de `content`, que solo lo consume.
>
> **`defineQuery` exige literales.** El typegen parsea el string de la llamada, así que una constante
> concatenada o un template interpolado dejan de emitir tipos. Por eso dos queries con la misma
> proyección **repiten el literal** en vez de compartirlo, y lo que impide que se desincronicen es el
> tipo: el privado que las mapea se tipa contra una y recibe los resultados de la otra.

---

## El flujo central

```
                 GROQ query                 client.fetch(query, params)
   _queries/author.query.ts ───────────────▶  repository.fetch*()
                                                   │  (resultado CRUDO de Sanity:
                                                   │   tipos generados *QueryResult)
                                                   ▼
                                              service.get*()
                                                   │  invoca el mapper (ACL)
                                                   ▼
                                  mapX(rawResult): DomainType
                              (mapper / ACL en _utils/functions.ts)
                                                   │  (modelo de dominio: Author, LiteraryWork, …)
                                                   ▼
                                            controller (Hono)
                                                   │  c.json(result)
                                                   ▼
                                              frontend
```

| Capa           | Archivo                       | Devuelve / responsabilidad                                              |
| -------------- | ----------------------------- | ----------------------------------------------------------------------- |
| **GROQ**       | `_queries/<dominio>.query.ts` | Query con `defineQuery(...)`; los `*QueryResult` salen del typegen      |
| **Repository** | `<dominio>.repository.ts`     | `fetch*()` → `client.fetch(query, params)`; **resultado CRUDO** Sanity  |
| **Mapper/ACL** | `_utils/functions.ts`         | `mapX(raw): DomainType`; funciones **puras**; helpers de imagen         |
| **Service**    | `<dominio>.service.ts`        | `get*()`: llama al repository y **mapea** al dominio; lógica de negocio |
| **Controller** | `<dominio>.controller.ts`     | Rutas Hono + `zValidator`; llama al service y responde `c.json(...)`    |

El módulo **author** (`src/api/modules/author/`) es el ejemplo canónico. `contributor` y `sitemap`
siguen la misma forma general; `literary-work`, `collection` y `content` divergen a propósito (ver la
nota de arriba).

---

## Naming de capas (no negociable)

- **Repository → `fetch*()`** para todas las lecturas. Devuelve el resultado **crudo** de la query
  de Sanity, sin mapear. Una función `fetch*` = una query GROQ con sus params.
- **Service → `get*()`** (y `update*()` para escrituras). Envuelve al repository y **mapea** al
  modelo de dominio vía la ACL. Acá vive la lógica de negocio (validación de existencia, paginación,
  composición de varias fuentes).
- El cliente de Sanity se importa siempre desde **`_helpers/sanity-connector`**
  (`import { client } from '../../_helpers/sanity-connector'`). No instanciar `client` ad-hoc.

### Repository — `fetch*()` (crudo)

```typescript
// author.repository.ts
import { client } from '../../_helpers/sanity-connector';
import { authorBySlugQuery, authorsQuery } from '@queries/author.query';

export async function fetchAuthorBySlug(slug: string) {
	return client.fetch(authorBySlugQuery, { slug });
}

export async function fetchAllAuthors() {
	return client.fetch(authorsQuery);
}
```

Notá que `fetch*` **no anota** un tipo de retorno: el tipo lo infiere el typegen a partir de la
query (`AuthorBySlugQueryResult`, `AuthorsQueryResult`). Ese tipo crudo es justo lo que el mapper
recibe como entrada.

### Service — `get*()` (mapea al dominio)

```typescript
// author.service.ts
import { AuthorProfile, AuthorTeaser } from '@models/author.model';
import { mapAuthorProfile, mapAuthorTeaser } from '../../_utils/functions';
import { fetchAllAuthors, fetchAuthorBySlug } from './author.repository';

export async function getAuthorBySlug(slug: string): Promise<AuthorProfile> {
	const result = await fetchAuthorBySlug(slug);

	if (!result) {
		throw new Error(`Author with slug ${slug} not found.`);
	}

	return mapAuthorProfile(result);
}

export async function getAllAuthors(): Promise<AuthorTeaser[]> {
	const result = await fetchAllAuthors();

	if (!result) {
		throw new Error(`Could not fetch authors data.`);
	}

	return result.map((author) => mapAuthorTeaser(author));
}
```

El service es el **único** lugar donde el resultado crudo y el modelo de dominio coexisten. A partir
de su `return`, solo circula dominio.

### Controller — Hono + zValidator

```typescript
// author.controller.ts
const authorController = new Hono();

authorController.get('/', async (c) => {
	const result = await getAllAuthors();
	return c.json(result);
});

authorController.get('/:slug', zValidator('param', slugSchema), async (c) => {
	const { slug } = c.req.valid('param');
	const result = await getAuthorBySlug(slug);

	return c.json(result);
});
```

- Validación de path params / query con **`@hono/zod-validator`** (`zValidator('param', …)`,
  `zValidator('query', …)`). Los path params usan `:slug` (estilo Hono).
- **Orden de rutas:** las rutas específicas van **antes** del wildcard `/:slug` (p. ej.,
  en `literary-work`, `/` → `/update-most-read` → `/:slug`).
- El controller no conoce Sanity ni los mappers: solo valida, llama al service y serializa.

---

## Los mappers (la ACL en sí)

Viven en **`src/api/_utils/functions.ts`** (y archivos `*.functions.ts` vecinos como
`media-sources.functions.ts`). Son **funciones puras**: misma entrada → misma salida, sin efectos
secundarios ni I/O.

```typescript
// _utils/functions.ts
export function mapAuthor(
	rawAuthorData: Omit<NonNullable<AuthorBySlugQueryResult>, 'createdAt' | 'updatedAt'>,
): Author {
	const resources = mapResources(rawAuthorData.resources);
	// El campo es requerido en el schema (markdown): sin fallback a cadena vacía. `createMarkdown`
	// lanza si alguna vez llegara vacío, en lugar de dejar pasar un autor sin biografía.
	const biography = markdownToSanitizedHtml(createMarkdown(rawAuthorData.biography));

	return {
		_id: rawAuthorData._id,
		slug: rawAuthorData.slug,
		nationality: {
			country: rawAuthorData.nationality?.country,
			flag: urlFor(rawAuthorData.nationality.flag),
		},
		resources,
		imageUrl: urlFor(rawAuthorData.image),
		name: rawAuthorData.name,
		biography,
		bornOnYear: rawAuthorData.bornOnYear ?? undefined,
		diedOnYear: rawAuthorData.diedOnYear ?? undefined,
		// …
	};
}
```

Patrones que se repiten:

- **Entrada tipada con el resultado crudo de Sanity** (`NonNullable<AuthorBySlugQueryResult>`,
  sub-queries derivadas como
  `NonNullable<CollectionBySlugQueryResult>['literaryWorks'][number]['authors'][number]`). **Salida =
  tipo de dominio** (`Author`, `AuthorTeaser`, `Resource`, `Tag`, …).
- **Normalización de nullables:** `?? undefined`, `?? ''`, `?? []` para colapsar los opcionales de
  Sanity a la forma que el dominio espera. `biography` es la excepción deliberada: el schema la
  exige (`Rule.required()`), así que el mapper la pasa **sin** `?? ''` — un valor faltante es un
  bug de datos, no un estado válido a tolerar en silencio.
- **Un `Rule.required()` del schema no es una garantía sobre el dato persistido.** Esa validación
  rige la **edición** en el Studio, no el almacenamiento: un documento anterior a la regla, o
  escrito por script o migración, la esquiva sin dejar ninguna señal. El typegen, en cambio, deriva
  la nulabilidad del **schema declarado**, así que emite un tipo no-nullable en el que el mapper
  confía por default. Cuando esa confianza puede fallar, el mapper decide explícitamente entre
  **descartar** el dato (accesorio para el agregado) o **lanzar** (central para el agregado) — nunca
  dejar pasar el hueco en silencio. `mapResources` es el caso descartar: filtra, con
  `console.warn`, todo recurso cuyo `url` no sea un string no vacío, porque un recurso es
  información accesoria de `Author`/`LiteraryWork` y perder uno no invalida el agregado.
  `biography` (arriba) es el caso lanzar: sin ella, `Author` pierde su contenido central.
- **Descartar y lanzar no son las únicas salidas: cuando existe un valor por defecto honesto, va como
  `coalesce` en la query.** Es lo que hacen `badLanguage` (a `false`) y `originalPublication` (a `''`)
  en las proyecciones de `LiteraryWork`. La condición es que el valor sea **verdadero**, no un
  relleno — `totalReadingTime` y `content[].readingTime` quedan deliberadamente sin `coalesce`,
  porque un `0` afirmaría "cero minutos de lectura" sobre un cuerpo de miles de caracteres, y un dato
  inventado es peor que una ausencia que se puede detectar. Ahí la decisión vuelve al borde, que
  falla nombrando el campo que falta.
  El corolario práctico: **la decisión es por campo, no global**, y una misma propiedad tiene que
  resolverse igual en todas las proyecciones que la traen. Cuando una la protege y otra no, el mismo
  campo llega distinto según por dónde se lo pida — un spec de contrato sobre las queries es lo que
  vuelve visible esa asimetría en el diff en lugar de dejarla para un censo manual.
- **Qué campos incumple hoy el dato lo mide `pnpm required-fields:sweep`**, que deriva los requeridos
  del schema versionado y cuenta los documentos que no los cumplen. Reporta, no bloquea: lo corre un
  job programado → [`scripts.md`](scripts.md).
- **Composición:** un mapper puede delegar en otros — `mapAuthorProfile` reutiliza `mapAuthor`, que a
  su vez delega en `mapResources` y `mapTags`. Los mappers de teaser (`mapAuthorTeaser`) devuelven
  `resources: []`/`tags: []` porque sus queries no proyectan esos campos completos.
- **Markdown → `SanitizedHtml`:** `markdownToSanitizedHtml(createMarkdown(raw))` (`@utils/markdown-pipeline.utils`)
  es el pipeline que usa `mapAuthor` para `biography`. Es el mismo pipeline que consume el módulo
  `literary-work` para su contenido en Markdown (ver la nota de divergencia arriba).

Mappers principales (no exhaustivo): `mapAuthor`, `mapAuthorProfile`, `mapAuthorTeaser`,
`mapResources`, `mapTags`, `mapContentCampaigns`. Los mappers de
la landing (`mapLandingPageContent`, `mapHighlightedAuthors`, la vista de navegación de obra) no
viven acá: son métodos privados de `SanityContentRepository`, siguiendo la divergencia descripta
arriba.

### Helpers de imagen (también parte de la capa de mappers)

La conversión de imágenes de Sanity a URLs es traducción de shape → dominio, así que vive **en la
capa de mappers**, no en componentes ni en el repository:

```typescript
export function urlFor(source: SanityImageSource): string {
	if (!source) {
		console.warn('urlFor: Se recibió source vacío o nulo');
		return '';
	}
	try {
		return createImageUrlBuilder(client).image(source).url();
	} catch (error) {
		console.error('urlFor: Error al construir URL de imagen', { error, source: JSON.stringify(source) });
		return '';
	}
}
```

Los mappers invocan `urlFor` y exponen al dominio un `imageUrl: string`, nunca el
`SanityImageSource` crudo.

**La URL sale del ACL sin parámetros de transformación.** El tamaño, el formato y la calidad los
agrega el `IMAGE_LOADER` que la aplicación registra en `app.config.ts`
(`src/app/providers/sanity-image-loader.ts`), que es quien conoce la caja donde la imagen se pinta —
el ACL no: la misma portada alimenta una tarjeta chica y el fondo a ancho completo de un hero.
Agregar un parámetro acá lo **duplica** en la URL final, porque el loader corre igual sobre lo que
el mapper emitió.

---

## Regla de mantenimiento (mismo PR)

> Al cambiar una **query GROQ** o un **tipo generado de Sanity**, actualizar el **mapper**
> correspondiente y el **tipo de dominio** en el **MISMO PR**.

Secuencia típica al tocar una query:

1. Editar la query en `_queries/<dominio>.query.ts`.
2. Re-extraer schema y regenerar tipos: `pnpm sanity:extract-schema` →
   `pnpm sanity:run-typegen-generator` (cambian los `*QueryResult`).
3. Ajustar el/los `mapX(...)` en `_utils/functions.ts` para consumir el nuevo shape crudo.
4. Si cambió la forma del dominio, actualizar el modelo en `@models/*`.
5. Correr el [scan de impacto en documentación](../../CLAUDE.md#scan-de-impacto-en-documentación):
   actualizar `docs/`, `CLAUDE.md` y `.claude/references/` que referencien esos contratos.

Como los mappers son puros y tienen tipos de dominio explícitos en su firma, TypeScript marca de
inmediato dónde el nuevo shape crudo dejó de encajar.

---

## Dirección DDD: repositorio como puerto + DI (#1503)

Hoy el repository es un **módulo de funciones** (`fetch*()`) acoplado directamente al `client` de
Sanity. La dirección objetivo (ver [`clean-architecture.md`](clean-architecture.md), "Qualified
Implementation") es invertir esa dependencia con un **puerto de repositorio** y dos
implementaciones intercambiables:

- **`SanityAuthorRepository`** — implementación real contra GROQ/`@sanity/client` (lo que hoy hacen
  las funciones `fetch*`).
- **`InMemoryAuthorRepository`** — implementación de prueba con datos en memoria, para tests rápidos
  y deterministas sin tocar Sanity.

El service dependería del **puerto** (interfaz), no de la implementación concreta, y la elección se
resolvería vía un **contenedor de DI**. Esa dirección está registrada en **#1503**, sin estructura
creada todavía en el repo. Mientras tanto, rige el patrón de funciones `fetch*()` /
`get*()` descripto arriba para `author`, `contributor` y `sitemap`; **no** introducir clases de
repositorio ni DI salvo que el issue lo pida.

`LiteraryWork` ya adoptó esta dirección — puerto (`LiteraryWorkRepository`) + adaptador
(`SanityLiteraryWorkRepository`) + doble (`InMemoryLiteraryWorkRepository`), ver
`docs/LITERARY_WORK_DESIGN.md` §6 —, pero con una divergencia adicional respecto de este patrón:
la ACL (traducción raw → dominio) no queda en `_utils/functions.ts`, sino **dentro del repository**,
como métodos privados de `SanityLiteraryWorkRepository`. El service (`getLiteraryWorkBySlug`) recibe
el dominio ya mapeado y elige la implementación del repository por parámetro (default: la de
Sanity) — eso es lo que permite testearlo con el doble en memoria sin contenedor de DI.

`collection` y `content` siguen la misma forma: puerto (`CollectionRepository` / `ContentRepository`),
adaptador (`SanityCollectionRepository` / `SanityContentRepository`, con la ACL en privados) y doble
en memoria (`InMemoryCollectionRepository` / `InMemoryContentRepository`). `content` es el caso que
además **consume** la ACL de otro repository: para las colecciones destacadas de la landing reutiliza
`mapSanityCollectionTeaser` de `collection/collection-teaser.acl.ts` en vez de reensamblar el teaser
por su cuenta — ver la nota de "qué sí se comparte" al principio de este documento.

---

## Dirección futura: OpenAPIHono (no adoptado)

El backend es hoy **Hono plano** (`new Hono()` + `@hono/zod-validator`). La dirección objetivo, para
paridad con el starter, es migrar a **OpenAPIHono** (`@hono/zod-openapi`: `createRoute` /
`registerRoute` + spec servida en `/api/openapi.json`) — ver **#1531**.

Hasta su adopción, rige el patrón Hono plano descripto en esta referencia y en
el bullet **Backend** de [`CLAUDE.md` → Arquitectura (resumen)](../../CLAUDE.md#arquitectura-resumen). **No** generar código
OpenAPIHono salvo que el issue lo indique.
