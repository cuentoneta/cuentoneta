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

**Propósito:** Gestionar el inventario completo de historias, autores y sus metadatos.

**Agregados Raíz:**

- `Story` - Historias publicadas
- `Author` - Autores del contenido

**Responsabilidades:**

- Almacenar y recuperar historias con toda su información (párrafos, epígrafes, recursos, multimedia)
- Mantener perfiles completos de autores con biografías y referencias
- Gestionar metadatos como tiempo de lectura, idioma, advertencias de contenido
- Proporcionar múltiples vistas del contenido (teaser, navegación, preview)

**Interfaces de API:**

```
GET /api/author/:slug              # Obtener autor completo
GET /api/story/:slug               # Obtener historia completa
POST /api/story/most-read          # Obtener historias más leídas
```

---

### 2. **Contexto de Curación y Colecciones**

**Propósito:** Organizar historias en colecciones temáticas, cronológicas o editoriales.

**Agregados Raíz:**

- `Storylist` - Colecciones de historias

**Responsabilidades:**

- Crear y mantener colecciones de historias (antologías, certámenes, curadurías)
- Gestionar el orden y el estado de publicación de historias dentro de colecciones
- Definir metadatos de colecciones (descripción, imagen destacada, etiquetas)
- Proporcionar información sobre próximas publicaciones

**Interfaces de API:**

```
GET /api/storylist/:slug           # Obtener colección completa
GET /api/storylist/:slug/teaser    # Obtener resumen de colección
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

### Agregado: Story (Historia)

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
	language: string; // Código ISO del idioma
	badLanguage?: boolean; // Advertencia de lenguaje explícito
	originalPublication: string; // Atribución/publicación original

	// Relaciones
	author: Author; // Autor de la historia (requerido)

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
	biography: TextBlockContent[]; // Biografía del autor
	resources: Resource[]; // Enlaces a recursos sobre el autor
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

**Ciclo de Vida:**

```
Borrador de perfil -> Publicación de perfil -> Perfil disponible para búsqueda
```

**Vistas Polimórficas:**

- `Author` - Vista completa (incluye biografía y recursos)
- `AuthorTeaser` - Vista resumida (sin biografía ni recursos)

---

### Agregado: Storylist (Colección)

**Raíz de Agregado:** `Storylist`

```typescript
interface Storylist {
	// Identidad
	title: string; // Nombre de la colección
	slug: string; // Clave de negocio, invariante única

	// Metadatos
	language: string; // Código ISO del idioma
	displayDates: boolean; // ¿Mostrar fechas de publicación?
	editionPrefix: string; // Prefijo para ediciones ("Número", "Volumen", etc.)
	comingNextLabel: string; // Etiqueta para próximas publicaciones
	count: number; // Total de historias

	// Contenido
	description: TextBlockContent[]; // Descripción de la colección
	featuredImage: string; // URL de imagen destacada
	tags: Tag[]; // Etiquetas de categorización

	// Composición
	publications: Publication[]; // Historias en la colección (ordenadas)
}

interface Publication {
	// Orden y estado
	publishingOrder: number; // Número en la secuencia
	published: boolean; // ¿Ya fue publicada?
	publishingDate?: string; // Fecha de publicación (formato YYYY-MM-DD)

	// Referencia a historia
	story: StoryNavigationTeaserWithAuthor;
}
```

**Invariantes de Negocio:**

- El slug debe ser único
- El idioma debe ser un código ISO válido
- `publications` siempre está ordenado por `publishingOrder`
- `publishingOrder` comienza en 1
- Si `published` es true, `publishingDate` debe estar definido
- `count` debe coincidir con el número real de publicaciones

**Ciclo de Vida:**

```
Creación de colección → Adición de historias → Publicación de colección
```

**Relación con Story:**
`Publication` es una **entidad secundaria**, no una raíz de agregado. Existe solo en el contexto de `Storylist`. No tiene identidad propia fuera de su colección padre.

**Vistas Polimórficas:**

- `Storylist` - Vista completa (incluye todas las publicaciones con detalles)
- `StorylistPublicationsNavigationTeasers` - Vista para navegación (publicaciones mínimas)
- `StorylistTeaser` - Vista sin publicaciones

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

	// Composición
	cards: StorylistTeaser[]; // Colecciones destacadas
	campaigns: ContentCampaign[]; // Campañas de marketing
	mostRead: StoryNavigationTeaserWithAuthor[]; // Top 10 historias más leídas
	latestReads: StoryNavigationTeaserWithAuthor[]; // Últimas historias publicadas
}
```

**Responsabilidades:**

- Agregar contenido de múltiples contextos para presentación en página inicio
- Mantener datos de lectura y estadísticas

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

**Uso:** Biografías, descripciones, contenido editorial, resúmenes.

**Inmutabilidad:** Una vez creado por Sanity, no debe ser modificado en la aplicación.

---

### Media (Contenido Multimedia)

**Propósito:** Encapsular diferentes tipos de contenido multimedia.

```typescript
interface Media {
	title: string;
	description: TextBlockContent[];
	type: MediaTypeKey; // 'audioRecording' | 'spaceRecording' | 'youTubeVideo'
	data?: unknown;
}

interface AudioRecording extends Media {
	data: { url: string };
}

interface SpaceRecording extends Media {
	data: Tweet & { duration: string };
}

interface YouTubeVideo extends Media {
	data: { videoId: string };
}
```

**Patrón:** Polimorfismo mediante discriminador (`type`).

**Uso:** Asociar audio, tweets de espacios de X, y videos a historias.

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
	shortDescription: string; // Descripción corta
	description: TextBlockContent[]; // Descripción detallada
	icon: Icon; // Ícono de representación
}
```

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
	shortDescription: string; // Breve descripción
	description: TextBlockContent[]; // Descripción completa
	icon?: Icon; // Ícono opcional
}
```

**Uso:** Clasificar contenido por tema, género, etc.

---

### Icon (Ícono)

**Propósito:** Referenciar iconos desde diferentes proveedores.

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
	path: string; // Ruta interna (ej: "/story/la-casa-de-los-espíritus")
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

**Propósito:** Definir campañas de contenido, destacando algún perfil de autor, storylist o link particular en la plataforma.

```typescript
interface ContentCampaign {
	slug: string; // Identificador único
	title: string; // Título de la campaña
	description: TextBlockContent[]; // Descripción
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

| Término                  | Definición                                                    | Contexto              |
| ------------------------ | ------------------------------------------------------------- | --------------------- |
| **Historia**             | Obra literaria curada y publicada en la plataforma            | Catálogo de Contenido |
| **Slug**                 | Identificador amigable, único e inmutable basado en el título | Todos                 |
| **Epígrafe**             | Cita literaria que precede al texto principal                 | Catálogo de Contenido |
| **Teaser**               | Vista reducida de una entidad para listados y navegación      | Todos                 |
| **Colección**            | Agrupación temática u editorial de historias                  | Curación              |
| **Publicación**          | Instancia de una historia dentro de una colección             | Curación              |
| **Colaborador**          | Persona que contribuye al proyecto en algún rol               | Administración        |
| **Recurso**              | Enlace externo a información complementaria                   | Catálogo de Contenido |
| **Campaña de Contenido** | Promoción temporal de contenido con variantes responsivas     | Página de Inicio      |
| **Curaduría**            | Proceso de seleccionar, ordenar y presentar historias         | Curación              |

---

## Patrones y Estrategias

### Patrón: Clave de Negocio (Business Key)

**Descripción:** En lugar de depender únicamente del identificador técnico (`_id` de Sanity), cada agregado raíz expone un `slug` como clave de negocio única e inmutable. El uso de `_id` se reserva únicamente para el manejo en consultas GROQ y en manipulaciones específicas en la capa de datos.

**Beneficios:**

- URLs amigables y SEO-friendly
- Significado semántico
- Resilencia ante cambios de tecnología

**Implementación:**

```typescript
// ❌ Incorrecto - Usar solo el _id técnico
GET /api/story/65d3b8c2a9f1b2c3d4e5f6g7

// ✅ Correcto - Usar el slug de negocio
GET /api/story/el-aleph
GET /api/author/jorge-luis-borges
```

---

### Patrón: Vistas Polimórficas (Projection Pattern)

**Descripción:** Un agregado expone múltiples interfaces para diferentes casos de uso.

**Implementación:**

```typescript
// Vista completa para lectura profunda
Story → incluye paragrafos, epígrafes, autor completo

// Vista para listados
StoryTeaser → sin contenido pesado

// Vista para navegación
StoryNavigationTeaser → información mínima

// Vista con autor para contexto
StoryNavigationTeaserWithAuthor → referencia al autor
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

- `mapStoryContent()` - Story → formato de presentación
- `mapAuthor()` - Author completo
- `mapAuthorTeaser()` - Author reducido
- etc.

**Beneficio:** El cambio en Sanity no afecta el dominio si se mantienen los contratos.

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
│  │  • Story                │  │  • Storylist           │   │
│  │  • Author               │  │  • Publication         │   │
│  │  • Resource             │  │                        │   │
│  │  • Media                │  └─────────────────────────┘   │
│  │  • Epigraph             │           ▲                     │
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
