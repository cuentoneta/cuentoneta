<div align="center" width="100%">
    <h2>La Cuentoneta</h2>
    <img width="33%" alt="" src="../.github/assets/cuentoneta-logo.png">
</div>

---

# Modelo de Dominio

## Introducción

El presente documento describe la arquitectura del modelo de dominio de La Cuentoneta desde la perspectiva de **Domain-Driven Design (DDD)**, una metodología de diseño de software pone énfasis en la comprensión profunda del dominio del negocio y en la alineación del código con el lenguaje y los conceptos del negocio.

En **La Cuentoneta** buscamos progresivamente la aplicación de los principios fundamentales de DDD para crear un código mantenible, escalable y que refleje fielmente la realidad del dominio de la clasificación, curaduría y distribución de contenido literario en formato breve.

---

## Tabla de Contenidos

1. [Contextos Acotados (Bounded Contexts)](#contextos-acotados-bounded-contexts)
2. [Agregados y Raíces de Agregado](#agregados-y-raíces-de-agregado)
3. [Objetos de Valor (Value Objects)](#objetos-de-valor-value-objects)
4. [Lenguaje Ubicuo (Ubiquitous Language)](#lenguaje-ubicuo-ubiquitous-language)
5. [Patrones y Estrategias](#patrones-y-estrategias)
6. [Estructura de Capas](#estructura-de-capas)
7. [Mejoras Recomendadas](./DDD_IMPROVEMENTS.md)
8. [Referencias](#referencias)

---

## Contextos Acotados (Bounded Contexts)

Un **Contexto Acotado** (Bounded Context) es un límite explícito dentro del cual un modelo de dominio es aplicable. En La Cuentoneta identificamos cinco. El contexto es un límite de **lenguaje y de modelo**, no una capa: controller → service → repository y el ACL atraviesan todos los contextos, y un mismo módulo de `src/api/modules/` puede servir a más de uno (ver [Mapeo contexto → módulo](#mapeo-contexto--módulo)).

| Contexto           | Código           | Propósito                                                                                                                                  | Actores                                      | Escribe                                                                 | Modelos                                                                                                                                                                         | Relación                                                                                |
| ------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Acervo**         | `Holdings`       | Gestionar los bienes digitales y su ciclo de vida. Contiene borradores y documentos publicados; "publicado" es un estado dentro del Acervo | Editor; a futuro, autores que cargan su obra | Sí: crear, editar, publicar, despublicar, calcular el tiempo de lectura | `LiteraryWork`, `Author` y `Collection` como documentos; `Resource`, `Media`, `Tag`                                                                                             | Upstream de todos. Hoy lo implementa Sanity                                             |
| **Catálogo**       | `Catalog`        | Localizar y acceder a lo publicado                                                                                                         | Lector, buscadores, bots de IA               | No                                                                      | `CatalogEntry` (unión) con `LiteraryWorkCatalogEntry`, y `Catalog<E>`; las entradas de autor y colección, pendientes (#2515 y #2725)                                            | Downstream del Acervo a través del ACL; decide la pertenencia                           |
| **Selecciones**    | `Selections`     | Elegir y ordenar parte del Acervo para presentarlo. Dos orígenes: **curadas** (editor) y **generadas** (métricas o algoritmo)              | Editor; algoritmo o métricas                 | Sí, la curaduría                                                        | `LandingPageContent` (selecciones de la home, temporales), `ContentCampaign`, `HighlightedAuthor`, lo más leído, sugerencias de lectura; la colección como selección permanente | Downstream del Acervo                                                                   |
| **Lectura**        | `Reading`        | Leer una obra y lo que el lector hace al leer                                                                                              | Lector                                       | Cuando los lectores escriban (resaltados, #2015)                        | La obra para leer (`LiteraryWork`, vista completa); a futuro `Highlight`                                                                                                        | Downstream del Acervo. **Condicional**: su definición completa es prerequisito de #2015 |
| **Administración** | `Administration` | Colaboradores del proyecto                                                                                                                 | Equipo                                       | Sí                                                                      | `Contributor`                                                                                                                                                                   | Independiente                                                                           |

> **Destino** no es un contexto sino una **relación** entre el Catálogo y la vista completa de cada entidad. Ver el [glosario](#términos-clave).

### 1. Contexto de Acervo (`Holdings`)

**Propósito:** los bienes digitales (obras, autores, colecciones) y su ciclo de vida: borrador, publicación, despublicación. Sus referencias son fuertes: nada referenciado por un documento publicado puede despublicarse.

**Modelos:** `LiteraryWork`, `Author`, `Collection` como documentos; objetos de valor `Resource`, `Media`, `Tag`.

**Responsabilidades:**

- Almacenar obras seccionadas en Markdown
- Mantener perfiles de autor
- Agrupar obras en colecciones
- Calcular y persistir el tiempo de lectura
- Impedir publicar lo incompleto (_objetivo_, #2714: hoy el Studio exige los campos requeridos, pero no el tiempo de lectura ni la fecha de publicación)

**La colección** es siempre un documento del Acervo (schema `collection`). Su contenido puede cambiar, pero sin una temporalidad definida: está pensada para ser, en general, inmutable. Eso la distingue de las selecciones de la home, que son temporales y rotan.

**Interfaces:** el Studio de Sanity (`/cms`), las migraciones de datos de `cms/migrations/` (corren con `sanity migration run`) y las tareas de `pnpm ops` que completan o corrigen documentos, como `reading-time:backfill` o `normalize:bare-published-at` (la lista de tareas está en `.claude/references/ops.md`). No expone endpoints públicos propios: los endpoints de lectura sirven a los contextos de abajo.

---

### 2. Contexto de Catálogo (`Catalog`)

**Propósito:** localizar y acceder a lo publicado. Es un **modelo de lectura**, no un aggregate: no escribe.

**Superficies:** las páginas `/literary-work`, `/authors` y `/collection`, el sitemap, el JSON-LD de esas páginas y, a futuro, `/llms.txt` (#2717). **No** son catálogo la lista de obras de la página de autor (parte del destino del autor), la de la página de colección (contenido del destino de la colección), las sugerencias de lectura (selección generada) ni los bloques de la home (selecciones): consumen el Acervo directamente.

**Modelos objetivo:** una entrada por entidad (`LiteraryWorkCatalogEntry`, `AuthorCatalogEntry`, `CollectionCatalogEntry`) y `Catalog<E>`. La entrada de obra y `Catalog<E>` están implementados (`createLiteraryWorkCatalogEntry`, `createCatalog`, `fetchCatalogEntries`): los sirve `GET /api/literary-work`, que consume `/literary-work`. `/authors` y `/collection` siguen consumiendo avances (`*Teaser`) hasta que existan sus entradas (#2515 y #2725).

**Pertenencia:** ver `CatalogMembership` en el [glosario](#términos-clave) (objetivo, no vigente).

**Interfaces de API (hoy):**

```
GET /api/literary-work             # Catálogo de obras: { entries, total }, ordenado por slug
GET /api/collection                # Catálogo de colecciones, en vista de avance
GET /api/author                    # Catálogo de autores
```

El sitemap también es superficie del Catálogo. Los endpoints de los destinos (`GET /api/author/:slug`, `GET /api/collection/:slug`) figuran en el [mapeo](#mapeo-contexto--módulo). Ver la nota de transición del mapeo.

---

### 3. Contexto de Selecciones (`Selections`)

**Propósito:** elegir y ordenar parte del Acervo para presentarlo.

**Orígenes:** **curadas** por el editor (colecciones destacadas, campañas, autores destacados) y **generadas** por métricas o algoritmo (lo más leído, que actualiza el cron sobre Clarity; las sugerencias de lectura).

**Modelos:** `LandingPageContent` (temporal, rota por semana), `ContentCampaign`, `HighlightedAuthor`, `RotatingContent`, y la colección como selección permanente.

**Vista propia:** el **avance** (`*Teaser`), que comparte con las listas de obras dentro de un destino (perfil del autor, página de colección).

**Escritura:** la curaduría se carga en el Studio de Sanity (`/cms`). Las selecciones generadas las escriben tareas de `pnpm ops` agendadas, como `landing-pages:add-next-weeks` (la landing de la semana) o `most-read:update` (lo más leído).

**Interfaces de API (hoy):**

```
GET /api/content/landing-page          # Contenido de la página de inicio
GET /api/literary-work/teasers?author= # Avances de las obras de un autor (sugerencias de lectura; también la lista del perfil del autor)
```

Las sugerencias de lectura, al pie de la página de una obra, eligen sobre las obras del contexto desde el que se llegó (`pickReadingSuggestions`): leen `GET /api/literary-work/teasers?author=` cuando se llega desde un autor, y `GET /api/collection/:slug` cuando se llega desde una colección. Esas dos llamadas sirven también a destinos: la lista de obras del perfil del autor y la página de la colección, que **no** son selecciones generadas. Las colecciones sugeridas al pie de la página de una colección leen `GET /api/collection`, la misma llamada que sirve al catálogo `/collection`. Ver la nota de transición del [mapeo](#mapeo-contexto--módulo).

---

### 4. Contexto de Lectura (`Reading`)

**Propósito:** leer una obra y lo que el lector hace al leer.

> **Contexto condicional:** su definición completa es prerequisito de #2015 (resaltados). Hasta entonces se documenta solo lo que existe: la obra completa como destino de lectura. No se modelan aggregates ni endpoints de Lectura más allá de eso.

**Interfaces de API:**

```
GET /api/literary-work/:slug       # Obra literaria completa (destino de lectura)
```

---

### 5. Contexto de Administración (`Administration`)

**Propósito:** registrar a los colaboradores del proyecto y su área de trabajo.

**Modelos:** `Contributor`.

**Responsabilidades:**

- Mantener registro de contribuyentes
- Clasificar contribuyentes por área de trabajo (staff, programación, generación de contenido, curación)
- Proporcionar información de contacto y redes sociales

`ContributorArea` "curación" (`content-pick`) nombra un área de trabajo de colaboradores, no al contexto de Selecciones.

**Interfaces de API:**

```
GET /api/contributor               # Obtener lista de colaboradores
```

---

### Mapeo contexto → módulo

> El contexto no es una capa ni un módulo. La tabla dice a qué contexto sirve cada pieza hoy. La separación física por contexto es **objetivo**, no estado (ver `.claude/references/domain-model.md`).

| Pieza                                                                           | Contexto                                         | Nota                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cms/` (schemas y Studio), `src/api/_queries/`, adaptadores `Sanity*Repository` | Acervo                                           | El Acervo hoy es Sanity; las queries y los adaptadores son su borde de lectura                                                                                                                                             |
| `literary-work` — `GET /api/literary-work`                                      | Catálogo                                         | Superficie `/literary-work`                                                                                                                                                                                                |
| `literary-work` — `GET /api/literary-work/teasers?author=`                      | Destino del autor · Selecciones (generada)       | Sirve a dos consumidores: la lista de obras del perfil del autor (parte de su destino, leída del Acervo) y las sugerencias de lectura (selección generada)                                                                 |
| `literary-work` — `GET /api/literary-work/:slug`                                | Lectura                                          | Destino de la obra                                                                                                                                                                                                         |
| `collection` — `GET /api/collection`                                            | Catálogo · Selecciones (generada)                | Sirve a dos consumidores: la superficie `/collection` (hoy devuelve avances) y las colecciones sugeridas al pie de `/collection/:slug` (selección generada)                                                                |
| `collection` — `GET /api/collection/:slug`                                      | Destino de la colección · Selecciones (generada) | Sirve a dos consumidores: la página de la colección, cuyo contenido es una selección permanente del Acervo, y las sugerencias de lectura de la página de una obra cuando se llega desde esa colección (selección generada) |
| `author` — `GET /api/author`                                                    | Catálogo                                         | Superficie `/authors`                                                                                                                                                                                                      |
| `author` — `GET /api/author/:slug`                                              | Destino del autor                                | Perfil; la lista de sus obras llega por `GET /api/literary-work/teasers?author=`                                                                                                                                           |
| `content`                                                                       | Selecciones                                      | Home semanal, lo más leído, campañas, autores destacados                                                                                                                                                                   |
| `sitemap`                                                                       | Catálogo                                         | Superficie para buscadores                                                                                                                                                                                                 |
| `contributor`                                                                   | Administración                                   | —                                                                                                                                                                                                                          |
| `og` (`src/api/og.controller.ts`)                                               | Transversal                                      | Imágenes de previsualización de cualquier destino                                                                                                                                                                          |

> **Transición (#2598).** Esta tabla y las interfaces de arriba describen los endpoints de hoy. #2598 los cambia en un solo cambio: al cumplirlo, borra de esta nota su punto y actualiza las filas que nombra, y con eso la nota se borra entera.
>
> - **#2598:** las colecciones sugeridas al pie de `/collection/:slug` dejan de leer `GET /api/collection` y pasan al endpoint de sugeridas. La fila `GET /api/collection` vuelve a ser solo Catálogo, el endpoint nuevo suma su fila en Selecciones (generada), y la interfaz de Selecciones también lo cita.

### Subdominios (provisorio)

> Selecciones y Lectura son **core**; Catálogo y Acervo, **de soporte**; Administración, **genérico**. Es provisorio hasta redefinir los pilares del proyecto (#2718).

---

## Agregados y Raíces de Agregado

Un **Agregado** es un cluster de objetos de dominio (entidades y objetos de valor) que se tratan como una unidad para fines de cambios en los datos. La **Raíz de Agregado** es la entidad que define el límite del agregado.

### Agregado: LiteraryWork (Obra literaria)

**Raíz de Agregado:** `LiteraryWork`

> Contratos completos y decisiones de diseño en [`LITERARY_WORK_DESIGN.md`](LITERARY_WORK_DESIGN.md). `LiteraryWork` es el agregado que sirve todo el contenido narrativo del Acervo, con **invariantes implementadas en código** (factory `createLiteraryWork` + value objects brandeados en `src/models/`).

```typescript
interface LiteraryWork {
	// Identidad
	_id: string; // Identificador único (Sanity)
	slug: Slug; // Clave de negocio, invariante única (value object brandeado)

	// Contenido
	title: string; // Título de la obra
	content: LiteraryWorkSection[]; // Secciones/capítulos (nunca vacío)

	// Metadatos
	totalReadingTime: ReadingTime; // Derivado: suma de los readingTime de sus secciones
	sectionCount: number; // Derivado: total real de secciones (en proyecciones parciales puede superar a content.length)
	badLanguage?: boolean; // Advertencia de lenguaje explícito
	originalPublication: string; // Atribución/publicación original
	publishedAt: IsoDateTime; // Fecha ISO de publicación en la plataforma

	// Imagen
	coverImage: string; // URL de portada; '' si no fue asignada

	// Relaciones
	authors: Author[]; // 1..N autores; la obra anónima referencia al author "Anónimo" (policy isAnonymous)

	// Categorización
	tags: Tag[]; // Etiquetas de taxonomía

	// Recursos Multimedia
	resources: Resource[]; // Enlaces a recursos externos
	mediaSources: Media[]; // Contenido multimedia asociado (vista completa, con la carga del recurso)
}

interface LiteraryWorkSection {
	position: number; // Identidad numérica en la obra (0-based, igual al índice del array en el CMS)
	title?: SectionTitle; // Opcional; expone toAnchor(): Slug para anclas
	epigraphs?: AttributedText[]; // 0..N epígrafes por sección
	bodyHtml: SanitizedHtml; // HTML saneado server-side (nunca markdown crudo)
	readingTime: ReadingTime; // Minutos de lectura de la sección
}

interface AttributedText {
	text: SanitizedHtml; // Markdown saneado a HTML (mismo pipeline que el cuerpo)
	reference?: SanitizedHtml; // Atribución, también markdown saneado
}
```

`AttributedText` nombra la **forma** —un bloque de texto con atribución opcional— y no un rol: la comparten el epígrafe de una sección (cita a un tercero) y `editorialNote` de `LiteraryWork` (comentario de la redacción, no cita a nadie; en el dominio es un `SanitizedHtml` plano, no un `AttributedText`, y el frontend lo adapta al construir el binding del componente que lo renderiza). No está brandeado: su factory `createAttributedText` es composición pura sin invariante propia, la sostienen los `SanitizedHtml` de sus campos.

**Invariantes de Negocio:**

- El slug debe ser único (garantizado por Sanity) y con formato válido (validado por el value object `Slug`)
- La obra debe tener al menos una sección de contenido
- `totalReadingTime` es la suma de los `readingTime` de sus secciones (derivado en la factory); a nivel schema es un campo editable/persistido que el backend materializa (ver [`LITERARY_WORK_DESIGN.md`](LITERARY_WORK_DESIGN.md) §5)
- `sectionCount` es el número real de secciones (derivado en la factory; en proyecciones parciales lo provee el mapper)
- Las posiciones de sección son contiguas desde 0 en el agregado completo (`content[i].position === i`); las proyecciones parciales conservan el `position` de origen
- `authors` exige al menos un autor (1..N) — la **obra anónima** referencia explícitamente al author "Anónimo" (slug `anonimo`, valor bien conocido del dominio; policy `isAnonymous` compara por slug, nunca por `_id`)
- `resources` nunca contiene un ítem con `url` ausente o vacía (ver [Resource](#resource-recurso-externo))

**Ciclo de Vida:**

```
Borrador en el Acervo → Publicado en el Acervo → Entrada del catálogo + destino en Lectura (/literary-work/:slug)
```

**Vistas Polimórficas:**

- `LiteraryWork` - Vista completa (todas las secciones, autores completos)
- `LiteraryWorkTeaser` - Avance — vista para selecciones y para las listas de obras dentro de un destino (perfil del autor, página de colección): expone un **extracto** del arranque de la obra (`excerpt`), que no declara tiempo de lectura ni posición porque su cuerpo va recortado, a lo sumo a `LITERARY_WORK_EXCERPT_MAX_LENGTH` caracteres visibles
- `LiteraryWorkNavigationTeaser` - Vista mínima para navegación
- `LiteraryWorkNavigationTeaserWithAuthors` - Vista mínima con autores resumidos

`mediaSources` lo exponen **todas** las vistas, cada una con el tipo de su vista: `LiteraryWork` transporta `Media[]` (la vista completa, con la carga del recurso); `LiteraryWorkTeaser`, `LiteraryWorkNavigationTeaser` y `LiteraryWorkNavigationTeaserWithAuthors` transportan `MediaTeaser[]` (solo el `type`), que es lo único que el avance necesita para pintar el ícono de la plataforma — ver [Media](#media-contenido-multimedia).

---

### Agregado: Author (Autor)

**Raíz de Agregado:** `Author`

```typescript
interface Author {
	// Identidad
	_id: string; // Identificador único (Sanity)
	slug: string; // Clave de negocio, invariante única

	// Información personal
	name: string; // Nombre completo del autor
	imageUrl: string; // URL de imagen de perfil
	nationality: AuthorNationality; // País e imagen de bandera

	// Datos biográficos
	bornOn?: DateString; // Fecha de nacimiento (formato YYYY-MM-DD)
	diedOn?: DateString; // Fecha de muerte (formato YYYY-MM-DD)
	bornOnYear?: number; // Año de nacimiento: derivado de bornOn o, sin fecha completa, el cargado a mano (negativo para a.C.)
	diedOnYear?: number; // Ídem para el año de muerte

	// Contenido
	biography: SanitizedHtml; // Biografía del autor; Markdown saneado a HTML, requerida (no opcional)
	resources: Resource[]; // Enlaces a recursos sobre el autor

	// Categorización
	tags: Tag[]; // Etiquetas de taxonomía del autor. Vacío en los teasers
}

interface AuthorNationality {
	country: string; // Nombre del país
	flag: string; // Imagen de bandera
}
```

**Invariantes de Negocio:**

- El slug debe ser único y no puede cambiar
- El nombre no puede estar vacío
- Si `diedOn` está definido, debe ser posterior a `bornOn`
- `AuthorNationality` siempre debe estar presente
- `resources` nunca contiene un ítem con `url` ausente o vacía (ver [Resource](#resource-recurso-externo))

**Ciclo de Vida:**

```
Borrador de perfil -> Publicación de perfil -> Entrada del catálogo /authors + perfil como destino
```

**Vistas Polimórficas:**

- `Author` - Vista completa (incluye biografía y recursos)
- `AuthorTeaser` - Avance: no declara `biography` (la ausencia se expresa en el tipo, no en un valor vacío) ni `resources` (`Array<never>`)

---

### Agregado: Collection (Colección de obras literarias)

**Raíz de Agregado:** `Collection`

> `Collection` es un documento del Acervo; su página es el destino de la colección y su contenido funciona como selección permanente. El listado `/collection` es superficie del Catálogo, y el sitemap la lista por slug. Sus invariantes están **hechas cumplir en código** (factory `createCollection` + el value object `Slug`, en `src/models/collection.model.ts`) — la dirección del proyecto es que cada entidad nueva del Acervo sume sus invariantes al código en vez de solo documentarlas.

```typescript
interface Collection {
	// Identidad
	_id: string; // Identificador único (Sanity)
	slug: Slug; // Clave de negocio, invariante única (value object brandeado)
	title: string; // Título de la colección

	// Contenido
	description: SanitizedHtml; // Markdown saneado a HTML
	imagery: CollectionImagery; // representative (portada editorial) o sample (portadas de las 3 primeras obras)
	tags: Tag[]; // Etiquetas de categorización

	// Configuración
	config: {
		showAuthors: boolean; // ¿Mostrar información de autores?
	};

	// Recursos Multimedia
	mediaSources: Media[]; // Contenido multimedia asociado (vista completa); alineado con el schema y con LiteraryWork.mediaSources

	// Metadatos
	count: number; // Derivado: total de las obras que el agregado transporta

	// Composición
	readonly literaryWorks: readonly LiteraryWorkTeaser[]; // Obras literarias en la colección (ordenadas); su mediaSources es MediaTeaser[], no Media[] — ver LiteraryWork
}
```

**Invariantes de Negocio (hechas cumplir en código por la factory `createCollection`):**

- El `title` no puede estar vacío.
- Debe tener **al menos una** obra literaria (`literaryWorks.length >= 1`).
- El `slug` tiene formato válido (value object `Slug`, delegado a `createSlug`).
- `count` se deriva en la factory (`literaryWorks.length`); no se recibe como dato, así que no puede discrepar del número real de obras **mientras la query no acote `literaryWorks`**. Si el listado se pagina, el total pasa a ser un dato de entrada y la derivación deja de valer.
- El abanico de portadas (`imagery.kind === 'sample'`) tiene **exactamente tres** imágenes. La tupla lo garantiza en compilación, pero el agregado se construye desde GROQ, donde un abanico corto encaja igual.

**La vista de avance tiene su propia factory (`createCollectionTeaser`):**

Muestra la colección **sin transportar sus obras**, así que no puede derivar `count`: lo **recibe** como dato —la query lo trae contando referencias sin resolverlas— y exige que sea al menos uno. Es la invariante "al menos una obra" traducida a lo único que el avance sí transporta. Las demás —título no vacío, slug válido, abanico de tres— le siguen aplicando igual.

Existe como factory y no como proyección suelta porque el repository produce avances desde la query: armarlos como objeto literal perdería esas reglas sin que nada avise. El ensamblado del avance (`mapSanityCollectionTeaser`, `mapSharedCollectionFields`, `resolveCollectionImagery`) vive en `src/api/modules/collection/collection-teaser.acl.ts` — módulo compartido entre `SanityCollectionRepository` y `SanityContentRepository`, porque las dos proyectan una colección referenciada, cada una desde su propio agregado. Ver [`sanity-acl.md`](../.claude/references/sanity-acl.md).

**Ciclo de Vida:**

```
Borrador en el Acervo → Publicado en el Acervo → Entrada del catálogo + destino (/collection/:slug)
```

**Relación con LiteraryWork:**
Las obras se referencian directamente en el array `literaryWorks`. Cada entrada es una proyección de tipo `LiteraryWorkTeaser`. La proyección GROQ anidada de `mediaSources` en esas entradas trae solo `{ _type, title }`, que el ACL mapea con `mapMediaTeasers` a `MediaTeaser[]`; el `mediaSources` de nivel documento de `Collection` sigue siendo la vista completa, mapeada con `mapMediaSources`.

**Puntos de contacto con `LiteraryWork`:**

`Collection` no define su propia noción de obra: la toma entera de `LiteraryWork`. Estas son las costuras por las que se tocan, y son las que hay que revisar de conjunto ante cualquier cambio en el vocabulario de la obra.

| Capa                      | Dónde                                                 | Qué toca                                                                                                                                                                                                   |
| ------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DTO de transporte**     | `src/models/collection.dto.ts`                        | Reutiliza el schema del teaser de obra en vez de declarar uno propio                                                                                                                                       |
| **ACL**                   | `src/api/modules/collection/collection-teaser.acl.ts` | Ensambla el teaser de obra con las primitivas compartidas (`createSlug`, `createReadingTime`, `createLiteraryWorkExcerpt`); lo consumen `collection.repository.sanity.ts` y `content.repository.sanity.ts` |
| **Provider del frontend** | `src/app/providers/collection.provider.ts`            | `toLiteraryWorkTeaser`, ACL simétrico al del backend sobre el mismo DTO                                                                                                                                    |
| **Tipos del kernel**      | `@models/*`                                           | `Slug`, `Tag`, `Media`/`MediaTeaser`, `SanitizedHtml`, `ReadingTime` — compartidos, no duplicados                                                                                                          |
| **Schema del Studio**     | `cms/schemas/collection.ts`                           | El campo `literaryWorks` referencia documentos `literaryWork`                                                                                                                                              |

**Vistas Polimórficas:**

- `Collection` - Vista completa (incluye todas las obras literarias)
- `CollectionTeaser` - Avance: vista sin obras (`literaryWorks: Array<never>`)

---

### Agregado: Contributor (Colaborador)

**Raíz de Agregado:** `Contributor`

```typescript
interface Contributor {
	// Identidad
	slug: string; // Clave de negocio, invariante única

	// Información personal
	name: string; // Nombre del colaborador
	notes?: string; // Notas/descripción adicional

	// Clasificación
	area: ContributorArea; // Área de contribución

	// Contacto
	link: ContributorLink; // Información de contacto
}

interface ContributorArea {
	slug: ContributorAreaType; // 'staff' | 'programming' | 'content-generation' | 'content-pick'
	name: string; // Nombre legible del área
}

interface ContributorLink {
	handle?: string; // Identificador de usuario (ej: @usuario)
	url?: string; // URL de perfil o sitio web
}
```

**Invariantes de Negocio:**

- El slug debe ser único
- El nombre no puede estar vacío
- `area` debe ser uno de los valores permitidos
- Al menos `handle` o `url` debe estar definido

**Áreas de Contribución:**

- `staff` - Miembros del equipo principal
- `programming` - Desarrolladores de la plataforma
- `content-generation` - Creadores de contenido
- `content-pick` - Curadores y transcriptores

---

### Agregado: LandingPageContent (Contenido de Página Inicio)

**Raíz de Agregado:** `LandingPageContent`

> Pertenece al contexto de **Selecciones**: es una selección temporal que rota por semana.

```typescript
interface LandingPageContent {
	// Identidad
	_id: string; // Identificador único
	config: string; // Slug de la semana vigente (YYYY-SS)

	// Composición
	collections: readonly CollectionTeaser[]; // Colecciones destacadas
	campaigns: readonly ContentCampaign[]; // Campañas de marketing
	mostRead: readonly LiteraryWorkNavigationTeaserWithAuthors[]; // Top de obras más leídas
	latestReads: readonly LiteraryWorkNavigationTeaserWithAuthors[]; // Últimas obras publicadas
	highlightedAuthors: readonly HighlightedAuthor[]; // Hasta 6 autores destacados de la semana
}

interface RotatingContent {
	_id: string;
	name: string;
	mostRead: readonly LiteraryWorkNavigationTeaserWithAuthors[]; // Ranking de obras más leídas
}

interface HighlightedAuthor {
	author: AuthorTeaser;
	tags: readonly Tag[]; // Las etiquetas derivadas del autor
	storyCount: number; // Obras del autor, contadas sobre los dos _type que el dataset contiene: literaryWork y story
}
```

El campo `storyCount` cuenta los documentos de **ambos** `_type` que hoy conviven en el dataset: la migración de `story` a `literaryWork` no está completa en todo el corpus, así que contar solo `literaryWork` dejaría en cero a todo autor cuya obra todavía no migró.

`mostRead` y `latestReads` conservan su nombre porque nombran el **rol editorial** del slot; lo transportan obras (`LiteraryWorkNavigationTeaserWithAuthors`). `collections` agrupa `CollectionTeaser` (ver [el agregado](#agregado-collection-colección-de-obras-literarias)). `RotatingContent` es la proyección que el cron de "lo más leído" persiste y expone por separado del resto de la landing — detalle del productor en [Estrategias de Actualización de Contenido](./CONTENT_UPDATE_STRATEGIES.md).

**Responsabilidades:**

- Elegir y ordenar contenido del Acervo para presentarlo en la página inicio
- Mantener datos de lectura y estadísticas

`HighlightedAuthor` es una proyección de Selecciones, no una vista del agregado `Author`: su conteo es un dato que solo esta pantalla paga, y sus etiquetas viajan en el wrapper porque `AuthorTeaser` entrega la suya vacía en toda vista del repositorio.

El tope de seis rige la edición en el Studio y no lo ya persistido, así que el mapeo lo vuelve a aplicar como salvaguarda.

> **Nota:** Para comprender la implementación práctica de este agregado, incluyendo la generación automática de configuraciones y actualización de contenido, consulta la documentación sobre [Estrategias de Actualización de Contenido](./CONTENT_UPDATE_STRATEGIES.md).

---

## Objetos de Valor (Value Objects)

Los **Objetos de Valor** son objetos sin identidad propia que representan conceptos del dominio. Son inmutables y se comparan por su contenido, no por su referencia.

### Media (Contenido Multimedia)

**Propósito:** Encapsular diferentes tipos de contenido multimedia.

Dos ejes **ortogonales** organizan el modelo, y conviene no confundirlos:

1. **Qué transporta la proyección.** `Media` es la vista **completa** — la de la página, con la carga (`data`, obligatorio) con la que un widget reproduce el recurso. `MediaTeaser` es la vista de **avance** — el `type`, con el que el avance pinta el ícono de la plataforma, y el `title`, que está por **identidad**: sin él dos recursos de la misma plataforma son indistinguibles, y quien ofrezca elegir entre ellos no puede decir cuál se eligió ni nombrarlos. Ninguno de los dos arrastra costo: son campos planos del documento, a diferencia de la descripción (que cruza el pipeline de Markdown) y de la URL del audio (que dereferencia un asset). Cada una tiene su propia proyección GROQ y su propio mapper (`mapMediaSources` y `mapMediaTeasers`, respectivamente); el teaser no puede prometer lo que su proyección no trae. `data` es obligatorio en `Media` para que la carga no se pueda omitir al armar la vista completa: mientras fue opcional, copiar los campos textuales de un recurso bastaba para construir algo que el compilador aceptaba como reproducible.
2. **Cómo se correlaciona el tag con su carga.** Dentro de la vista completa, `Media` es el **supertipo** —`data: unknown`, sin correlación entre el tag y la forma de la carga— y `MediaTypes` la **unión discriminada** que consumen los widgets, donde cada tag ya fija su `data`. Se pasa de uno al otro con los type guards de abajo, nunca con una aserción.

```typescript
interface MediaTeaser {
	type: MediaTypeKey; // 'audioRecording' | 'spaceRecording' | 'youTubeVideo' | 'spotifyPodcastEpisode'
	title: string; // identidad del recurso dentro de su plataforma
}

interface Media {
	title: string;
	description: SanitizedHtml; // Markdown en el CMS, saneado a HTML por el ACL
	type: MediaTypeKey;
	data: unknown;
}

interface AudioRecording extends Media {
	data: { url: string };
}

interface SpaceRecording extends Media {
	data: {
		url: string | null; // null en proyecciones embebidas que no resuelven audioUrl
		duration: string;
		hostName: string;
		hostAvatar?: string;
		date: string;
	};
}

interface YouTubeVideo extends Media {
	data: { videoId: string };
}

interface SpotifyPodcastEpisode extends Media {
	data: { url: string };
}

type MediaTypes = AudioRecording | SpaceRecording | YouTubeVideo | SpotifyPodcastEpisode;
```

**Patrón:** Polimorfismo mediante discriminador (`type`). Los type guards (`isAudioRecording`, `isSpaceRecording`, `isYouTubeVideo`, `isSpotifyPodcastEpisode`) discriminan **solo por el tag** y no por la forma de `data`: `AudioRecording` y `SpotifyPodcastEpisode` son estructuralmente idénticos (`{ url }`), así que inspeccionar `data` no alcanza para distinguirlos. `narrowMedia(media: Media): MediaTypes` los encadena y lanza si el `type` no corresponde a ningún tag que el dominio modele.

**Uso:** Asociar audio, espacios de X, episodios de podcast de Spotify y videos de YouTube a una obra o colección. `LiteraryWork.mediaSources` y el `mediaSources` de nivel documento de `Collection` exponen `Media[]`; las vistas de teaser de `LiteraryWork` (incluidas las obras dentro de `Collection.literaryWorks`) exponen `MediaTeaser[]` — ver [LiteraryWork](#agregado-literarywork-obra-literaria).

---

### Resource (Recurso Externo)

**Propósito:** Enlazar a recursos externos con información categorizada.

```typescript
interface Resource {
	title: string;
	url: string;
	resourceType: ResourceType;
}

interface ResourceType {
	slug: string; // Identificador único del tipo
	title: string; // Nombre del tipo (ej: "Wikipedia")
	description: string; // Texto plano que explica qué es el tipo
}
```

> `url` es la razón de ser del recurso: sin un enlace válido, no hay nada que enlazar. El schema de Sanity la exige y valida su forma de URL, pero esa regla rige la **edición** en el Studio, no el dato ya persistido — un documento anterior a la regla, o escrito por script o migración, puede tenerla ausente o vacía sin que el Studio lo señale. El ACL cierra esa brecha en la frontera: `mapResources` descarta, con un `console.warn` para hacerlo visible en logs, todo recurso cuyo `url` no sea un string no vacío. Por eso `Author.resources` y `LiteraryWork.resources` nunca transportan un ítem incompleto — la garantía es del mapeo, no del schema.

> El ícono que acompaña a un recurso en la interfaz lo resuelve el frontend a partir del `slug` del tipo, contra el mapa local de `@app-models/icon.model`. No viaja desde el CMS.

> El nombre `description` no implica un mismo tipo en todo el modelo: en `ResourceType` y en [`Tag`](#tag-etiqueta) es texto plano, mientras que `Media.description` es HTML saneado y `Collection.description` es Markdown saneado a HTML. Conviene mirar la interfaz antes de asumir el formato.

**Ejemplos de tipos:**

- `wikipedia` - Artículos en Wikipedia
- `wattpad` - Historias en Wattpad
- `sitio-web` - Sitios web generales
- `instagram` - Perfiles de Instagram
- `wikisource` - Textos en Wikisource

---

### Tag (Etiqueta)

**Propósito:** Categorizar y filtrar contenido.

```typescript
interface Tag {
	slug: string; // Identificador único
	title: string; // Nombre de la etiqueta
	description: string; // Texto plano que explica qué agrupa la etiqueta
}
```

**Uso:** Clasificar contenido por tema, género, etc.

> El nombre `description` no implica un mismo tipo en todo el modelo: en `Tag` y en [`ResourceType`](#resource-recurso-externo) es texto plano, mientras que `Media.description` es HTML saneado y `Collection.description` es Markdown saneado a HTML. Conviene mirar la interfaz antes de asumir el formato.

> Una etiqueta no lleva ícono: el componente `Tag` renderiza solo su título. El CMS supo tener un campo de ícono, pero ninguna superficie lo mostraba.

---

### ContentCampaign (Campaña de Contenido)

**Propósito:** Definir campañas de contenido, destacando algún perfil de autor, colección o link particular en la plataforma.

```typescript
interface ContentCampaign {
	slug: string; // Identificador único
	title: string; // Título de la campaña
	url: string; // URL de destino

	contents: {
		xs: CampaignViewportContent; // Contenido para móvil
		md: CampaignViewportContent; // Contenido para escritorio
	};
}

interface CampaignViewportContent {
	imageUrl: string;
	imageWidth: number;
	imageHeight: number;
}
```

**Responsividad:** Permite diferentes versiones del contenido según tamaño de pantalla.

---

## Lenguaje Ubicuo (Ubiquitous Language)

El **Lenguaje Ubicuo** es el lenguaje estructurado alrededor del modelo de dominio que debe ser entendido por técnicos y no técnicos por igual.

### Términos Clave

| Término                  | Código                     | Definición                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Contexto                                                |
| ------------------------ | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **Acervo**               | `Holdings`                 | Obras, autores y colecciones como bienes digitales, con borradores y documentos publicados. Entran y salen del catálogo al publicarse y despublicarse                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Acervo                                                  |
| **Obra literaria**       | `LiteraryWork`             | Obra con secciones/capítulos                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Acervo                                                  |
| **Sección / Capítulo**   | `LiteraryWorkSection`      | Unidad de contenido de una obra: epígrafes + cuerpo Markdown saneado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Acervo                                                  |
| **Autor**                | `Author`                   | Persona a la que se atribuye una obra; tiene perfil propio                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Acervo                                                  |
| **Anónimo**              | —                          | Autor real del Acervo (slug `anonimo`) que representa la obra sin autoría atribuida (policy `isAnonymous`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Acervo                                                  |
| **Colección**            | `Collection`               | Documento que agrupa obras con un criterio temático o editorial. Su contenido cambia sin temporalidad definida: en general es inmutable, y por eso funciona como selección permanente                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Acervo (documento) · Selecciones (selección permanente) |
| **Recurso**              | `Resource`                 | Enlace externo a información complementaria                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Acervo                                                  |
| **Etiqueta**             | `Tag`                      | Término de taxonomía referenciable desde obras, autores y colecciones                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Todos                                                   |
| **Slug**                 | `Slug`                     | Identificador amigable, único e inmutable basado en el título                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Todos                                                   |
| **Mal formado**          | `Malformed<Agregado>Error` | Estado de un documento del Acervo cuyos datos no permiten construir el modelo de dominio. No depende de quién lo consume: el error nombra el estado, y la consecuencia la nombra quien descarta el documento.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Acervo                                                  |
| **Catálogo**             | `Catalog`                  | Instrumento para localizar y acceder a las entradas del Acervo publicado. Modelo de lectura, no aggregate. Publica sus entradas en el sobre `Catalog<E>` = `{ entries, total }` (`src/models/catalog.model.ts`), donde `total` cuenta las entradas que publica después de excluir lo mal formado y antes de paginar: una página lista algunas, nunca más                                                                                                                                                                                                                                                                                                                                                                                                                         | Catálogo                                                |
| **Entrada**              | `<Entidad>CatalogEntry`    | Lo que el catálogo muestra de una obra, un autor o una colección. Unión discriminada `CatalogEntry` sobre `CatalogEntryBase<K>` (`kind` + `slug`), con `K` restringido a `CatalogEntryKind`, la unión de los tipos de entrada que existen (`CATALOG_ENTRY_KINDS`); la base no lleva etiqueta común, cada entrada conserva su campo natural (`title` o `name`). `CatalogEntryBase<K>` y `CatalogEntry` viven en `src/models/catalog.model.ts`; `LiteraryWorkCatalogEntry`, en `src/models/literary-work.model.ts`, y su factory hace cumplir slug válido, título no vacío y al menos un autor, y proyecta exactamente las propiedades de la tabla de abajo. `/literary-work` consume `LiteraryWorkCatalogEntry`; las entradas de autor y colección, _pendientes_ (#2515 y #2725). | Catálogo                                                |
| **Pertenencia**          | `CatalogMembership`        | Especificación del Catálogo: "publicada y cumple las invariantes de su entrada". La aplica el ACL y la compartirá el sitemap (#2715). El Acervo va a impedir publicar lo incompleto (#2714), y el Catálogo igual verifica, por las escrituras que no pasan por el Studio. _Objetivo: hoy la aproximan la query GROQ, que solo trae publicados, y el ACL, que descarta lo mal formado; no existe como función ni como spec_                                                                                                                                                                                                                                                                                                                                                       | Catálogo                                                |
| **Criterios**            | —                          | **Acceso**: llegar al destino (`slug` y la etiqueta del enlace, `title` o `name`). **Localización**: el orden (por slug) y los filtros (etiquetas, autores). **Decisión**: decidir si ir (tiempo de lectura, nacionalidad, años, etc.). Toda propiedad de una entrada se justifica por al menos uno; la que no cumple ninguno no se consulta                                                                                                                                                                                                                                                                                                                                                                                                                                     | Catálogo                                                |
| **Faceta**               | `CollectionFacet`          | Etiqueta con su conteo dentro del resultado visible y su estado de selección                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Catálogo                                                |
| **Destino**              | `Destination`              | **Relación**, no contexto ni tipo: lleva de una entrada a la vista completa de su entidad (la obra en Lectura; el autor en su perfil, que incluye la lista de sus obras; la colección en su página, con sus obras). Se resuelve con `destinationOf(entry)` a partir de `kind` y `slug` (_pendiente_: se introduce cuando una superficie consuma la unión `CatalogEntry` y no una sola entrada). Se puede promover a tipo propio si aparece un destino que no sea una página                                                                                                                                                                                                                                                                                                      | Catálogo → Lectura / perfil / colección                 |
| **Selección**            | —                          | Parte del Acervo elegida y ordenada para presentarla. **Curada** (la elige el editor) o **generada** (la producen métricas o un algoritmo)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Selecciones                                             |
| **Curaduría**            | —                          | Elegir y ordenar parte del Acervo para presentarlo: el origen de las selecciones curadas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Selecciones                                             |
| **Avance**               | `*Teaser`                  | Vista para selecciones y para las listas de obras dentro de un destino (perfil del autor, página de colección), con lo que invita a leer o visitar la entidad (portada, extracto, medios)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Selecciones · destinos                                  |
| **Campaña de contenido** | `ContentCampaign`          | Promoción temporal de contenido con variantes responsivas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Selecciones                                             |
| **Lectura**              | `Reading`                  | Leer una obra y lo que el lector hace al leer. Contexto condicional                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Lectura                                                 |
| **Colaborador**          | `Contributor`              | Persona que contribuye al proyecto en algún rol                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Administración                                          |

> **Uso del vocabulario.** _Listado_ es una palabra genérica, sin significado de dominio: nombra cualquier lista que una superficie muestre, sea del catálogo, de un destino o de una selección. _Catálogo_ nombra solo el contexto; el inventario completo de lo cargado es el Acervo, y ni Storybook ni la lista de tareas de `pnpm ops` se llaman catálogo. _Entrada_ a secas es la del catálogo; la de Storybook se nombra siempre calificada ("entrada de Storybook"), y _punto de acceso_ no se usa como sinónimo. _Teaser_ es el avance, no la vista de los listados del catálogo.

---

## Patrones y Estrategias

### Patrón: Criterios de una entrada

Toda propiedad de una entrada del catálogo se justifica por al menos uno de tres criterios:

- **Acceso**: lo que hace falta para llegar al destino y nombrar el enlace: el `slug` y la etiqueta (`title` en obras y colecciones, `name` en autores). El `kind` no es una propiedad que se consulte: lo fija el tipo de entrada y, junto con el `slug`, resuelve el destino.
- **Localización**: el orden, por slug, y los filtros, por etiquetas y por autores.
- **Decisión**: lo que ayuda a decidir si ir: el tiempo de lectura, la nacionalidad o los años del autor, etc.

La que no cumple ninguno no se consulta. Esto distingue a la entrada del avance: el avance puede llevar portada, extracto y medios porque su trabajo es invitar, no permitir localizar.

Propiedades de cada entrada (la de obra está implementada y la sirve `GET /api/literary-work`: la proyecta la query `literaryWorkCatalogEntriesQuery` y la construye `createLiteraryWorkCatalogEntry`; las de autor y colección, pendientes en #2515 y #2725). La entrada transporta además `kind`, el discriminante que fija su tipo, que no se consulta:

| Entrada                    | Propiedades                                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `LiteraryWorkCatalogEntry` | `slug`, `title`, `authors{slug, name}`, `totalReadingTime`, `tags{slug, title}`                                   |
| `AuthorCatalogEntry`       | `slug`, `name`, `nationality{flag, country}`, `bornOnYear`, `diedOnYear`, `tags{slug, title}`                     |
| `CollectionCatalogEntry`   | `slug`, `title`, `description`, `imagery`, `count`, `tags{slug, title}` (todas las etiquetas, no solo la primera) |

### Patrón: Faceta (Faceted Navigation)

**Descripción:** una **faceta** es una etiqueta acompañada de cuántas entidades del resultado **visible** la llevan, más si está elegida como filtro. No es la etiqueta: `Tag` es un documento del CMS que existe con independencia de que algo lo use, mientras que una faceta solo existe contra un conjunto de resultados concreto y su número cambia cada vez que ese conjunto cambia.

**Origen del término:** viene de la clasificación facetada de la biblioteconomía (S. R. Ranganathan, década de 1930), que clasifica un objeto por varios ejes independientes en lugar de por un único árbol jerárquico. Recuperación de información lo adoptó, y de ahí pasó a los motores de búsqueda —Solr y Elasticsearch llaman _faceting_ a la agregación que cuenta documentos por valor de campo— y a las interfaces de catálogo, donde _faceted navigation_ nombra la columna de filtros con su conteo al lado. Es vocabulario **foráneo al dominio de La Cuentoneta**: se adopta porque nombra con precisión una figura que ya existía sin nombre, no porque el negocio hablara así.

**Semántica que hay que preservar:**

- El conteo se calcula sobre lo que está a la vista, **no** sobre el conjunto completo que se está filtrando: al elegir una etiqueta, las demás ajustan su número a lo que queda.
- Una faceta que llegaría a cero no se ofrece. De ahí se sigue una garantía que conviene no romper: elegir filtros **nunca puede vaciar el listado**, porque toda faceta ofrecida tiene al menos una entidad detrás.
- Combinar dos facetas es conjunción, no disyunción: el resultado son las entidades que llevan **todas** las etiquetas elegidas.
- La selección no es estado de la faceta sino del listado: quien filtra decide, y la faceta se limita a reflejar esa decisión. Así el panel nunca puede discrepar de lo que se está mostrando.

**Dónde vive:** es un **modelo de lectura derivado**, no un agregado ni un objeto de valor del contenido. No se persiste en Sanity, ninguna query GROQ la produce y no viaja por el API: hoy se calcula en el frontend sobre las entidades ya cargadas. Si el filtrado pasara a resolverse contra la base, lo que cambia es dónde se cuenta —la agregación la haría la query—, no el concepto ni su semántica.

**Qué no es:**

- No es una etiqueta con un contador pegado: fuera de un resultado concreto, una faceta no significa nada.
- No es una taxonomía nueva. Las facetas de hoy salen de las etiquetas existentes; otro eje de clasificación (autor, año, extensión) daría facetas distintas sobre el mismo patrón.

### Patrón: Clave de Negocio (Business Key)

**Descripción:** En lugar de depender únicamente del identificador técnico (`_id` de Sanity), cada agregado raíz expone un `slug` como clave de negocio única e inmutable. El uso de `_id` se reserva únicamente para el manejo en consultas GROQ y en manipulaciones específicas en la capa de datos.

**Beneficios:**

- URLs amigables y SEO-friendly
- Significado semántico
- Resilencia ante cambios de tecnología

**Implementación:**

```typescript
// ❌ Incorrecto - Usar solo el _id técnico
GET /api/literary-work/65d3b8c2a9f1b2c3d4e5f6g7

// ✅ Correcto - Usar el slug de negocio
GET /api/literary-work/el-aleph
GET /api/author/jorge-luis-borges
```

---

### Patrón: Vistas Polimórficas (Projection Pattern)

**Descripción:** Un agregado expone múltiples interfaces para diferentes casos de uso.

**Implementación:**

```typescript
// Vista completa — destino: Lectura (obra), perfil (autor), página (colección)
LiteraryWork → secciones, autores completos
Author → biografía y recursos
Collection → sus obras, como avances

// Avance — vista para selecciones y para las listas de obras dentro de un destino (perfil del
// autor, página de colección): lo que invita a leer o visitar (portada, extracto, medios)
LiteraryWorkTeaser → extracto del arranque, sin secciones completas
AuthorTeaser · CollectionTeaser

// Navegación — enlace mínimo dentro de una selección (lo más leído, lo último)
LiteraryWorkNavigationTeaser → información mínima
LiteraryWorkNavigationTeaserWithAuthors → con autores resumidos

// Entrada de catálogo — la de obra implementada; las de autor y colección, pendientes (#2515, #2725): lo mínimo que justifican los criterios
LiteraryWorkCatalogEntry · AuthorCatalogEntry · CollectionCatalogEntry

// Catálogo — el sobre en el que el catálogo publica sus entradas
Catalog<E> → { entries, total }
```

> **Transitorio.** Hoy los endpoints del Catálogo `GET /api/collection` y `GET /api/author`, y las páginas `/authors` y `/collection`, todavía sirven y consumen avances, aunque el avance sea la vista de las selecciones y de las listas dentro de un destino. Deja de ser así cuando existan sus entradas de catálogo (#2515 para autores, #2725 para colecciones).

**Beneficios:**

- Optimización de transferencia de datos
- Flexibilidad en presentación
- Reutilización de tipos

---

### Patrón: Composición sobre Herencia

**Descripción:** En lugar de jerarquías complejas, usamos composición de objetos de valor.

```typescript
// ✅ Composición
interface Author {
	nationality: AuthorNationality; // Objeto de valor
	resources: Resource[]; // Array de objetos de valor
}

// ❌ En lugar de jerarquías
interface AuthorNorthAmerican extends Author {}
interface AuthorSouthAmerican extends Author {}
```

---

### Patrón: Capa Anti-Corrupción (Anti-Corruption Layer)

**Descripción:** Aislar el dominio del CMS mediante funciones de mapeo explícitas.

**Estructura:**

```
Sanity Schema (externo)
    ↓ (GROQ Query)
Sanity Service
    ↓ (Mapping Function)
Domain Model
    ↓ (HTTP)
Frontend / API Client
```

**Ubicación:** `src/api/_utils/functions.ts`

**Funciones Clave:**

- `mapAuthor()` - Author completo
- `mapAuthorTeaser()` - Author reducido
- etc.

**Beneficio:** El cambio en Sanity no afecta el dominio si se mantienen los contratos. Esto incluye descartar en la frontera lo que el schema no puede garantizar sobre el dato ya persistido (ver [Resource](#resource-recurso-externo)), no solo traducir shapes.

---

## Estructura de Capas

La arquitectura de La Cuentoneta sigue un modelo de capas explícito:

```
┌─────────────────────────────────────────────┐
│         Capa de Presentación                │
│  (Angular Components, Pages, Templates)    │
├─────────────────────────────────────────────┤
│         Capa de Aplicación                  │
│  (Angular Services, Controllers)            │
├─────────────────────────────────────────────┤
│         Capa de Dominio                     │
│  (Modelos, Agregados, Objetos de Valor)   │
├─────────────────────────────────────────────┤
│       Capa de Infraestructura                │
│  (Sanity Client, GROQ Queries, Mappers)    │
├─────────────────────────────────────────────┤
│        Capa de Persistencia                 │
│         (Sanity CMS)                       │
└─────────────────────────────────────────────┘
```

### Responsabilidades por Capa

**Kernel compartido (src/)**

- `models/` - Modelo de dominio compartido por la app, el backend y el Studio (capa de dominio)
- `utils/` - Utilidades puras compartidas
- `sanity/` - Tipos generados del schema de Sanity
- `mocks/` - Corpus de prueba compartido

**Frontend (src/app)**

- `models/` - Tipos de configuración de UI (capa de presentación)
- `providers/` - Servicios Angular (capa de aplicación)
- `pages/` - Componentes de página (capa de presentación)
- `components/` - Componentes reutilizables (capa de presentación)

**Backend (src/api)**

- `modules/*/` - Servicios de negocio (capa de aplicación/dominio)
- `_queries/` - Consultas GROQ (capa de infraestructura)
- `_utils/functions.ts` - Mapeo (capa anti-corrupción)
- `_helpers/sanity.ts` - Cliente Sanity (capa de infraestructura)

---

### Conceptos Clave

- [Domain-Driven Design (Wikipedia)](https://en.wikipedia.org/wiki/Domain-driven_design)
- [Bounded Context (DDD Community)](https://www.domainlanguage.com/ddd/reference/)
- [Aggregate Pattern](https://martinfowler.com/bliki/DDD_Aggregate.html)
- [Value Objects](https://martinfowler.com/eaaCatalog/valueObject.html)

### Recursos en el Proyecto

- [Guía de Desarrollo](./DEVELOPMENT_GUIDE.md) - Setup y proceso de desarrollo
- [Sanity CMS Integration](./SANITY.md) - Detalles de CMS y tipado
- [Documentación de Arquitectura](./DEVELOPMENT_GUIDE.md#arquitectura) - Visión general técnica
- [Estrategias de Actualización de Contenido](./CONTENT_UPDATE_STRATEGIES.md) - cron jobs y generación automática de configuraciones

### Comunidad y Aprendizaje

- [DDD Community](https://www.domainlanguage.com/)
- [Virtual Domain-Driven Design](https://www.virtualddd.com/)
- [Domain Language Blog](https://www.domainlanguage.com/blog/)

---

## Apéndice: Diagrama de Contextos

```
┌──────────────────────────────────────────────────────────────────────┐
│                           LA CUENTONETA                              │
├──────────────────────────────────────────────────────────────────────┤
│                    ┌──────────────────────────────┐                  │
│                    │            ACERVO            │                  │
│                    │  LiteraryWork · Author ·     │                  │
│                    │  Collection (documentos)     │                  │
│                    │  borrador ⇄ publicado        │                  │
│                    └──────────────┬───────────────┘                  │
│                                   │ upstream (ACL)                   │
│          ┌────────────────────────┼────────────────────────┐         │
│          ▼                        ▼                        ▼         │
│  ┌───────────────┐       ┌─────────────────┐      ┌────────────────┐ │
│  │   CATÁLOGO    │       │   SELECCIONES   │      │    LECTURA     │ │
│  │ solo lectura  │       │ curadas ·       │      │ (condicional)  │ │
│  │ entradas      │       │ generadas       │      │ obra para leer │ │
│  │ pertenencia   │       │ avances         │      │                │ │
│  └───────┬───────┘       └─────────────────┘      └───────▲────────┘ │
│          │  Destino (relación): obra → Lectura ·          │          │
│          │  autor → perfil · colección → su página        │          │
│          └────────────────────────────────────────────────┘          │
│                                                                      │
│  ┌────────────────┐                                                  │
│  │ ADMINISTRACIÓN │  independiente                                   │
│  │  Contributor   │                                                  │
│  └────────────────┘                                                  │
└──────────────────────────────────────────────────────────────────────┘
```
