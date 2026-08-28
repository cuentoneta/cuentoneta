<div align="center" width="100%">
    <h1>La Cuentoneta</h1>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
        <img width="33%" alt="La Cuentoneta" src="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
    </picture>
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
7. [Mejoras Recomendadas](#mejoras-recomendadas) (ver [DDD_IMPROVEMENTS.md](./DDD_IMPROVEMENTS.md))
8. [Referencias](#referencias)

---

## Contextos Acotados (Bounded Contexts)

Un **Contexto Acotado** (Bounded Context) es un límite explícito dentro del cual un modelo de dominio es aplicable. En La Cuentoneta, identificamos cuatro contextos acotados principales:

### 1. **Contexto de Catálogo de Contenido**

**Propósito:** Gestionar el inventario completo de obras literarias, autores y sus metadatos.

**Agregados Raíz:**

- `Author` - Autores del contenido
- `LiteraryWork` - Obras literarias con secciones/capítulos

**Responsabilidades:**

- Almacenar y recuperar obras literarias seccionadas con contenido Markdown saneado a HTML
- Mantener perfiles completos de autores con biografías y referencias
- Gestionar metadatos como tiempo de lectura, idioma, advertencias de contenido
- Proporcionar múltiples vistas del contenido (teaser, navegación, preview)

**Interfaces de API:**

```
GET /api/author/:slug              # Obtener autor completo
GET /api/literary-work/:slug       # Obtener obra literaria completa
GET /api/literary-work             # Catálogo de obras (teasers), filtrable por query params
```

---

### 2. **Contexto de Curación y Colecciones**

**Propósito:** Organizar obras literarias en colecciones temáticas, cronológicas o editoriales.

**Agregados Raíz:**

- `Collection` - Colecciones de obras literarias. Es la única con página propia: sirve su catálogo y su detalle; el sitemap la lista por slug. `Storylist`, la forma anterior que agrupaba historias, se retiró junto con su endpoint y su document type; las URLs viejas responden con un traslado permanente. Ver [el agregado](#agregado-collection-colección-de-obras-literarias)

**Responsabilidades:**

- Crear y mantener colecciones de obras (antologías, certámenes, curadurías)
- Gestionar el orden y el estado de publicación de obras dentro de colecciones
- Definir metadatos de colecciones (descripción, imagen destacada, etiquetas)
- Proporcionar información sobre próximas publicaciones

**Interfaces de API:**

```
GET /api/collection                # Catálogo de colecciones, en vista de teaser
GET /api/collection/:slug          # Colección completa, con sus obras literarias
```

---

### 3. **Contexto de Administración del Proyecto**

**Propósito:** Gestionar información sobre los colaboradores y contribuyentes del proyecto.

**Agregados Raíz:**

- `Contributor` - Miembros del equipo y colaboradores

**Responsabilidades:**

- Mantener registro de contribuyentes
- Clasificar contribuyentes por área de trabajo (staff, programación, generación de contenido, curación)
- Proporcionar información de contacto y redes sociales

**Interfaces de API:**

```
GET /api/contributor               # Obtener lista de colaboradores
```

---

### 4. **Contexto de Página de Inicio**

**Propósito:** Agregar y organizar contenido para la página de inicio.

**Agregados Raíz:**

- `LandingPageContent` - Contenido de la página principal
- `ContentCampaign` - Contenido destacado/promocionado en la plataforma

**Responsabilidades:**

- Organizar colecciones destacadas
- Gestionar campañas de contenido con variantes responsivas
- Mantener listados de historias más leídas y recientes
- Proporcionar múltiples vistas según dispositivo (xs, md)

**Interfaces de API:**

```
GET /api/content                   # Obtener contenido de página inicio
```

---

## Agregados y Raíces de Agregado

Un **Agregado** es un cluster de objetos de dominio (entidades y objetos de valor) que se tratan como una unidad para fines de cambios en los datos. La **Raíz de Agregado** es la entidad que define el límite del agregado.

### Agregado: Story (Historia) — retirado

> **Estado: retirado.** El document type `story` y su endpoint (`/api/story`) se dieron de baja, y sus documentos se purgaron del dataset: el catálogo de contenido narrativo hoy es exclusivamente `LiteraryWork` (ver más abajo). La purga es lo que separa un tipo apagado de un tipo que ya no está — dar de baja el schema deja los documentos en el content lake, invisibles pero presentes. Esta sección se conserva como referencia histórica del modelo que `LiteraryWork` reemplazó.

**Raíz de Agregado:** `Story`

```typescript
interface Story {
	// Identidad
	_id: string; // Identificador único (Sanity)
	slug: string; // Clave de negocio, invariante única

	// Contenido
	title: string; // Título de la historia
	paragraphs: TextBlockContent[]; // Cuerpo principal (nunca vacío)
	summary: TextBlockContent[]; // Sinopsis
	epigraphs: Epigraph[]; // Epígrafes literarios opcionales

	// Metadatos
	approximateReadingTime: number; // Minutos estimados de lectura (>= 1)
	badLanguage?: boolean; // Advertencia de lenguaje explícito
	originalPublication: string; // Atribución/publicación original
	publishedAt: string; // Fecha ISO de publicación en la plataforma (fallback a _createdAt). Datos estructurados/E-E-A-T
	updatedAt: string; // Fecha ISO de última modificación (_updatedAt de Sanity)

	// Imagen
	coverImage: string; // URL de portada de la historia; '' si no fue asignada

	// Relaciones
	author: Author; // Autor de la historia (requerido)

	// Categorización
	tags: Tag[]; // Etiquetas de taxonomía (editoriales). Vacío en los teasers

	// Recursos Multimedia
	resources: Resource[]; // Enlaces a recursos externos
	media: Media[]; // Contenido multimedia (audio, video, tweets)
}
```

**Invariantes de Negocio:**

- El slug debe ser único y no puede cambiar una vez creado
- Toda historia debe tener un autor
- La historia debe tener al menos un párrafo de contenido
- El tiempo de lectura debe ser un número positivo
- El idioma debe ser un código ISO válido
- `resources` nunca contiene un ítem con `url` ausente o vacía (ver [Resource](#resource-recurso-externo))

**Ciclo de Vida:**

```
Borrador en Sanity → Publicación en Contexto (Storylist, perfil de Autor) → Accesible para lectura
```

**Entidades Secundarias:**

Un epígrafe es un bloque de texto opcional que se utiliza para referenciar otros textos o trabajos literarios. La plataforma permite

```typescript
interface Epigraph {
	text: TextBlockContent[]; // El epígrafe
	reference: TextBlockContent[]; // Referencia/fuente
}
```

**Vistas Polimórficas:**

- `Story` - Vista completa (incluye párrafos, epígrafes, autor completo)
- `StoryTeaser` - Vista resumida (sin párrafos)
- `StoryNavigationTeaser` - Vista mínima para navegación
- `StoryNavigationTeaserWithAuthor` - Vista mínima con autor resumido

---

### Agregado: LiteraryWork (Obra literaria)

**Raíz de Agregado:** `LiteraryWork`

> Contratos completos y decisiones de diseño en [`LITERARY_WORK_DESIGN.md`](LITERARY_WORK_DESIGN.md). `LiteraryWork` es el agregado que sirve todo el contenido narrativo del catálogo. Es la primera raíz de agregado con **invariantes implementadas en código** (factory `createLiteraryWork` + value objects brandeados en `src/models/`).

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
	chapterTitle?: ChapterTitle; // Opcional; expone toAnchor(): Slug para anclas
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
Borrador en Sanity → Publicación → Accesible para lectura en /literary-work/:slug
```

**Vistas Polimórficas:**

- `LiteraryWork` - Vista completa (todas las secciones, autores completos)
- `LiteraryWorkTeaser` - Vista resumida: expone un **extracto** del arranque de la obra (`excerpt`), que no declara tiempo de lectura ni posición porque su cuerpo va recortado
- `LiteraryWorkNavigationTeaser` - Vista mínima para navegación
- `LiteraryWorkNavigationTeaserWithAuthors` - Vista mínima con autores resumidos

`mediaSources` lo exponen **todas** las vistas, cada una con el tipo de su vista: `LiteraryWork` transporta `Media[]` (la vista completa, con la carga del recurso); `LiteraryWorkTeaser`, `LiteraryWorkNavigationTeaser` y `LiteraryWorkNavigationTeaserWithAuthors` transportan `MediaTeaser[]` (solo el `type`), que es lo único que la tarjeta de listado necesita para pintar el ícono de la plataforma — ver [Media](#media-contenido-multimedia).

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
Borrador de perfil -> Publicación de perfil -> Perfil disponible para búsqueda
```

**Vistas Polimórficas:**

- `Author` - Vista completa (incluye biografía y recursos)
- `AuthorTeaser` - Vista resumida: no declara `biography` (la ausencia se expresa en el tipo, no en un valor vacío) ni `resources` (`Array<never>`)

---

### Agregado: Storylist (Colección) — retirado

> **Estado: retirado.** El document type `storylist` y su endpoint (`/api/storylist`) se dieron de baja, y sus documentos se purgaron del dataset: la curación de obras en colecciones hoy es exclusivamente `Collection` (ver más abajo). Esta sección se conserva como referencia histórica del modelo que `Collection` reemplazó.

**Raíz de Agregado:** `Storylist`

```typescript
interface Storylist {
	// Identidad
	_id: string; // Identificador único (Sanity)
	title: string; // Nombre de la colección
	slug: string; // Clave de negocio, invariante única

	// Metadatos
	count: number; // Total de historias

	// Contenido
	description: TextBlockContent[]; // Descripción de la colección
	imagery: StorylistImagery; // representative (portada editorial) o sample (portadas de historias)
	tags: Tag[]; // Etiquetas de categorización

	// Configuración
	config: {
		showAuthors: boolean; // ¿Mostrar información de autores?
	};

	// Composición
	stories: StoryTeaserWithAuthor[]; // Historias en la colección (ordenadas)
}
```

**Invariantes de Negocio:**

- El slug debe ser único
- `count` debe coincidir con el número real de stories
- `imagery` es un value object (`{ kind: 'representative', image }` cuando hay portada editorial propia; `{ kind: 'sample', images }` con las portadas de las historias cuando no la hay). Las dos vistas polimórficas de la colección (`Storylist`, `StorylistTeaser`) lo comparten desde `StorylistBase`, en vez de exponer una `featuredImage` cruda.

**Ciclo de Vida:**

```
Creación de colección → Adición de historias → Publicación de colección
```

**Relación con Story:**
Las historias se referencian directamente en el array `stories`. Cada entrada es una proyección de tipo `StoryTeaserWithAuthor`, que incluye la información esencial de la historia y su autor.

**Vistas Polimórficas:**

- `Storylist` - Vista completa (incluye todas las historias con información de autor)
- `StorylistTeaser` - Vista sin historias

---

### Agregado: Collection (Colección de obras literarias)

**Raíz de Agregado:** `Collection`

> `Collection` reemplazó a `Storylist`: agrupa `LiteraryWork` en vez de `Story`. Es la única raíz de este contexto, con página propia que sirve su catálogo y su detalle. El sitemap la lista por slug; las URLs viejas de `Storylist` responden con un traslado permanente. Es la **segunda** raíz de agregado con **invariantes hechas cumplir en código** (factory `createCollection` + el value object `Slug`, en `src/models/collection.model.ts`), después de `LiteraryWork` — esa es la dirección del proyecto: cada entidad nueva del catálogo suma sus invariantes al código en vez de solo documentarlas.

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

**La vista de teaser tiene su propia factory (`createCollectionTeaser`):**

Muestra la colección **sin transportar sus obras**, así que no puede derivar `count`: lo **recibe** como dato —la query lo trae contando referencias sin resolverlas— y exige que sea al menos uno. Es la invariante "al menos una obra" traducida a lo único que el teaser sí transporta. Las demás —título no vacío, slug válido, abanico de tres— le siguen aplicando igual.

Existe como factory y no como proyección suelta porque el repository produce teasers desde la query: armarlos como objeto literal perdería esas reglas sin que nada avise. El ensamblado del teaser (`mapSanityCollectionTeaser`, `mapSharedCollectionFields`, `resolveCollectionImagery`) vive en `src/api/modules/collection/collection-teaser.acl.ts` — módulo compartido entre `SanityCollectionRepository` y `SanityContentRepository`, porque las dos proyectan una colección referenciada, cada una desde su propio agregado. Ver [`sanity-acl.md`](../.claude/references/sanity-acl.md).

**Ciclo de Vida:**

```
Creación de colección → Adición de obras literarias → Publicación de colección
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
- `CollectionTeaser` - Vista sin obras (`literaryWorks: Array<never>`)

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
	storyCount: number; // Obras del autor, contadas sobre los documentos literaryWork y story
}
```

El conteo abarca **ambos** tipos de documento a propósito: dar de baja el schema `story` no borra del
dataset los documentos que quedaron sin migrar, y contar solo obras dejaría en cero a todo autor cuya
obra todavía no migró.

`mostRead` y `latestReads` conservan su nombre porque nombran el **rol editorial** del slot; lo transportan obras (`LiteraryWorkNavigationTeaserWithAuthors`). `collections` agrupa `CollectionTeaser` (ver [el agregado](#agregado-collection-colección-de-obras-literarias)). `RotatingContent` es la proyección que el cron de "lo más leído" persiste y expone por separado del resto de la landing — detalle del productor en [Estrategias de Actualización de Contenido](./CONTENT_UPDATE_STRATEGIES.md).

**Responsabilidades:**

- Agregar contenido de múltiples contextos para presentación en página inicio
- Mantener datos de lectura y estadísticas

`HighlightedAuthor` es una proyección de curación de este contexto, no una vista del agregado `Author`: su conteo es un dato que solo esta pantalla paga, y sus etiquetas viajan en el wrapper porque `AuthorTeaser` entrega la suya vacía en toda vista del repositorio.

El tope de seis rige la edición en el Studio y no lo ya persistido, así que el mapeo lo vuelve a aplicar como salvaguarda.

> **Nota:** Para comprender la implementación práctica de este agregado, incluyendo la generación automática de configuraciones y actualización de contenido, consulta la documentación sobre [Estrategias de Actualización de Contenido](./CONTENT_UPDATE_STRATEGIES.md).

---

## Objetos de Valor (Value Objects)

Los **Objetos de Valor** son objetos sin identidad propia que representan conceptos del dominio. Son inmutables y se comparan por su contenido, no por su referencia.

### TextBlockContent

**Propósito:** Representar contenido de texto enriquecido en formato Portable Text (Sanity).

```typescript
interface TextBlockContent {
	// Identificador único dentro del documento
	_key: string;
	_type: 'block';

	// Contenido
	children: Block[]; // Fragmentos de texto con estilos
	markDefs: MarkDef[]; // Definiciones de marcas (enlaces, etc.)

	// Formato
	style: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote';

	// Listas
	listItem?: 'bullet' | 'number';
	level?: number; // Nivel de anidación
}

interface Block {
	_key: string;
	_type: string;
	text: string;
	marks?: string[]; // Referencias a marcas definidas
}

interface MarkDef {
	_key: string;
	_type: string;
	href: string; // URL del enlace
}
```

**Uso:** Descripciones, contenido editorial, resúmenes.

**Inmutabilidad:** Una vez creado por Sanity, no debe ser modificado en la aplicación.

---

### Media (Contenido Multimedia)

**Propósito:** Encapsular diferentes tipos de contenido multimedia.

Dos ejes **ortogonales** organizan el modelo, y conviene no confundirlos:

1. **Qué transporta la proyección.** `Media` es la vista **completa** — la de la página, con la carga (`data`, obligatorio) con la que un widget reproduce el recurso. `MediaTeaser` es la vista de **listado** — el `type`, con el que la tarjeta pinta el ícono de la plataforma, y el `title`, que está por **identidad**: sin él dos recursos de la misma plataforma son indistinguibles, y quien ofrezca elegir entre ellos no puede decir cuál se eligió ni nombrarlos. Ninguno de los dos arrastra costo: son campos planos del documento, a diferencia de la descripción (que cruza el pipeline de Markdown) y de la URL del audio (que dereferencia un asset). Cada una tiene su propia proyección GROQ y su propio mapper (`mapMediaSources` y `mapMediaTeasers`, respectivamente); el teaser no puede prometer lo que su proyección no trae. `data` es obligatorio en `Media` para que la carga no se pueda omitir al armar la vista completa: mientras fue opcional, copiar los campos textuales de un recurso bastaba para construir algo que el compilador aceptaba como reproducible.
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

> El ícono que acompaña a un recurso en la interfaz lo resuelve el frontend a partir del `slug` del tipo, contra el mapa local de `@models/icon.model`. No viaja desde el CMS.

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

> Una etiqueta no lleva ícono: `TagComponent` renderiza solo su título. El CMS supo tener un campo de ícono, pero ninguna superficie lo mostraba.

---

### Icon (Ícono)

**Propósito:** Referenciar iconos desde diferentes proveedores.

> Ninguna entidad del dominio lo declara ya: ni `Tag` ni `ResourceType` llevan ícono. Otras superficies sí muestran íconos, cada una por su cuenta —el pie de página y los botones de compartir los nombran literalmente en el código—, pero ninguna usa este tipo.

```typescript
interface Icon {
	name: string; // Identificador del ícono
	provider: string; // Proveedor ('FontAwesome', 'SimpleIcons', etc.)
}
```

**Proveedores soportados:**

- FontAwesome - Iconos versátiles
- SimpleIcons - Logos de marcas
- Custom - Iconos personalizados

---

### Link (Enlace)

**Propósito:** Representar enlaces internos y externos.

```typescript
interface InternalLink {
	path: string; // Ruta interna (ej: "/literary-work/la-casa-de-los-espíritus")
	label: string; // Texto del enlace
}

interface UrlLink {
	url: string; // URL externa
	label: string; // Texto del enlace
	ariaLabel: string; // Etiqueta de accesibilidad
	icon: string; // Nombre del ícono
	alt: string; // Texto alternativo
}
```

**Patrón:** Polimorfismo mediante tipos específicos.

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

| Término                  | Definición                                                                                                    | Contexto              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- | --------------------- |
| **Obra literaria**       | Obra con secciones/capítulos (`LiteraryWork`)                                                                 | Catálogo de Contenido |
| **Sección / Capítulo**   | Unidad de contenido de una obra literaria: epígrafes + cuerpo Markdown saneado                                | Catálogo de Contenido |
| **Anónimo**              | Author real del catálogo (slug `anonimo`) que representa la obra sin autoría atribuida (policy `isAnonymous`) | Catálogo de Contenido |
| **Slug**                 | Identificador amigable, único e inmutable basado en el título                                                 | Todos                 |
| **Teaser**               | Vista reducida de una entidad para listados y navegación                                                      | Todos                 |
| **Colección**            | Agrupación temática u editorial de obras literarias (`Collection`)                                            | Curación              |
| **Colaborador**          | Persona que contribuye al proyecto en algún rol                                                               | Administración        |
| **Recurso**              | Enlace externo a información complementaria                                                                   | Catálogo de Contenido |
| **Campaña de Contenido** | Promoción temporal de contenido con variantes responsivas                                                     | Página de Inicio      |
| **Curaduría**            | Proceso de seleccionar, ordenar y presentar obras                                                             | Curación              |
| **Faceta**               | Etiqueta con su conteo dentro del resultado visible y su estado de selección (`CollectionFacet`)              | Curación              |

---

## Patrones y Estrategias

### Patrón: Faceta (Faceted Navigation)

**Descripción:** una **faceta** es una etiqueta acompañada de cuántas entidades del resultado **visible** la llevan, más si está elegida como filtro. No es la etiqueta: `Tag` es un documento del CMS que existe con independencia de que algo lo use, mientras que una faceta solo existe contra un conjunto de resultados concreto y su número cambia cada vez que ese conjunto cambia.

**Origen del término:** viene de la clasificación facetada de la biblioteconomía (S. R. Ranganathan, década de 1930), que clasifica un objeto por varios ejes independientes en lugar de por un único árbol jerárquico. Recuperación de información lo adoptó, y de ahí pasó a los motores de búsqueda —Solr y Elasticsearch llaman _faceting_ a la agregación que cuenta documentos por valor de campo— y a las interfaces de catálogo, donde _faceted navigation_ nombra la columna de filtros con su conteo al lado. Es vocabulario **foráneo al dominio de La Cuentoneta**: se adopta porque nombra con precisión una figura que ya existía sin nombre, no porque el negocio hablara así.

**Semántica que hay que preservar:**

- El conteo se calcula sobre lo que está a la vista, **no** sobre el catálogo entero: al elegir una etiqueta, las demás ajustan su número a lo que queda.
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
// Vista completa para lectura profunda
LiteraryWork → incluye secciones, autores completos

// Vista para listados
LiteraryWorkTeaser → extracto del arranque, sin secciones completas

// Vista para navegación
LiteraryWorkNavigationTeaser → información mínima

// Vista con autores para contexto
LiteraryWorkNavigationTeaserWithAuthors → referencia a los autores
```

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

**Frontend (src/app)**

- `models/` - Definición de tipos (capa de dominio)
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
┌────────────────────────────────────────────────────────────────┐
│                     LA CUENTONETA                              │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────┐  ┌─────────────────────────┐   │
│  │  CATÁLOGO DE CONTENIDO  │  │ CURACIÓN Y COLECCIONES │   │
│  │                         │  │                         │   │
│  │  • LiteraryWork         │  │  • Collection          │   │
│  │  • Author               │  │                        │   │
│  │  • Resource             │  │                        │   │
│  │  • Media                │  └─────────────────────────┘   │
│  │                         │           ▲                     │
│  │                         │           │                     │
│  └────────────────────────►├──────────┘                     │
│                            │                                 │
│  ┌─────────────────────────┼─────────────────────────┐     │
│  │                         │                         │     │
│  │  ADMINISTRACIÓN         │  PÁGINA DE INICIO       │     │
│  │                         │                         │     │
│  │  • Contributor          │  • LandingPageContent  │     │
│  │  • ContributorArea      │  • ContentCampaign     │     │
│  │                         │  • mostRead            │     │
│  │                         │  • latestReads         │     │
│  │                         │  • campaigns           │     │
│  │                         │                         │     │
│  └─────────────────────────┴─────────────────────────┘     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```
