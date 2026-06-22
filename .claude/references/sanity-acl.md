# Anti-Corruption Layer (ACL): GROQ → repository → mapper → modelo de dominio

> **Carga esta referencia** al trabajar sobre el backend (`src/api/`): cualquier lectura/escritura
> de Sanity, queries GROQ, mappers o tipos de dominio. Es el **patrón central** de cuentoneta.
>
> Relacionadas: [`clean-architecture.md`](clean-architecture.md) (capas y regla de dependencia) ·
> [`domain-model.md`](domain-model.md) (Story / Author / Storylist / Resource).

---

## Por qué existe el ACL

Sanity expone su contenido vía **GROQ**, y el typegen (`pnpm sanity:run-typegen-generator`) genera
tipos a partir del schema y de cada query (`StoryBySlugQueryResult`, `AuthorBySlugQueryResult`,
`StoriesByAuthorSlugQueryResult`, …). Esos tipos describen el **shape crudo de Sanity**: campos
opcionales/nullables, referencias sin resolver, imágenes como `SanityImageSource`, bloques
`BlockContent`, `coalesce(...)` con defaults, etc.

**Regla dura:** el resultado crudo de GROQ (los tipos `*QueryResult`) **nunca** se filtra al
frontend. El frontend consume únicamente el **modelo de dominio** (`Story`, `Author`, `Storylist`,
`Resource`, `Tag`, …, definidos en `@models/*`), que es **independiente del shape de Sanity**.

El **Anti-Corruption Layer** son los **mappers**: funciones puras que traducen el resultado crudo de
Sanity al modelo de dominio. Si mañana se cambia el CMS o se reorganiza una query, el blast radius
queda contenido en el mapper; el dominio y el frontend no se enteran.

---

## El flujo central

```
                 GROQ query                 client.fetch(query, params)
   _queries/story.query.ts  ───────────────▶  repository.fetch*()
                                                   │  (resultado CRUDO de Sanity:
                                                   │   tipos generados *QueryResult)
                                                   ▼
                                              service.get*()
                                                   │  invoca el mapper (ACL)
                                                   ▼
                                  mapX(rawResult): DomainType
                              (mapper / ACL en _utils/functions.ts)
                                                   │  (modelo de dominio: Story, Author, …)
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

El módulo **story** (`src/api/modules/story/`) es el ejemplo canónico. Todos los demás módulos
(`author`, `storylist`, `content`, `contributor`, `sitemap`) siguen la misma forma.

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
// story.repository.ts
import { client } from '../../_helpers/sanity-connector';
import { storyBySlugQuery, allStoriesQuery /* … */ } from '../../_queries/story.query';

export async function fetchStoryBySlug(slug: string) {
	return client.fetch(storyBySlugQuery, { slug });
}

export async function fetchStories(start: number, end: number) {
	return client.fetch(allStoriesQuery, { start, end });
}
```

Notá que `fetch*` **no anota** un tipo de retorno: el tipo lo infiere el typegen a partir de la
query (`StoryBySlugQueryResult`, etc.). Ese tipo crudo es justo lo que el mapper recibe como entrada.

### Service — `get*()` (mapea al dominio)

```typescript
// story.service.ts
export async function getStoryBySlug(slug: string): Promise<Story> {
	const result = await fetchStoryBySlug(slug);

	if (!result) {
		throw new Error(`Story with slug ${slug} not found`);
	}

	return await mapStoryContent(result); // ← ACL: crudo → dominio (Story)
}
```

El service es el **único** lugar donde el resultado crudo y el modelo de dominio coexisten. A partir
de su `return`, solo circula dominio.

### Controller — Hono + zValidator

```typescript
// story.controller.ts
const storyController = new Hono();

storyController.get('/:slug', zValidator('param', slugSchema), async (c) => {
	const { slug } = c.req.valid('param');
	const result = await getStoryBySlug(slug);
	return c.json(result);
});
```

- Validación de path params / query con **`@hono/zod-validator`** (`zValidator('param', …)`,
  `zValidator('query', …)`). Los path params usan `:slug` (estilo Hono).
- **Orden de rutas:** las rutas específicas van **antes** del wildcard `/:slug` (p. ej.
  `/most-read`, `/author/:slug/navigation`, `/author/:slug`, luego `/`, y al final `/:slug`).
- El controller no conoce Sanity ni los mappers: solo valida, llama al service y serializa.

---

## Los mappers (la ACL en sí)

Viven en **`src/api/_utils/functions.ts`** (y archivos `*.functions.ts` vecinos como
`media-sources.functions.ts`). Son **funciones puras**: misma entrada → misma salida, sin efectos
secundarios ni I/O.

```typescript
// _utils/functions.ts
export function mapAuthor(rawAuthorData: NonNullable<AuthorBySlugQueryResult>): Author {
	const resources = mapResources(rawAuthorData.resources);
	const biography = mapAuthorBiography(rawAuthorData.biography);

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
  `StorylistTeasersQueryResult`, sub-queries derivadas como
  `NonNullable<StorylistQueryResult>['stories'][0]['author']`). **Salida = tipo de dominio**
  (`Author`, `AuthorTeaser`, `Resource`, `Tag`, …).
- **Normalización de nullables:** `?? undefined`, `?? ''`, `?? []` para colapsar los opcionales de
  Sanity a la forma que el dominio espera.
- **Composición:** un mapper grande delega en otros (`mapStoryContent` usa `mapAuthor`,
  `mapResources`, `mapTags`, `mapBlockContentToTextParagraphs`, `mapMediaSources`). `mapStoryContent`
  y `mapAuthor` propagan los **tags** del cuento y del autor vía `mapTags`; los mappers de teasers
  devuelven `tags: []` (sus queries no proyectan los tags completos).
- **`BlockContent` → texto de dominio:** `mapBlockContentToTextParagraphs(content)` filtra los
  bloques `_type === 'block'` a `TextBlockContent[]`.

Mappers principales (no exhaustivo): `mapAuthor`, `mapAuthorTeaser`, `mapAuthorBiography`,
`mapResources`, `mapTags`, `mapStoryContent`, `mapStoryTeaser`, `mapStoryTeaserWithAuthor`,
`mapStoryNavigationTeaser`, `mapStoryNavigationTeaserWithAuthor`, `mapLandingPageContent`,
`mapContentCampaigns`.

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

export function urlForWithAutoFormat(source: SanityImageSource): string {
	// idéntico, pero .auto('format').url() para servir el formato óptimo (WebP/AVIF)
}
```

Los mappers invocan `urlFor` / `urlForWithAutoFormat` y exponen al dominio un `imageUrl: string`,
nunca el `SanityImageSource` crudo.

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

- **`SanityStoryRepository`** — implementación real contra GROQ/`@sanity/client` (lo que hoy hacen
  las funciones `fetch*`).
- **`InMemoryStoryRepository`** — implementación de prueba con datos en memoria, para tests rápidos y
  deterministas sin tocar Sanity.

El service dependería del **puerto** (interfaz), no de la implementación concreta, y la elección se
resolvería vía un **contenedor de DI**. El directorio **`src/api/di/`** ya existe **vacío** como
placeholder de esa dirección (#1503). Mientras tanto, rige el patrón de funciones `fetch*()` /
`get*()` descripto arriba; **no** introducir clases de repositorio ni DI salvo que el issue lo pida.

---

## Dirección futura: OpenAPIHono (no adoptado)

El backend es hoy **Hono plano** (`new Hono()` + `@hono/zod-validator`). La dirección objetivo, para
paridad con el starter, es migrar a **OpenAPIHono** (`@hono/zod-openapi`: `createRoute` /
`registerRoute` + spec servida en `/api/openapi.json`) — ver **#1531**.

Hasta su adopción, rige el patrón Hono plano descripto en esta referencia y en
[`CLAUDE.md` → Backend API](../../CLAUDE.md#backend-api-hono--sanity). **No** generar código
OpenAPIHono salvo que el issue lo indique.
