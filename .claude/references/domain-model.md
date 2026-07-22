<!-- Fuente: adaptado de ResetShop/angular-nx-standalone-starter · .claude/references/domain-model.md -->

# Modelo de Dominio — Guía estratégica (DDD)

> **Propósito:** esta referencia es la **guía conceptual/objetivo** de Domain-Driven Design para La Cuentoneta. Documenta los patrones **estratégicos** de DDD (agregados + invariantes, bounded contexts, lenguaje ubicuo, domain events, policies puras, decisiones de consistencia, value objects) re-ejemplificados con el dominio real: **Story, Author, Storylist, Resource**.
>
> **Idioma:** la guía va en **español**; el **código siempre en inglés**.
>
> **Estado del proyecto — leer primero.** Hoy cuentoneta es **DDD-lite**: módulos organizados en capas (`controller → service → repository`) con un **ACL de mappers** sólido, pero los **repositorios están acoplados a Sanity** y no existen todavía clases de agregado, value objects, specification ni domain events como código. La implementación profunda de estos patrones es un **ROADMAP**, no el estado actual:
>
> - El **modelo de dominio descriptivo** (agregados, vistas polimórficas, value objects, lenguaje ubicuo) vive en [`docs/DOMAIN_MODEL.md`](../../docs/DOMAIN_MODEL.md).
> - Las **mejoras propuestas** (repository pattern desacoplado, domain events, specification) viven en [`docs/DDD_IMPROVEMENTS.md`](../../docs/DDD_IMPROVEMENTS.md).
> - El **issue de implementación** es **#1503**.
>
> Esta referencia es el **norte conceptual**; donde un patrón aún no esté implementado, se marca explícitamente como roadmap.

---

## Índice

1. [Estructura por bounded context](#estructura-por-bounded-context)
2. [Diseño orientado a interfaces](#diseño-orientado-a-interfaces)
3. [Vistas polimórficas (projection pattern)](#vistas-polimórficas-projection-pattern)
4. [Inmutabilidad](#inmutabilidad)
5. [Value Objects (Slug, ReadingTime, DateString)](#value-objects-slug-readingtime-datestring)
6. [Validación en runtime (Zod)](#validación-en-runtime-zod)
7. [El ACL como frontera (mappers)](#el-acl-como-frontera-mappers)
8. [Binding en componentes: solo dominio](#binding-en-componentes-solo-dominio)
9. [Patrones estratégicos](#patrones-estratégicos)
   - [Diseño de agregados](#diseño-de-agregados)
   - [Domain events](#domain-events)
   - [Type-state pattern](#type-state-pattern)
   - [Policies como funciones puras](#policies-como-funciones-puras)
   - [Principios de bounded context](#principios-de-bounded-context)
   - [Lenguaje ubicuo](#lenguaje-ubicuo)
   - [Decisiones de consistencia](#decisiones-de-consistencia)

---

## Estructura por bounded context

Organizá el modelo de dominio por **contexto acotado**. Cuentoneta define cuatro (ver `docs/DOMAIN_MODEL.md`): **Catálogo de Contenido** (`Story`, `Author`, `Resource`, `Media`, `Epigraph`), **Curación y Colecciones** (`Storylist`), **Administración del Proyecto** (`Contributor`) y **Página de Inicio** (`LandingPageContent`, `ContentCampaign`).

Hoy los tipos de dominio viven en `src/app/models/` (frontend) y la ACL/dominio del backend en `src/api/`. La estructura **objetivo** por contexto (roadmap #1503) agrupa, por agregado, el contrato + el modelo + el mapper + su spec:

```
<contexto>/                 # p. ej. content-catalog/, curation/
├── <entidad>.interface.ts   # contrato de dominio (Story, Author, …)
├── <entidad>.mapper.ts      # factory (hace cumplir las invariantes) + traducción desde Sanity
└── <entidad>.mapper.spec.ts
```

> **Roadmap:** la separación física por carpeta de contexto es objetivo. No inventar estos archivos al implementar features actuales; seguir la organización vigente (`src/app/models/`, `src/api/_utils/`) hasta que #1503 la migre.

---

## Diseño orientado a interfaces

Definí **interfaces** para las entidades de dominio. Los componentes dependen de esas interfaces, nunca de un tipo de infraestructura. Esto ya rige hoy: el frontend consume `Story`, `Author`, `Storylist`, `Resource` como contratos, nunca el shape crudo de Sanity.

```typescript
// story.interface.ts (objetivo: el contrato de dominio, sin clase que lo duplique)
export interface Story {
	readonly slug: string; // business key, invariante única
	readonly title: string;
	readonly author: Author; // un Story siempre tiene autor
	readonly approximateReadingTime: number; // minutos, >= 1
	hasMedia(): boolean;
}
```

**Sin prefijo `I`.** La interfaz de dominio lleva el **nombre limpio** (`Story`, `Author`, `Storylist`, `Resource`) y **nunca** el prefijo `I` — ver [`CLAUDE.md` → Naming](../../CLAUDE.md#naming). No se declara una clase homónima que duplique el contrato: quien hace cumplir las invariantes es la **factory** del mapper, que devuelve un objeto congelado tipado como la interfaz.

### Factory functions

La factory es el **único** punto de construcción de un objeto de dominio: ahí se validan las invariantes y se devuelve el contrato ya congelado. Es la evolución natural del rol que hoy cumplen los mappers del ACL (`mapAuthor`, `mapStoryContent`), que devuelven objetos planos tipados:

```typescript
// story.mapper.ts (objetivo: la factory valida las invariantes y devuelve el contrato)
interface CreateStoryOptions {
	slug: string;
	title: string;
	author: Author;
	paragraphs: TextBlockContent[];
	approximateReadingTime: number;
}

export function createStory(options: CreateStoryOptions): Story {
	if (!options.author) {
		throw new Error(`La historia "${options.slug}" no tiene autor`);
	}
	return Object.freeze({
		...options,
		hasMedia: () => options.paragraphs.some(isMediaBlock),
	});
}
```

**Reglas:**

- **Options object** para funciones con 3+ parámetros.
- Mantené las interfaces de options **privadas** (no exportadas) — TS infiere el tipo en el call site.
- Devolvé el **tipo de la interfaz** de dominio.
- La construcción pasa **siempre** por la factory: es el único lugar donde una invariante puede quedar sin verificar.

---

## Vistas polimórficas (projection pattern)

Un agregado expone **múltiples interfaces** para distintos casos de uso, optimizando la transferencia de datos. Este patrón **ya está implementado** y es central en cuentoneta:

```typescript
Story; // vista completa: párrafos, epígrafes, autor completo
StoryTeaser; // sin contenido pesado, para listados
StoryNavigationTeaser; // mínima, para navegación
StoryNavigationTeaserWithAuthor; // mínima + autor resumido

Author; // completa: biografía + recursos
AuthorTeaser; // resumida, para tarjetas

Storylist; // completa: stories con autor
StorylistTeaser; // sin stories
```

Cada vista es una proyección coherente del mismo agregado; el mapper correspondiente del ACL produce exactamente la vista que la query GROQ pidió.

---

## Inmutabilidad

Los objetos de dominio deben ser **inmutables** tras su construcción:

```typescript
export interface Story {
	readonly slug: string;
	readonly title: string;
	readonly author: Author;
	readonly resources: readonly Resource[];
	// …
}
```

- Marcá todas las propiedades `readonly`.
- Usá `readonly T[]` para arrays.
- Calculá los valores derivados en la factory, antes de congelar el objeto.
- `readonly` es una garantía **de tipos** (desaparece en runtime); el `Object.freeze` de la factory es la que sobrevive a la compilación.

El contenido enriquecido (`TextBlockContent` / Portable Text) **se trata como inmutable**: una vez producido por Sanity, no se modifica en la aplicación.

---

## Value Objects (Slug, ReadingTime, DateString)

Un **Value Object** no tiene identidad propia: representa un concepto del dominio, es inmutable y se compara por su contenido. Hoy cuentoneta usa **tipos primitivos** para estos conceptos (`slug: string`, `approximateReadingTime: number`, `bornOn?: DateString`). Promoverlos a value objects con auto-validación es **roadmap (#1503)**; abajo va el objetivo.

> **Primera implementación real (#1852):** el módulo `LiteraryWork` ya usa este patrón en producción — `Slug`, `WordCount`, `ReadingTime`, `Markdown`, `SanitizedHtml`, `ChapterTitle` viven en `src/app/models/*.model.ts` (branded types + factory `create*` que valida y lanza), con specs, más la factory `createIsoDateTime` en `src/app/utils/date.utils.ts`. Los contratos están en `docs/LITERARY_WORK_DESIGN.md` §4. `Story`/`Author` siguen sin brandear (roadmap #1503, sin cambios); los bloques "objetivo (roadmap)" de abajo describen ese estado pendiente.

### Slug — clave de negocio

`slug` es el patrón **Business Key** del proyecto: identificador amigable, único e **inmutable** que reemplaza al `_id` técnico de Sanity en URLs y rutas (`/story/el-aleph`, `/author/jorge-luis-borges`). El `_id` se reserva para GROQ y manipulación en la capa de datos.

```typescript
// objetivo (roadmap): brandear el slug y validar formato al construir
export type Slug = string & { readonly __brand: 'Slug' };

export function slug(value: string): Slug {
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
		throw new Error(`Slug inválido: "${value}"`);
	}
	return value as Slug;
}
```

### ReadingTime — minutos de lectura

Invariante: el tiempo de lectura es un **número positivo** (`>= 1`). Como value object encapsula esa invariante en un solo lugar:

```typescript
// objetivo (roadmap)
export type ReadingTime = number & { readonly __brand: 'ReadingTime' };

export function readingTime(minutes: number): ReadingTime {
	if (!Number.isInteger(minutes) || minutes < 1) {
		throw new Error(`ReadingTime inválido: ${minutes}`);
	}
	return minutes as ReadingTime;
}
```

### DateString — fechas de autor (`YYYY-MM-DD`)

`bornOn` / `diedOn` de `Author` usan el formato `YYYY-MM-DD`. La invariante de dominio — _si `diedOn` está definida, debe ser posterior a `bornOn`_ — se valida al construir el agregado `Author`, no en el value object aislado (es una regla entre dos campos del agregado).

```typescript
// objetivo (roadmap)
export type DateString = string & { readonly __brand: 'DateString' };

export function dateString(value: string): DateString {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		throw new Error(`DateString inválida: "${value}"`);
	}
	return value as DateString;
}
```

> **Nota de estilo (CLAUDE.md):** para conjuntos cerrados de literales **nunca** usar `enum` de TS — usar `Object.freeze({...} as const)`. Esto aplica a `ResourceType.slug`, `MediaType`, `ContributorAreaType`, etc.

---

## Validación en runtime (Zod)

Usá **Zod** para validar **datos externos** en la frontera (respuestas de API, contenido crudo de Sanity, params/query del backend con `@hono/zod-validator`). La validación protege el dominio de shapes inesperados antes de mapear:

```typescript
import { z } from 'zod';

const storySlugParamSchema = z.object({ slug: z.string().min(1) });

// en el controller Hono:
// zValidator('param', storySlugParamSchema)
```

La validación cruza la frontera una sola vez; pasada esa frontera, el dominio confía en sus tipos.

---

## El ACL como frontera (mappers)

El **Anti-Corruption Layer es el patrón central** de cuentoneta y **ya está implementado**. Los resultados crudos de GROQ **nunca** se filtran al frontend: los mappers traducen el shape de Sanity al modelo de dominio.

```
GROQ → repository.fetch*()  →  service.get*()  →  mapX(raw): DomainType  →  controller
       (resultado crudo)                         (mapper / ACL en _utils)
```

- Mappers como **funciones puras**: `mapAuthor`, `mapAuthorTeaser`, `mapStoryContent`, `mapResources`, …
- Los helpers de imágenes (`urlFor`, `urlForWithAutoFormat`) también viven en la capa de mappers.
- Al cambiar una query GROQ o un tipo generado de Sanity, actualizá el **mapper** y los tipos de dominio en el **mismo** PR.

El ACL es la frontera explícita entre la infraestructura (Sanity) y el dominio: un cambio en el CMS no afecta al dominio mientras se mantengan los contratos. Detalle en [`sanity-acl.md`](sanity-acl.md).

---

## Binding en componentes: solo dominio

Los componentes deben hacer binding **exclusivamente** a interfaces de dominio (hoy `Story`, `Author`, `Storylist`, `Resource`) o sus modelos. El **shape crudo de Sanity** y cualquier DTO de contrato pertenecen a la capa de API/provider — **nunca** se importan ni se referencian en componentes ni plantillas.

La frontera es clara: los repositories/services de Sanity manejan el shape crudo; desde la superficie pública del provider/store hacia arriba (componentes, plantillas), **solo** interfaces de dominio. Los modelos de dominio exponen propiedades computadas y métodos que encierran las reglas de negocio en un único lugar.

**Patrón:** el mapeo crudo → dominio se hace en la ACL (backend) y/o en el provider (frontend), de modo que las señales públicas ya exponen interfaces de dominio. El componente solo las consume.

---

# Patrones estratégicos

Las secciones de arriba son **tácticas** (_cómo_ construir bien un modelo). Las de abajo son **estratégicas**: _cuándo_ y _por qué_ aplicar esas tácticas y cómo se relacionan los modelos en el sistema. Son conceptos DDD framework-agnósticos adaptados al dominio TypeScript de cuentoneta.

## Diseño de agregados

Un **agregado** es un cluster de objetos de dominio tratado como una unidad para cambios de datos. Un objeto es la **raíz de agregado** — el único punto de entrada, responsable de hacer cumplir cada invariante del cluster. Los callers tienen referencia a la raíz, nunca a sus internos.

**Cómo identificar la raíz:** buscá la entidad que **posee más invariantes de negocio**; esa entidad es la raíz, porque las invariantes solo se garantizan si toda mutación pasa por ella.

En cuentoneta, **`Story` es la raíz** del agregado de contenido. Posee `author: Author`, `paragraphs`, `epigraphs`, `resources: Resource[]`, `tags: Tag[]` y `media: Media[]`. Sus invariantes (de `docs/DOMAIN_MODEL.md`):

- El `slug` es único e inmutable una vez creado.
- Toda historia **debe tener un autor**.
- Debe tener **al menos un párrafo** de contenido.
- El tiempo de lectura es un número positivo (`>= 1`).

El objetivo (roadmap #1503) es hacer cumplir esas invariantes **en construcción**, dentro de la factory, de modo que ningún caller pueda crear un `Story` inconsistente:

```typescript
// story.mapper.ts — objetivo: invariantes en tiempo de construcción
export function createStory(options: CreateStoryOptions): Story {
	if (!options.author) throw new Error('Story requiere autor');
	if (options.paragraphs.length === 0) throw new Error('Story requiere al menos un párrafo');
	return Object.freeze({
		...options,
		slug: slug(options.slug),
		approximateReadingTime: readingTime(options.approximateReadingTime),
	});
}
```

`Author` y `Storylist` son raíces de sus propios agregados. **`Storylist`** posee la invariante _`count` coincide con el número real de `stories`_; **`Author`** posee _`diedOn` (si existe) es posterior a `bornOn`_ y _`nationality` siempre presente_.

> **Implementado (#1852):** `LiteraryWork` es la primera raíz de agregado con invariantes **hechas cumplir en código** (no solo descritas): `createLiteraryWork` en `src/app/models/literary-work.model.ts` valida título no vacío y ≥ 1 sección, deriva `totalReadingTime` y congela el objeto; `authors` admite 0..N (el array vacío modela la obra anónima — policy `isAnonymous`). Ver `docs/DOMAIN_MODEL.md` y `docs/LITERARY_WORK_DESIGN.md`. El ejemplo de `Story` de arriba sigue siendo roadmap (#1503).

> **Nota:** la frontera del agregado es también la frontera de consistencia — ver [Decisiones de consistencia](#decisiones-de-consistencia).
>
> **Estado:** hoy estas invariantes están **descritas** en `docs/DOMAIN_MODEL.md` y garantizadas de hecho por el contenido curado en Sanity; su **enforcement en código** (constructores que lanzan) es roadmap.

## Domain events

Un **domain event** es un hecho en pasado sobre algo que **ya ocurrió**: `StoryPublished`, `StoryCreated`, `AuthorPublished`, `StorylistPublished`. Nombralos como hechos, nunca como comandos (`PublishStory` es un comando; `StoryPublished` es el evento).

Los eventos permiten que un bounded context reaccione a otro sin llamada directa: el contexto productor registra el hecho y los consumidores se suscriben. Esto **desacopla** contextos.

**Estado — roadmap (#1503).** Los domain events **no están implementados** todavía. La comunicación entre contextos hoy pasa por los **mappers del ACL** y llamadas directas a services. Esta sección documenta el patrón para el momento en que ese acoplamiento directo se vuelva una carga — por ejemplo, cuando publicar un `Story` deba propagarse a varios contextos (Página de Inicio: `mostRead`/`latestReads`; perfil de `Author`; notificaciones) que no conviene cablear en un único service. El diseño detallado (incluyendo `StoryPublished`, `StoryCreated`, `AuthorAssigned`) vive en `docs/DDD_IMPROVEMENTS.md` §2. Los nombres son ilustrativos; los autoritativos se acordarán al introducir los eventos.

## Type-state pattern

Modelá los estados del ciclo de vida de una entidad como **tipos distintos** en vez de un único tipo con un campo `status`, para que el compilador rechace operaciones inválidas en un estado dado.

El ciclo de vida de `Story` hoy es: `Borrador en Sanity → Publicación en contexto (Storylist / perfil de Author) → Accesible para lectura`. El enfoque vigente es implícito: el contenido publicado es el que las queries GROQ recuperan.

**Dirección futura:** cuando las reglas de negocio diverjan lo bastante entre estados como para que un método deba existir solo en uno, promover los estados a tipos distintos (p. ej. `DraftStory` vs `PublishedStory`), de modo que una operación como "agregar a una Storylist" exista solo sobre `PublishedStory` y sea un **error de compilación** sobre un borrador, en vez de un guard en runtime. Para conjuntos de literales de estado, usar `Object.freeze({...} as const)` (nunca `enum`).

## Policies como funciones puras

Una **policy** es una regla de negocio extraída a una función pura — sin efectos secundarios, sin services inyectados — con la forma `(entity, context) → decision`. Al ser pura es testeable de forma aislada, componible y reutilizable.

En cuentoneta, candidatas naturales a policy:

```typescript
// policy pura: ¿esta Storylist debe mostrar info de autores en sus tarjetas?
function shouldShowAuthors(storylist: Storylist): boolean {
	return storylist.config.showAuthors;
}

// policy pura: ¿este Story lleva advertencia de lenguaje explícito?
function requiresLanguageWarning(story: Story): boolean {
	return story.badLanguage === true;
}

// composición de predicados pequeños con && / ||
function isReadyForLanding(story: Story): boolean {
	return story.approximateReadingTime >= 1 && Boolean(story.author);
}
```

**Reglas:**

- Mantené las policies **libres de I/O** — pasá los datos por parámetro, devolvé una decisión.
- Componé policies pequeñas con `&&` / `||` en vez de una función con mucho branching (recordá: complejidad ciclomática ≤ 10, anidamiento ≤ 3).
- Devolvé `boolean` para predicados simples; un tipo de resultado estructurado cuando el caller necesite el **motivo** del rechazo.

## Principios de bounded context

Un **bounded context** es un ámbito dentro del cual aplican consistentemente un lenguaje ubicuo y un modelo. El mismo concepto del mundo real puede — y debe — modelarse distinto en contextos distintos. Cuentoneta separa cuatro:

| Contexto                   | Agregados raíz                          | Perspectiva                                        |
| -------------------------- | --------------------------------------- | -------------------------------------------------- |
| **Catálogo de Contenido**  | `Story`, `Author`                       | Inventario completo de historias y autores         |
| **Curación y Colecciones** | `Storylist`                             | Agrupar y ordenar historias en colecciones         |
| **Administración**         | `Contributor`                           | Colaboradores del proyecto por área                |
| **Página de Inicio**       | `LandingPageContent`, `ContentCampaign` | Agregar contenido de varios contextos para el home |

La idea clave: un mismo `Story` se modela distinto según el contexto. En **Catálogo** es la vista completa (`Story` con párrafos, epígrafes, autor completo). En **Curación**, dentro de una `Storylist`, es una proyección `StoryTeaserWithAuthor` — solo lo esencial para listar. En **Página de Inicio** es `StoryNavigationTeaserWithAuthor` dentro de `mostRead`/`latestReads`. Las **vistas polimórficas + los mappers del ACL** son las fronteras explícitas entre estos modelos.

### Lenguaje ubicuo

Cada contexto **posee las definiciones** de sus términos, co-localizadas con sus interfaces. Una misma palabra puede tener un matiz distinto por contexto, y esa divergencia es esperada. Términos clave (de `docs/DOMAIN_MODEL.md`):

| Término       | Definición                                                                   | Contexto              |
| ------------- | ---------------------------------------------------------------------------- | --------------------- |
| **Historia**  | Obra literaria curada y publicada                                            | Catálogo de Contenido |
| **Slug**      | Identificador amigable, único e inmutable basado en el título                | Todos                 |
| **Epígrafe**  | Cita literaria que precede al texto principal                                | Catálogo de Contenido |
| **Teaser**    | Vista reducida de una entidad para listados y navegación                     | Todos                 |
| **Colección** | Agrupación temática u editorial de historias (`Storylist`)                   | Curación              |
| **Recurso**   | Enlace externo a información complementaria (`Resource`)                     | Catálogo de Contenido |
| **Etiqueta**  | Tag de taxonomía (`Tag`) referenciable desde `Story`, `Author` y `Storylist` | Todos                 |
| **Curaduría** | Proceso de seleccionar, ordenar y presentar historias                        | Curación              |

**Convención para contextos nuevos:** al introducir un bounded context, definí su vocabulario junto a sus interfaces y aclará, por cada término, a qué términos existentes mapea o de cuáles diverge deliberadamente.

## Decisiones de consistencia

Elegí el modelo de consistencia **por frontera**, no por proyecto:

| Modelo       | Cuándo aplicarlo                                        | Ejemplo en cuentoneta                                                               |
| ------------ | ------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Fuerte**   | Invariantes que deben valer de inmediato, en una unidad | Agregado `Story`: autor presente y `>= 1` párrafo siempre consistentes al construir |
| **Eventual** | Estado best-effort donde un lag breve es aceptable      | _Futuro:_ un `StoryPublished` que actualice `mostRead`/`latestReads` del home       |

**Regla:** consistencia **fuerte** _dentro_ de la frontera de un agregado; consistencia **eventual** _entre_ agregados o contextos (propagada por [domain events](#domain-events)). El pivote de la decisión es la invariante: si _debe_ ser siempre verdadera, mantenela dentro de un agregado bajo consistencia fuerte; si tolera una ventana breve de staleness, dejá que converja.

> **Estado:** la implementación actual es fuertemente consistente de hecho (el contenido se cura y publica en Sanity, y las queries leen el estado publicado). La consistencia eventual cruzando contextos se documenta como guía futura, en tándem con los domain events del roadmap (#1503).
