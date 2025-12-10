<div align="center" width="100%">
    <h1>La Cuentoneta</h1>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
        <img width="33%" alt="La Cuentoneta" src="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
    </picture>
</div>

---

# Especificación: comunidades literarias

## Tabla de contenidos

1. [Introducción y justificación](#introducción-y-justificación)
2. [Concepto de comunidad](#concepto-de-comunidad)
3. [Elementos de dominio identificados](#elementos-de-dominio-identificados)
4. [Nuevos agregados y raíces de agregado](#nuevos-agregados-y-raíces-de-agregado)
5. [Relaciones entre agregados](#relaciones-entre-agregados)
6. [Requerimientos previos (bloqueadores)](#requerimientos-previos-bloqueadores)
7. [Requerimientos funcionales por módulo](#requerimientos-funcionales-por-módulo)
8. [Estructura de datos (esquemas Sanity)](#estructura-de-datos-esquemas-sanity)
9. [Arquitectura de API backend](#arquitectura-de-api-backend)
10. [Arquitectura de frontend](#arquitectura-de-frontend)
11. [Gestión de usuarios y autenticación](#gestión-de-usuarios-y-autenticación)
12. [Gestión de eventos](#gestión-de-eventos)
13. [Gestión de entradas de blog](#gestión-de-entradas-de-blog)
14. [Plantillas de contenido dinámicas](#plantillas-de-contenido-dinámicas)
15. [Consideraciones de SEO](#consideraciones-de-seo)
16. [Plan de implementación](#plan-de-implementación)

---

## Introducción y justificación

La Cuentoneta tiene como misión la construcción colectiva de una plataforma accesible que fomente, comparta y difunda la lectura digital. Reconociendo esta naturaleza colectiva, se propone expandir la plataforma para permitir que organizaciones, colectivos y comunidades literarias afiancen su presencia y puedan potenciar sus actividades en el área digital mediante la implementación de subespacios propios en La Cuentoneta.

### Comunidades iniciales objetivo

Estas comunidades ofician de _focus group_ para una implementación inicial de la funcionalidad de comunidades:

- **Tertulia Literaria** - Comunidad digital de análisis y discusión literaria
- **Book & Morfi** - Club de lectura con enfoque gastronómico
- **La conspiración de los fuleros** - Cofradía literaria contemporánea
- **Asociación de Escritores de Santa Fe (ASDE)** - Institución que nuclea escritoras y escritores de la Provincia de Santa Fe, Argentina

### Beneficios esperados

1. **Alcance Ampliado**: Difusión de material literario diverso generado o curado por través de múltiples comunidades digitales,
2. **Contenido Curado**: Cada comunidad puede establecer sus propios criterios de curación,
3. **Diversidad de Perspectivas**: Múltiples voces y enfoques sobre la literatura
4. **Redes de Colaboración**: Facilitar conexiones entre comunidades y autores
5. **Sostenibilidad del Proyecto**: Crear un modelo donde múltiples organizaciones inviertan en La Cuentoneta

---

## Concepto de comunidad

### Definición de dominio

Una **comunidad** (`community`) es una organización de personas que comparten elementos en común y persiguen un fin determinado. En el contexto de La Cuentoneta, las comunidades literarias son aquellas que generan, difunden, consumen y/o comparten contenido literario en todas sus formas.

### Características fundamentales

**Atributos organizacionales:**

- **Identidad**: Nombre único, slug único e inmutable, descripción
- **Imagen corporativa**: Logo, banner, paleta de colores, iconografía
- **Presencia digital**: Enlaces a redes sociales, sitios web, canales de contacto
- **Propósito declarado**: Misión, visión, valores de la comunidad

**Estructura interna:**

- **Membresía**: Conjunto de personas que forman parte de la comunidad
- **Roles y funciones**: Posiciones específicas dentro de la jerarquía organizacional
- **Relaciones de liderazgo**: Quiénes toman decisiones y representan la comunidad

**Contenido asociado:**

- **Autores vinculados**: Escritores que pertenecen o colaboran con la comunidad
- **Historias**: Obras literarias publicadas bajo la iniciativa de la comunidad
- **Colecciones**: Antologías, compilaciones, certámenes organizados por la comunidad
- **Eventos**: Lecturas públicas, conferencias, talleres literarios
- **Blog**: Entradas de análisis, crítica literaria, noticias de la comunidad
- **Certámenes**: Concursos de escritura con premios y reconocimiento

---

## Elementos de dominio identificados

### Nuevas entidades principales

#### Community (Comunidad)

Agregado raíz que representa una comunidad literaria con su estructura, contenido e identidad.

```typescript
interface Community {
	// Identidad
	_id: string; // ID técnico (Sanity)
	slug: string; // Clave de negocio, única e inmutable

	// Información organizacional
	name: string; // Nombre de la comunidad
	description: TextBlockContent[]; // Descripción detallada
	foundationYear?: number; // Año de fundación

	// Identidad visual
	logo: string; // URL del logo
	banner: string; // URL del banner principal (recomendado: 1920x400px)
	primaryColor?: string; // Color primario (hexadecimal)
	secondaryColor?: string; // Color secundario (hexadecimal)

	// Presencia digital
	resources: Resource[]; // Enlaces a sitios, redes sociales, canales
	contacts: ContactInformation[]; // Información de contacto

	// Estructura interna
	members: CommunityMember[]; // Lista de miembros destacados
	leadership: LeadershipRole[]; // Roles de liderazgo

	// Contenido asociado
	authors: Author[]; // Autores vinculados a la comunidad
	stories: Story[]; // Historias publicadas por/para la comunidad
	storylists: Storylist[]; // Colecciones de la comunidad
	events: Event[]; // Eventos organizados
	blogEntries: BlogEntry[]; // Entradas de blog
	contests: Contest[]; // Certámenes de escritura

	// Metadatos
	status: CommunityStatus; // 'active' | 'inactive' | 'archived'
	publishedAt: string; // Fecha de publicación (ISO 8601)
	templateSettings: TemplateConfiguration; // Configuración visual de plantillas

	// SEO
	seoTitle?: string; // Título para buscadores
	seoDescription?: string; // Descripción para buscadores
	seoKeywords?: string[]; // Palabras clave
}

type CommunityStatus = 'active' | 'inactive' | 'archived';
```

#### Member (Miembro)

Representa a una persona que pertenece a una comunidad con su rol específico.

```typescript
interface CommunityMember {
	_id: string; // Identificador único dentro de la comunidad

	// Identidad
	name: string; // Nombre completo
	slug: string; // Clave de negocio, única e inmutable

	// Perfil
	image?: string; // Foto de perfil
	biography?: TextBlockContent[]; // Breve biografía
	email?: string; // Correo de contacto

	// Rol dentro de la comunidad
	role: MemberRole; // Rol específico
	roles: MemberRole[]; // Múltiples roles si aplica

	// Enlaces
	resources: Resource[]; // Redes sociales, sitios web personales

	// Temporalidad
	joinedAt?: string; // Fecha de adhesión (ISO 8601)
	leftAt?: string; // Fecha de partida (si aplica)
	isCurrent: boolean; // ¿Miembro actual?
}

interface MemberRole {
	_key: string;
	slug: string; // Identificador único
	title: string; // Título del rol ("Presidente", "Tesorero", etc.)
	description?: string; // Descripción de responsabilidades
	order: number; // Orden de presentación
}
```

#### Event (Evento)

Representa eventos organizados por una comunidad (lecturas, conferencias, talleres, etc.).

```typescript
interface Event {
	_id: string; // ID técnico (Sanity)
	slug: string; // Clave de negocio, única e inmutable

	// Información básica
	name: string; // Nombre del evento
	description: TextBlockContent[]; // Descripción detallada

	// Fechas
	startDate: string; // Fecha y hora de inicio (ISO 8601)
	endDate: string; // Fecha y hora de finalización (ISO 8601)

	// Ubicación
	location: EventLocation; // Ubicación física o virtual

	// Contenido
	image: string; // Imagen del evento
	community: Community; // Comunidad organizadora
	participants?: Author[]; // Autores/participantes

	// Detalles
	eventType: EventType; // Tipo de evento
	capacity?: number; // Capacidad de asistentes
	registrationUrl?: string; // URL para registro

	// Publicación
	status: EventStatus; // 'draft' | 'published' | 'cancelled' | 'completed'
	publishedAt?: string; // Fecha de publicación

	// Archivos relacionados
	resources: Resource[]; // Materiales complementarios
	media?: Media[]; // Audio, video, transmisión en vivo
}

interface EventLocation {
	venue?: string; // Nombre del lugar
	city: string; // Ciudad
	country: string; // País
	address?: string; // Dirección completa
	isVirtual: boolean; // ¿Es evento virtual?
	virtualUrl?: string; // URL para evento virtual
	coordinates?: GeoCoordinates; // Coordenadas GPS
}

interface GeoCoordinates {
	latitude: number;
	longitude: number;
}

type EventType = 'reading' | 'workshop' | 'conference' | 'roundtable' | 'book-signing' | 'contest' | 'other';
type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
```

#### BlogEntry (Entrada de Blog)

Artículos de opinión, crítica literaria, noticias de la comunidad, etc.

```typescript
interface BlogEntry {
	_id: string; // ID técnico (Sanity)
	slug: string; // Clave de negocio única

	// Contenido
	title: string; // Título del artículo
	excerpt: string; // Extracto para listados (máx 200 caracteres)
	content: TextBlockContent[]; // Cuerpo del artículo

	// Metadatos
	author: CommunityMember | Author; // Autor del artículo
	community: Community; // Comunidad propietaria
	publishedAt: string; // Fecha de publicación (ISO 8601)
	updatedAt?: string; // Última actualización

	// Categorización
	category: BlogCategory; // Tipo de entrada
	tags: Tag[]; // Etiquetas temáticas

	// Contenido multimedia
	featuredImage?: string; // Imagen destacada
	media?: Media[]; // Multimedia embebido (audio, video)
	resources?: Resource[]; // Enlaces relacionados

	// Estado
	status: PublicationStatus; // 'draft' | 'published' | 'archived'
	isFeatured?: boolean; // ¿Mostrar en destacados?

	// SEO
	seoTitle?: string;
	seoDescription?: string;
}

type BlogCategory = 'analysis' | 'criticism' | 'news' | 'tutorial' | 'interview' | 'other';
type PublicationStatus = 'draft' | 'published' | 'archived';
```

#### Contest (Certamen de Escritura)

Concursos y certámenes organizados por comunidades con participación abierta.

```typescript
interface Contest {
	_id: string; // ID técnico (Sanity)
	slug: string; // Clave de negocio única

	// Información básica
	name: string; // Nombre del certamen
	description: TextBlockContent[]; // Descripción y bases

	// Fechas
	openDate: string; // Fecha de apertura (ISO 8601)
	closeDate: string; // Fecha de cierre (ISO 8601)
	announcementDate?: string; // Fecha de anuncio de resultados

	// Organización
	community: Community; // Comunidad organizadora
	organizers?: CommunityMember[]; // Jurados/coordinadores

	// Categorías
	categories: ContestCategory[]; // Categorías de participación

	// Información de participación
	registrationUrl?: string; // URL para registrarse
	submissionGuidelines: TextBlockContent[]; // Normas de presentación
	prizes?: Prize[]; // Premios ofrecidos

	// Contenido relacionado
	stories?: Story[]; // Historias participantes (después de cierre)
	winners?: ContestWinner[]; // Ganadores y menciones especiales
	resultsStorylist?: Storylist; // Compilación de participantes

	// Estado
	status: ContestStatus; // Estado actual
	isActive: boolean; // ¿Está abierto para inscripción?

	// Recursos
	image: string; // Imagen del certamen
	resources?: Resource[]; // Materiales complementarios
}

interface ContestCategory {
	_key: string;
	slug: string;
	name: string; // Nombre de la categoría
	description?: string;
	maxWordCount?: number; // Límite de palabras
	minWordCount?: number; // Mínimo de palabras
	theme?: string; // Tema específico
	restrictions?: string; // Restricciones especiales
}

interface Prize {
	_key: string;
	position: number; // 1º, 2º, 3º, etc.
	title: string; // "Primer Premio", etc.
	description: string;
	reward?: string; // Descripción del premio
}

interface ContestWinner {
	_key: string;
	position: number; // Posición (1 = 1er premio)
	story: Story; // Historia ganadora
	category: string; // Categoría
	comments?: string; // Comentarios del jurado
}

type ContestStatus = 'planning' | 'open' | 'closed' | 'judging' | 'results-announced' | 'archived';
```

### Objetos de valor relacionados

#### contactInformation (Información de Contacto)

```typescript
interface ContactInformation {
	_key: string;
	type: ContactType; // 'email' | 'phone' | 'address'
	value: string;
	label?: string; // Etiqueta para el contacto
	isPublic: boolean; // ¿Mostrar públicamente?
}

type ContactType = 'email' | 'phone' | 'address' | 'other';
```

#### templateConfiguration (Configuración de Plantilla)

```typescript
interface TemplateConfiguration {
	layout: 'minimal' | 'standard' | 'extended'; // Esquema de secciones

	// Secciones a mostrar
	sections: {
		showMembers: boolean; // Mostrar miembros destacados
		showEvents: boolean; // Mostrar eventos próximos
		showBlog: boolean; // Mostrar blog
		showContests: boolean; // Mostrar certámenes
		showStories: boolean; // Mostrar historias
		showStorylist: boolean; // Mostrar colecciones
		showResources: boolean; // Mostrar recursos externos
	};

	// Personalización visual
	customCSS?: string; // CSS personalizado (limitado)
	heroImagePosition?: 'full' | 'half' | 'background'; // Posición del banner
	memberDisplayMode?: 'grid' | 'list' | 'carousel'; // Cómo mostrar miembros
	eventsDisplayMode?: 'grid' | 'list' | 'timeline'; // Cómo mostrar eventos
}
```

---

## Nuevos agregados y raíces de agregado

### Agregado: Community (Comunidad)

**Raíz de Agregado:** `Community`

**Responsabilidades:**

- Mantener la identidad y estructura organizacional de la comunidad
- Agregar múltiples tipos de contenido bajo un paraguas común
- Gestionar la presencia digital y contacto
- Proveer múltiples vistas según contexto de uso

**Invariantes de Negocio:**

- El slug debe ser único y nunca cambiar
- Toda comunidad debe tener un nombre y descripción
- El status debe ser uno de: 'active', 'inactive', 'archived'
- Si está activa, debe tener al menos un recurso de contacto

**Vistas Polimórficas:**

- `Community` - Vista completa con todos los detalles y contenido
- `CommunityTeaser` - Vista resumida (nombre, logo, descripción corta, recurso)
- `CommunityNavigationTeaser` - Vista mínima para navegación
- `CommunityProfile` - Vista para página de perfil de comunidad

**Ciclo de Vida:**

```
Creación → Draft → Publicación → Active/Inactive → Archived
```

### Agregado: Event (Evento)

**Raíz de Agregado:** `Event`

**Responsabilidades:**

- Mantener información de eventos organizados por comunidades
- Gestionar participantes y ubicación
- Proporcionar múltiples vistas para búsqueda y detalle
- Vincular contenido multimedia relacionado

**Invariantes de Negocio:**

- Slug único
- `startDate` debe ser anterior a `endDate`
- Status debe ser válido

**Vistas Polimórficas:**

- `Event` - Vista completa con todos los detalles
- `EventTeaser` - Vista para listados (nombre, fecha, ubicación, imagen)
- `EventNavigationTeaser` - Vista mínima

**Ciclo de Vida:**

```
Planning → Published → Completed/Cancelled → Archived
```

### Agregado: BlogEntry (Entrada de Blog)

**Raíz de Agregado:** `BlogEntry`

**Responsabilidades:**

- Mantener contenido editorial generado por la comunidad
- Permitir creación de contenido sin acceso directo a Sanity
- Gestionar publicación y visibilidad
- Facilitar búsqueda y categorización

**Invariantes de Negocio:**

- Slug único per comunidad
- Solo usuarios autenticados como miembros pueden publicar
- Status debe ser válido
- `publishedAt` debe existir si status es 'published'
- Excerpt no debe exceder 200 caracteres

**Vistas Polimórficas:**

- `BlogEntry` - Vista completa con contenido
- `BlogEntryTeaser` - Vista para listados (título, excerpt, autor, fecha)
- `BlogEntryCard` - Vista para tarjetas (con imagen destacada)

**Ciclo de Vida:**

```
Draft → Published → Archived
```

### Agregado: Contest (Certamen)

**Raíz de Agregado:** `Contest`

**Responsabilidades:**

- Gestionar certámenes de escritura con cronograma
- Permitir participación de múltiples categorías
- Administrar premios y resultados
- Publicar historias ganadoras

**Invariantes de Negocio:**

- Slug único
- `announcementDate` < `openDate` < `closeDate` (si todas existen)
- Al menos una categoría definida
- Solo historias publicadas pueden ser ganadoras
- `isActive` debe ser true solo si status es 'open'

**Vistas Polimórficas:**

- `Contest` - Vista completa con categorías, bases y resultados
- `ContestTeaser` - Vista para listados (nombre, fechas, image)
- `ContestResults` - Vista enfocada en resultados y ganadores

**Ciclo de Vida:**

```
Planning → Open → Closed → Judging → Results Announced → Archived
```

---

## Relaciones entre agregados

### Relaciones de composición

```
Community
├── Member[] (composición - no pueden existir sin comunidad)
├── LeadershipRole[] (composición - definen estructura interna)
└── TemplateConfiguration (composición - personalización)
```

### Relaciones de referencia

```
Community
├── references Author[] (muchos autores pueden no estar en comunidad)
├── references Story[] (historias pueden ser de múltiples orígenes)
├── references Storylist[] (colecciones propias o curadas)
├── references Event[]
├── references BlogEntry[]
└── references Contest[]

Event
├── references Community (cada evento pertenece a una comunidad)
├── references Author[] (participantes opcionales)
└── contains EventLocation

BlogEntry
├── references Community (propietario)
├── references CommunityMember|Author (creador del artículo)
└── references Tag[]

Contest
├── references Community
├── contains ContestCategory[]
├── references Story[] (participantes después de cierre)
└── references Storylist (compilación de resultados)
```

### Relaciones de agregación en landing page

La página de inicio de una comunidad agrega:

- Miembros destacados
- Próximos eventos
- Últimas entradas de blog
- Certámenes activos/próximos
- Historias destacadas
- Colecciones propias

---

## Requerimientos previos (bloqueadores)

Antes de implementar la característica completa de comunidades, es necesario resolver los siguientes bloqueadores:

### 1. Gestión de usuarios y autenticación

**Descripción:** Sistema de registro, login y gestión de sesiones de usuarios.

**Requerimientos:**

- Implementar autenticación de usuarios (OAuth2, JWT o similar)
- Crear tabla de usuarios en base de datos (PostgreSQL)
- Permitir asociación usuario ↔ autor
- Permitir asociación usuario ↔ miembro de comunidad
- Implementar roles de usuario (viewer, member, moderator, admin)

**Impacto en Comunidades:**

- Los miembros de una comunidad deben poder crear blog entries
- Los moderadores pueden editar contenido de la comunidad
- Los administradores de comunidad pueden configurar plantillas

**Archivos de Referencia:**

- Sistema de usuarios será en PostgreSQL con sincronización a Sanity (opcional)
- Rutas de autenticación: `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`

### 2. Soporte para Certámenes (Issue #475)

**Descripción:** Implementación de la funcionalidad base de certámenes de escritura.

**Requerimientos:**

- Modelo de datos `Contest` completo en Sanity
- GROQ queries para obtener certámenes
- Endpoints API `/api/contest`
- Página frontend para listar y visualizar certámenes
- Capacidad de vincular historias a certámenes

**Impacto en Comunidades:**

- Las comunidades podrán crear y gestionar sus propios certámenes
- Los certámenes se mostrarán en la página de perfil de la comunidad
- Las historias ganadoras se incluirán en compilaciones (Storylist)

### 3. Parser Completo de PortableText

**Descripción:** Implementar soporte completo en el parser de PortableText para todos los estilos de formato.

**Estilos Pendientes:**

- Headings (h1-h6)
- Highlights/coloreado de texto
- Subrayados
- Tachado
- Superíndices/subíndices
- Código en línea
- Bloques de código

**Componentes Multimedia:**

- Imágenes embebidas con descripciones
- Videos embebidos (YouTube, Vimeo)
- Iframes personalizados
- Carruseles de imágenes

**Impacto en Comunidades:**

- Blog entries utilizan Portable Text
- Descripciones de comunidades pueden usar todos los estilos
- Event descriptions requerirán formato completo

**Ubicación Actual:** `src/app/components/portable-text-parser/`

### 4. Funcionalidad de Eventos Base

**Descripción:** Implementación base del agregado Event sin personalización de comunidades.

**Requerimientos Iniciales:**

- Schema `Event` en Sanity con campos básicos
- GROQ queries para obtener eventos
- Endpoints API `/api/event`
- Página frontend para listar eventos
- Vistas polimórficas (teaser, full)
- Filtrado por fecha (próximos eventos)

**Funcionalidades Avanzadas (Para después):**

- Integración con Google Calendar
- Notificaciones de eventos próximos
- Sincronización con plataformas externas

### 5. Sistema de Blog Base

**Descripción:** Implementación de la funcionalidad de blog sin gestión de usuarios.

**Requerimientos:**

- Schema `BlogEntry` en Sanity
- GROQ queries para obtener entradas
- Endpoints API `/api/blog`
- Página frontend para listar y leer blog entries
- Editor de contenido que no requiera acceso a Sanity Studio

**Parser de PortableText Completo (Requisito 3):** Necesario para renderizar blog entries con formato completo.

**Impacto en Comunidades:**

- Cada comunidad puede tener su propio blog
- Solo miembros autenticados pueden crear entries (post-MVP)

### 6. Base de Datos PostgreSQL

**Descripción:** Migración de almacenamiento de usuarios a PostgreSQL en lugar de solo Sanity.

**Tablas Necesarias:**

```sql
users (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  passwordHash VARCHAR NOT NULL,
  name VARCHAR,
  createdAt TIMESTAMP DEFAULT NOW()
)

user_authors (
  id SERIAL PRIMARY KEY,
  userId INT REFERENCES users(id),
  authorId VARCHAR REFERENCES sanity_authors(_id),
  UNIQUE(userId, authorId)
)

user_community_members (
  id SERIAL PRIMARY KEY,
  userId INT REFERENCES users(id),
  communityId VARCHAR REFERENCES sanity_communities(_id),
  memberSlug VARCHAR,
  role VARCHAR,
  joinedAt TIMESTAMP DEFAULT NOW()
)

user_roles (
  id SERIAL PRIMARY KEY,
  userId INT REFERENCES users(id),
  role VARCHAR, -- 'viewer', 'member', 'moderator', 'admin'
  UNIQUE(userId, role)
)
```

**Conexión a Sanity:** Sincronización unidireccional (PostgreSQL → Sanity) para perfiles de usuarios que quieran ser públicos.

---

## Requerimientos funcionales por módulo

### Módulo: Community (Comunidad)

#### Funcionalidades core

**CF.1 - Perfil de Comunidad**

- Visualizar página de perfil de comunidad con: nombre, descripción, logo, banner, miembros, eventos próximos, blog, historias
- Ruta: `/community/:slug`
- Vistas responsivas (mobile, tablet, desktop)
- Integración con plantilla configurable

**CF.2 - Directorio de Comunidades**

- Listar todas las comunidades activas en la plataforma
- Ruta: `/communities` o `/comunidades`
- Filtrado por: país, área temática, estatus
- Búsqueda por nombre/descripción
- Paginación
- Tarjetas con información resumida

**CF.3 - Gestión Administrativa de Comunidades (Backend)**

- CRUD completo de comunidades en Sanity
- Campos: nombre, slug, descripción, logo, banner, contacto, miembros, template settings
- Validaciones: slug único, campos requeridos
- Control de acceso: solo administradores de La Cuentoneta

**CF.4 - Validación y SEO de Comunidades**

- Títulos y descripciones SEO customizables
- Meta tags automáticos basados en información
- Schema markup (schema.org) para comunidades
- Open Graph tags para redes sociales
- Sitemap.xml incluya todas las comunidades activas

#### Relaciones de contenido

**CF.5 - Autores de Comunidad**

- Mostrar lista de autores asociados a la comunidad
- Cada autor puede pertenecer a múltiples comunidades
- Vista de "Autores destacados" vs "Todos los autores"
- Enlaces a perfiles de autores

**CF.6 - Historias de Comunidad**

- Mostrar historias publicadas por/bajo la iniciativa de la comunidad
- Filtrado por: fecha, author, length
- Vista en grid/list con opción de cambio
- Búsqueda dentro de historias de la comunidad

**CF.7 - Colecciones de Comunidad (Storylists)**

- Mostrar colecciones/antologías propias de la comunidad
- Distinción visual entre colecciones propias y colecciones curadas
- Enlaces a storylists completas

#### Eventos

**CF.8 - Próximos Eventos**

- Widget de "Próximos Eventos" en página de comunidad
- Mostrar hasta 3-5 eventos próximos
- Detalles: fecha, ubicación, tipo
- Enlaces a página de detalle de evento
- Enlace "Ver todos los eventos"

#### Blog

**CF.9 - Blog de Comunidad**

- Sección de blog en página de comunidad
- Listar últimas entradas (5-10 más recientes)
- Vista de tarjeta con: título, autor, fecha, excerpt, imagen
- Enlace "Ver todo el blog"
- Ruta de blog: `/community/:slug/blog`

**CF.10 - Entradas de Blog Individuales**

- Ruta: `/community/:slug/blog/:entrySlug`
- Vista completa con: título, autor, fecha, contenido completo, imagen, tags
- Navegación a entrada anterior/siguiente
- Metadatos: tiempo de lectura estimado, categoría
- Enlaces compartir en redes sociales

#### Certámenes

**CF.11 - Certámenes de la Comunidad**

- Widget mostrando certámenes activos de la comunidad
- Mostrar: nombre, fechas, estado (abierto/cerrado/resultados)
- Enlaces a página de detalle del certamen
- Ruta: `/community/:slug/contests`

---

### Módulo: Community Member (Miembro de Comunidad)

#### Funcionalidades core

**MF.1 - Perfil de Miembro**

- Página de perfil de miembro dentro de contexto de comunidad
- Ruta: `/community/:slug/member/:memberSlug`
- Información: nombre, foto, rol, biografía, recursos personales
- Lista de historias del miembro (si es autor)

**MF.2 - Directorio de Miembros**

- Listar todos los miembros de una comunidad
- Ruta: `/community/:slug/members`
- Filtrado por: rol, estatus (actual/pasado)
- Vista en grid mostrando miembros destacados primero
- Búsqueda por nombre

**MF.3 - Estructura de Liderazgo**

- Visualizar organigrama/estructura jerárquica
- Mostrar roles de liderazgo y responsabilidades
- Vista alternativa: lista vs organigrama gráfico

#### Para administradores

**MF.4 - Gestión de Miembros (Backend)**

- Agregar/editar/eliminar miembros
- Definir roles y responsabilidades
- Marcar miembros como destacados
- Especificar fechas de adhesión/partida
- Sincronizar con usuarios en PostgreSQL (post-MVP)

---

### Módulo: Event (Evento)

#### Funcionalidades core

**EF.1 - Página de Evento**

- Ruta: `/event/:slug` o `/events/:slug`
- Información completa: nombre, descripción, fechas, ubicación, imagen, participantes
- Mapa interactivo si es evento físico
- Botón de registro/enlace externo
- Información de comunidad organizadora con enlace

**EF.2 - Listado de Eventos**

- Ruta: `/events` o `/community/:slug/events`
- Vista inicial: próximos eventos (ordenados por fecha)
- Filtros: comunidad, tipo de evento, ubicación, rango de fechas
- Búsqueda por nombre
- Vistas alternativas: grid, list, calendar

**EF.3 - Calendario de Eventos**

- Vista tipo calendario interactivo
- Mostrar todos los eventos del mes
- Filtros por comunidad
- Enlace a detalle desde evento en calendario

**EF.4 - Integración de Google Calendar**

- Exportar eventos a formato iCal
- Compartir URL de calendario en aplicaciones externas
- Botón "Agregar a Calendario"

#### Para administradores

**EF.5 - Gestión de Eventos (Backend)**

- CRUD completo de eventos
- Campos: nombre, descripción, fechas, ubicación, tipo, capacidad, estado
- Subir imagen del evento
- Vincular autores/participantes
- Vincular recursos complementarios
- Control de acceso: solo administradores de comunidad

#### Notificaciones (post-MVP)

**EF.6 - Notificaciones de Eventos**

- Email con resumen de eventos próximos (semanal)
- Opción de suscribirse a eventos de comunidades específicas
- Push notifications para usuarios registrados

---

### Módulo: BlogEntry (Entrada de Blog)

#### Funcionalidades core

**BF.1 - Lectura de Blog Entries**

- Ruta: `/community/:slug/blog/:entrySlug`
- Vista completa con contenido, autor, fecha, tags
- Navegación entre artículos (anterior/siguiente)
- Tabla de contenidos generada automáticamente
- Información del autor con enlace a perfil

**BF.2 - Listado de Blog Entries**

- Ruta: `/community/:slug/blog`
- Vista inicial: últimas entradas
- Filtrado por: categoría, tag, autor, rango de fechas
- Búsqueda por título/contenido
- Paginación
- Vistas alternativas: list, grid, timeline

**BF.3 - Búsqueda Global de Blog Entries**

- Búsqueda de entradas de blog de todas las comunidades
- Ruta: `/blog` o `/blogs`
- Filtrado por comunidad, autor, categoría
- Integración con buscador global de plataforma

**BF.4 - Suscripción a Blog de Comunidad** (Post-MVP)

- Botón "Suscribirse al blog"
- Email digest semanal/mensual con nuevos artículos
- RSS feed de blog entries

#### Para miembros autenticados

**BF.5 - Crear Blog Entry**

- Ruta: `/community/:slug/blog/new` (requiere autenticación)
- Editor de texto enriquecido (WYSIWYG)
- Soporte para PortableText completo
- Guardar como borrador o publicar
- Vista previa en tiempo real

**BF.6 - Editar Blog Entry**

- Ruta: `/community/:slug/blog/:entrySlug/edit`
- Restringido a: autor original, moderadores de comunidad, administradores
- Historial de versiones (post-MVP)
- Cambio de estatus (draft → published → archived)

**BF.7 - Eliminar Blog Entry**

- Solo autor, moderador de comunidad, o admin
- Confirmación antes de eliminar
- Eliminación lógica (marcar como archived) o física (según políticas)

#### Para administradores

**BF.8 - Moderación de Blog Entries**

- Aprobar/rechazar entradas antes de publicar
- Editar entradas de otros miembros
- Marcar como "bloqueado" si viola políticas
- Comentarios de moderación (feedback)

---

### Módulo: Contest (Certamen)

#### Funcionalidades core

**CTF.1 - Página de Certamen**

- Ruta: `/contest/:slug` o `/community/:slug/contest/:slug`
- Información: nombre, descripción, fechas, categorías, bases
- Estado actual (abierto/cerrado/resultados)
- Información de premios
- Botón de registro/envío de trabajo
- Historial de ediciones pasadas (si aplica)

**CTF.2 - Listado de Certámenes**

- Ruta: `/contests` o `/community/:slug/contests`
- Filtrado: estado (abiertos, próximos, cerrados), comunidad
- Vista inicial: certámenes activos primero
- Información: nombre, comunidad, estado, fechas límite
- Búsqueda por nombre

**CTF.3 - Resultados de Certamen**

- Visualizar ganadores por categoría
- Incluir comentarios del jurado (si existen)
- Enlace a historias ganadoras
- Compilación en Storylist (colección de participantes)

#### Para administradores

**CTF.4 - Gestión de Certámenes**

- CRUD completo en Sanity
- Campos: nombre, descripción, fechas, categorías, bases
- Definir premios
- Cambiar estado del certamen
- Vincular historias participantes (después de cierre)
- Designar ganadores
- Control de acceso: solo administradores de comunidad

#### Integración con historias

**CTF.5 - Marcar Historias como Participantes**

- Historias pueden vincularse a un certamen
- Metadata: "Mención especial - Certamen X", "Ganador Categoría Y"
- Mostrar badge en tarjeta de historia
- Enlace hacia certamen desde historia

---

## Estructura de datos (esquemas Sanity)

### Schema: community

**Archivo:** `cms/schemas/community.ts`

```typescript
export default {
	name: 'community',
	title: 'Comunidad',
	type: 'document',
	fields: [
		// Identidad
		{ name: '_id', type: 'string', readOnly: true },
		{
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: {
				source: 'name',
				isUnique: (slug, context) => true, // Validación personalizada
			},
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'name',
			title: 'Nombre de la Comunidad',
			type: 'string',
			validation: (Rule) => Rule.required().max(100),
		},
		{
			name: 'description',
			title: 'Descripción',
			type: 'blockContent',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'foundationYear',
			title: 'Año de Fundación',
			type: 'number',
		},

		// Identidad Visual
		{
			name: 'logo',
			title: 'Logo',
			type: 'image',
			options: {
				hotspot: true,
			},
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'banner',
			title: 'Banner Principal',
			type: 'image',
			options: {
				hotspot: true,
			},
			description: 'Recomendado: 1920x400px',
		},
		{
			name: 'primaryColor',
			title: 'Color Primario',
			type: 'string',
			description: 'Código hexadecimal (ej: #FF5733)',
		},
		{
			name: 'secondaryColor',
			title: 'Color Secundario',
			type: 'string',
			description: 'Código hexadecimal (ej: #FF5733)',
		},

		// Presencia Digital
		{
			name: 'resources',
			title: 'Enlaces Externos (Sitio Web, Redes Sociales)',
			type: 'array',
			of: [{ type: 'resourceType' }],
		},
		{
			name: 'contacts',
			title: 'Información de Contacto',
			type: 'array',
			of: [{ type: 'contactInformation' }],
		},

		// Estructura Interna
		{
			name: 'members',
			title: 'Miembros Destacados',
			type: 'array',
			of: [{ type: 'communityMember' }],
			description: 'Miembros principales a mostrar en el perfil',
		},
		{
			name: 'leadership',
			title: 'Roles de Liderazgo',
			type: 'array',
			of: [{ type: 'memberRole' }],
			description: 'Definir estructura de roles en la comunidad',
		},

		// Contenido Asociado
		{
			name: 'authors',
			title: 'Autores Vinculados',
			type: 'array',
			of: [
				{
					type: 'reference',
					to: [{ type: 'author' }],
				},
			],
			description: 'Autores que pertenecen o colaboran con la comunidad',
		},
		{
			name: 'stories',
			title: 'Historias de la Comunidad',
			type: 'array',
			of: [
				{
					type: 'reference',
					to: [{ type: 'story' }],
				},
			],
			description: 'Historias publicadas bajo la iniciativa de la comunidad',
		},
		{
			name: 'storylists',
			title: 'Colecciones (Storylists)',
			type: 'array',
			of: [
				{
					type: 'reference',
					to: [{ type: 'storylist' }],
				},
			],
			description: 'Colecciones/antologías propias de la comunidad',
		},

		// Metadatos
		{
			name: 'status',
			title: 'Estado',
			type: 'string',
			options: {
				list: ['active', 'inactive', 'archived'],
			},
			validation: (Rule) => Rule.required(),
			initialValue: 'active',
		},
		{
			name: 'publishedAt',
			title: 'Fecha de Publicación',
			type: 'datetime',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'templateSettings',
			title: 'Configuración de Plantilla',
			type: 'templateConfiguration',
		},

		// SEO
		{
			name: 'seoTitle',
			title: 'Título SEO',
			type: 'string',
			description: 'Para buscadores (máx 60 caracteres)',
		},
		{
			name: 'seoDescription',
			title: 'Descripción SEO',
			type: 'string',
			description: 'Para buscadores (máx 160 caracteres)',
		},
		{
			name: 'seoKeywords',
			title: 'Palabras Clave SEO',
			type: 'array',
			of: [{ type: 'string' }],
		},
	],
	preview: {
		select: {
			title: 'name',
			media: 'logo',
			subtitle: 'status',
		},
	},
};
```

### Schema: communityMember (Object Type)

**Archivo:** `cms/schemas/communityMember.ts`

```typescript
export default {
	name: 'communityMember',
	title: 'Miembro de Comunidad',
	type: 'object',
	fields: [
		{
			name: 'name',
			title: 'Nombre Completo',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'slug',
			title: 'Slug (ID único dentro de comunidad)',
			type: 'slug',
			options: {
				source: 'name',
			},
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'image',
			title: 'Foto de Perfil',
			type: 'image',
			options: {
				hotspot: true,
			},
		},
		{
			name: 'biography',
			title: 'Biografía',
			type: 'blockContent',
		},
		{
			name: 'email',
			title: 'Correo Electrónico',
			type: 'string',
		},
		{
			name: 'role',
			title: 'Rol Principal',
			type: 'reference',
			to: [{ type: 'memberRole' }],
		},
		{
			name: 'roles',
			title: 'Roles Adicionales',
			type: 'array',
			of: [
				{
					type: 'reference',
					to: [{ type: 'memberRole' }],
				},
			],
		},
		{
			name: 'resources',
			title: 'Enlaces (Redes Sociales, Sitio Web)',
			type: 'array',
			of: [{ type: 'resourceType' }],
		},
		{
			name: 'joinedAt',
			title: 'Fecha de Adhesión',
			type: 'date',
		},
		{
			name: 'leftAt',
			title: 'Fecha de Partida',
			type: 'date',
		},
		{
			name: 'isCurrent',
			title: '¿Es miembro actual?',
			type: 'boolean',
			initialValue: true,
		},
	],
	preview: {
		select: {
			title: 'name',
			subtitle: 'role',
		},
	},
};
```

### Schema: event

**Archivo:** `cms/schemas/event.ts`

```typescript
export default {
	name: 'event',
	title: 'Evento',
	type: 'document',
	fields: [
		{
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: {
				source: 'name',
				isUnique: (slug, context) => true,
			},
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'name',
			title: 'Nombre del Evento',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'description',
			title: 'Descripción',
			type: 'blockContent',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'startDate',
			title: 'Fecha y Hora de Inicio',
			type: 'datetime',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'endDate',
			title: 'Fecha y Hora de Finalización',
			type: 'datetime',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'location',
			title: 'Ubicación',
			type: 'eventLocation',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'image',
			title: 'Imagen del Evento',
			type: 'image',
			options: {
				hotspot: true,
			},
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'community',
			title: 'Comunidad Organizadora',
			type: 'reference',
			to: [{ type: 'community' }],
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'participants',
			title: 'Participantes/Autores',
			type: 'array',
			of: [
				{
					type: 'reference',
					to: [{ type: 'author' }],
				},
			],
		},
		{
			name: 'eventType',
			title: 'Tipo de Evento',
			type: 'string',
			options: {
				list: ['reading', 'workshop', 'conference', 'roundtable', 'book-signing', 'contest', 'other'],
			},
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'capacity',
			title: 'Capacidad de Asistentes',
			type: 'number',
		},
		{
			name: 'registrationUrl',
			title: 'URL de Registro',
			type: 'url',
		},
		{
			name: 'status',
			title: 'Estado',
			type: 'string',
			options: {
				list: ['draft', 'published', 'cancelled', 'completed'],
			},
			initialValue: 'draft',
		},
		{
			name: 'publishedAt',
			title: 'Fecha de Publicación',
			type: 'datetime',
		},
		{
			name: 'resources',
			title: 'Materiales Complementarios',
			type: 'array',
			of: [{ type: 'resourceType' }],
		},
		{
			name: 'media',
			title: 'Multimedia (Audio, Video, Transmisión)',
			type: 'array',
			of: [{ type: 'media' }],
		},
	],
	preview: {
		select: {
			title: 'name',
			subtitle: 'startDate',
		},
	},
};
```

### Schema: blogEntry

**Archivo:** `cms/schemas/blogEntry.ts`

```typescript
export default {
	name: 'blogEntry',
	title: 'Entrada de Blog',
	type: 'document',
	fields: [
		{
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: {
				source: 'title',
				isUnique: (slug, context) => true,
			},
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'title',
			title: 'Título',
			type: 'string',
			validation: (Rule) => Rule.required().max(200),
		},
		{
			name: 'excerpt',
			title: 'Extracto',
			type: 'string',
			description: 'Resumen corto para listados (máx 200 caracteres)',
			validation: (Rule) => Rule.required().max(200),
		},
		{
			name: 'content',
			title: 'Contenido',
			type: 'blockContent',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'author',
			title: 'Autor',
			type: 'reference',
			to: [{ type: 'author' }, { type: 'communityMember' }],
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'community',
			title: 'Comunidad',
			type: 'reference',
			to: [{ type: 'community' }],
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'publishedAt',
			title: 'Fecha de Publicación',
			type: 'datetime',
		},
		{
			name: 'updatedAt',
			title: 'Última Actualización',
			type: 'datetime',
		},
		{
			name: 'category',
			title: 'Categoría',
			type: 'string',
			options: {
				list: ['analysis', 'criticism', 'news', 'tutorial', 'interview', 'other'],
			},
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'tags',
			title: 'Etiquetas',
			type: 'array',
			of: [
				{
					type: 'reference',
					to: [{ type: 'tag' }],
				},
			],
		},
		{
			name: 'featuredImage',
			title: 'Imagen Destacada',
			type: 'image',
			options: {
				hotspot: true,
			},
		},
		{
			name: 'media',
			title: 'Multimedia Embebido',
			type: 'array',
			of: [{ type: 'media' }],
		},
		{
			name: 'resources',
			title: 'Enlaces Relacionados',
			type: 'array',
			of: [{ type: 'resourceType' }],
		},
		{
			name: 'status',
			title: 'Estado',
			type: 'string',
			options: {
				list: ['draft', 'published', 'archived'],
			},
			initialValue: 'draft',
		},
		{
			name: 'isFeatured',
			title: '¿Mostrar en destacados?',
			type: 'boolean',
			initialValue: false,
		},
		{
			name: 'seoTitle',
			title: 'Título SEO',
			type: 'string',
		},
		{
			name: 'seoDescription',
			title: 'Descripción SEO',
			type: 'string',
		},
	],
	preview: {
		select: {
			title: 'title',
			subtitle: 'author',
		},
	},
};
```

### Schema: contest

**Archivo:** `cms/schemas/contest.ts`

```typescript
export default {
	name: 'contest',
	title: 'Certamen de Escritura',
	type: 'document',
	fields: [
		{
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: {
				source: 'name',
				isUnique: (slug, context) => true,
			},
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'name',
			title: 'Nombre del Certamen',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'description',
			title: 'Descripción y Bases',
			type: 'blockContent',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'openDate',
			title: 'Fecha de Apertura',
			type: 'datetime',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'closeDate',
			title: 'Fecha de Cierre',
			type: 'datetime',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'announcementDate',
			title: 'Fecha de Anuncio de Resultados',
			type: 'datetime',
		},
		{
			name: 'community',
			title: 'Comunidad Organizadora',
			type: 'reference',
			to: [{ type: 'community' }],
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'organizers',
			title: 'Jurados/Coordinadores',
			type: 'array',
			of: [
				{
					type: 'reference',
					to: [{ type: 'author' }],
				},
			],
		},
		{
			name: 'categories',
			title: 'Categorías',
			type: 'array',
			of: [{ type: 'contestCategory' }],
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'registrationUrl',
			title: 'URL de Registro',
			type: 'url',
		},
		{
			name: 'submissionGuidelines',
			title: 'Normas de Presentación',
			type: 'blockContent',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'prizes',
			title: 'Premios',
			type: 'array',
			of: [{ type: 'prize' }],
		},
		{
			name: 'stories',
			title: 'Historias Participantes',
			type: 'array',
			of: [
				{
					type: 'reference',
					to: [{ type: 'story' }],
				},
			],
			description: 'Agregada después del cierre del certamen',
		},
		{
			name: 'winners',
			title: 'Ganadores y Mención Especial',
			type: 'array',
			of: [{ type: 'contestWinner' }],
		},
		{
			name: 'resultsStorylist',
			title: 'Compilación de Resultados',
			type: 'reference',
			to: [{ type: 'storylist' }],
			description: 'Colección de todas las historias participantes/ganadoras',
		},
		{
			name: 'status',
			title: 'Estado',
			type: 'string',
			options: {
				list: ['planning', 'open', 'closed', 'judging', 'results-announced', 'archived'],
			},
			initialValue: 'planning',
		},
		{
			name: 'isActive',
			title: '¿Abierto para inscripción?',
			type: 'boolean',
		},
		{
			name: 'image',
			title: 'Imagen del Certamen',
			type: 'image',
			options: {
				hotspot: true,
			},
		},
		{
			name: 'resources',
			title: 'Materiales Complementarios',
			type: 'array',
			of: [{ type: 'resourceType' }],
		},
	],
	preview: {
		select: {
			title: 'name',
			subtitle: 'status',
		},
	},
};
```

### Schema: object types (nuevos tipos de objetos)

#### eventLocation

**Archivo:** `cms/schemas/eventLocation.ts`

```typescript
export default {
	name: 'eventLocation',
	title: 'Ubicación de Evento',
	type: 'object',
	fields: [
		{
			name: 'venue',
			title: 'Nombre del Lugar',
			type: 'string',
		},
		{
			name: 'city',
			title: 'Ciudad',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'country',
			title: 'País',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'address',
			title: 'Dirección Completa',
			type: 'string',
		},
		{
			name: 'isVirtual',
			title: '¿Es evento virtual?',
			type: 'boolean',
			initialValue: false,
		},
		{
			name: 'virtualUrl',
			title: 'URL para evento virtual',
			type: 'url',
			hidden: { create: 'isVirtual === false', edit: 'isVirtual === false' },
		},
		{
			name: 'latitude',
			title: 'Latitud',
			type: 'number',
		},
		{
			name: 'longitude',
			title: 'Longitud',
			type: 'number',
		},
	],
};
```

#### contestCategory

**Archivo:** `cms/schemas/contestCategory.ts`

```typescript
export default {
	name: 'contestCategory',
	title: 'Categoría de Certamen',
	type: 'object',
	fields: [
		{
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: {
				source: 'name',
			},
		},
		{
			name: 'name',
			title: 'Nombre de la Categoría',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'description',
			title: 'Descripción',
			type: 'string',
		},
		{
			name: 'maxWordCount',
			title: 'Máximo de Palabras',
			type: 'number',
		},
		{
			name: 'minWordCount',
			title: 'Mínimo de Palabras',
			type: 'number',
		},
		{
			name: 'theme',
			title: 'Tema Específico',
			type: 'string',
		},
		{
			name: 'restrictions',
			title: 'Restricciones Especiales',
			type: 'string',
		},
	],
};
```

#### prize

**Archivo:** `cms/schemas/prize.ts`

```typescript
export default {
	name: 'prize',
	title: 'Premio',
	type: 'object',
	fields: [
		{
			name: 'position',
			title: 'Posición',
			type: 'number',
			validation: (Rule) => Rule.required().greaterThan(0),
		},
		{
			name: 'title',
			title: 'Título del Premio',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'description',
			title: 'Descripción',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'reward',
			title: 'Premio (Descripción del Valor)',
			type: 'string',
		},
	],
};
```

#### contestWinner

**Archivo:** `cms/schemas/contestWinner.ts`

```typescript
export default {
	name: 'contestWinner',
	title: 'Ganador de Certamen',
	type: 'object',
	fields: [
		{
			name: 'position',
			title: 'Posición',
			type: 'number',
			validation: (Rule) => Rule.required().greaterThan(0),
		},
		{
			name: 'story',
			title: 'Historia Ganadora',
			type: 'reference',
			to: [{ type: 'story' }],
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'category',
			title: 'Categoría',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'comments',
			title: 'Comentarios del Jurado',
			type: 'string',
		},
	],
};
```

#### templateConfiguration

**Archivo:** `cms/schemas/templateConfiguration.ts`

```typescript
export default {
	name: 'templateConfiguration',
	title: 'Configuración de Plantilla',
	type: 'object',
	fields: [
		{
			name: 'layout',
			title: 'Esquema de Secciones',
			type: 'string',
			options: {
				list: ['minimal', 'standard', 'extended'],
			},
			initialValue: 'standard',
		},
		{
			name: 'sections',
			title: 'Secciones a Mostrar',
			type: 'object',
			fields: [
				{
					name: 'showMembers',
					title: 'Mostrar Miembros',
					type: 'boolean',
					initialValue: true,
				},
				{
					name: 'showEvents',
					title: 'Mostrar Eventos',
					type: 'boolean',
					initialValue: true,
				},
				{
					name: 'showBlog',
					title: 'Mostrar Blog',
					type: 'boolean',
					initialValue: true,
				},
				{
					name: 'showContests',
					title: 'Mostrar Certámenes',
					type: 'boolean',
					initialValue: true,
				},
				{
					name: 'showStories',
					title: 'Mostrar Historias',
					type: 'boolean',
					initialValue: true,
				},
				{
					name: 'showStorylist',
					title: 'Mostrar Colecciones',
					type: 'boolean',
					initialValue: true,
				},
				{
					name: 'showResources',
					title: 'Mostrar Recursos Externos',
					type: 'boolean',
					initialValue: true,
				},
			],
		},
		{
			name: 'heroImagePosition',
			title: 'Posición de Banner',
			type: 'string',
			options: {
				list: ['full', 'half', 'background'],
			},
			initialValue: 'full',
		},
		{
			name: 'memberDisplayMode',
			title: 'Modo de Visualización de Miembros',
			type: 'string',
			options: {
				list: ['grid', 'list', 'carousel'],
			},
			initialValue: 'grid',
		},
		{
			name: 'eventsDisplayMode',
			title: 'Modo de Visualización de Eventos',
			type: 'string',
			options: {
				list: ['grid', 'list', 'timeline'],
			},
			initialValue: 'list',
		},
	],
};
```

#### contactInformation

**Archivo:** `cms/schemas/contactInformation.ts`

```typescript
export default {
	name: 'contactInformation',
	title: 'Información de Contacto',
	type: 'object',
	fields: [
		{
			name: 'type',
			title: 'Tipo de Contacto',
			type: 'string',
			options: {
				list: ['email', 'phone', 'address', 'other'],
			},
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'value',
			title: 'Valor',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'label',
			title: 'Etiqueta',
			type: 'string',
			description: 'Ej: "Contacto General", "Soporte Técnico"',
		},
		{
			name: 'isPublic',
			title: '¿Mostrar públicamente?',
			type: 'boolean',
			initialValue: true,
		},
	],
};
```

### Integración con esquemas existentes

#### story (modificado)

Agregar campo a `cms/schemas/story.ts`:

```typescript
{
  name: 'communities',
  title: 'Comunidades Relacionadas',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [{ type: 'community' }],
    },
  ],
  description: 'Comunidades bajo cuya iniciativa se publicó esta historia',
},
```

#### author (modificado)

Agregar campo a `cms/schemas/author.ts`:

```typescript
{
  name: 'communities',
  title: 'Comunidades Asociadas',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [{ type: 'community' }],
    },
  ],
  description: 'Comunidades a las que pertenece o colabora este autor',
},
```

#### storylist (modificado)

Agregar campo a `cms/schemas/storylist.ts`:

```typescript
{
  name: 'community',
  title: 'Comunidad Propietaria',
  type: 'reference',
  to: [{ type: 'community' }],
  description: 'Si es colección propia de una comunidad',
},
```

---

## Arquitectura de API backend

### Estructura de módulos

```
src/api/modules/
├── community/
│   ├── community.controller.ts
│   ├── community.service.ts
│   └── community.repository.ts
├── event/
│   ├── event.controller.ts
│   ├── event.service.ts
│   └── event.repository.ts
├── blog-entry/
│   ├── blog-entry.controller.ts
│   ├── blog-entry.service.ts
│   └── blog-entry.repository.ts
└── contest/
    ├── contest.controller.ts
    ├── contest.service.ts
    └── contest.repository.ts
```

### Rutas API

Agregar a `src/api/routes.ts`:

```typescript
routes = [
	// Existentes
	{ path: '/author', controller: authorController },
	{ path: '/story', controller: storyController },
	{ path: '/storylist', controller: storylistController },
	{ path: '/contributor', controller: contributorController },
	{ path: '/content', controller: contentController },

	// Nuevas rutas de comunidades
	{ path: '/community', controller: communityController },
	{ path: '/event', controller: eventController },
	{ path: '/blog', controller: blogEntryController },
	{ path: '/contest', controller: contestController },
];
```

### Community controller

**Archivo:** `src/api/modules/community/community.controller.ts`

```typescript
// Rutas:
GET    /api/community                        # Listar todas las comunidades
GET    /api/community/:slug                  # Obtener comunidad por slug
GET    /api/community/:slug/full             # Obtener comunidad con contenido relacionado completo

// Parámetros de consulta para listados:
?status=active|inactive|archived             # Filtrar por estado
?sort=name|recent|popularity                 # Ordenamiento
?limit=20&offset=0                           # Paginación
?search=query                                # Búsqueda por nombre/descripción
```

**Responsabilidades:**

- Validar slugs de comunidad
- Invocar service layer
- Transformar modelos de dominio a DTOs
- Manejar errores HTTP

**Vistas de Respuesta:**

- `CommunityTeaser` - Para listados
- `CommunityProfile` - Para página individual
- `Community` - Vista completa (solo para administradores)

### Event controller

**Archivo:** `src/api/modules/event/event.controller.ts`

```typescript
// Rutas:
GET    /api/event                            # Listar eventos (próximos primero)
GET    /api/event/:slug                      # Obtener evento completo
GET    /api/event/by-community/:communitySlug # Eventos de una comunidad
GET    /api/event/upcoming?days=30           # Eventos próximos (en N días)

// Parámetros de consulta:
?community=slug                              # Filtrar por comunidad
?type=reading|workshop|...                   # Filtrar por tipo
?location=city                               # Filtrar por ubicación
?status=published|completed                  # Filtrar por estado
?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD      # Rango de fechas
?sort=date|popularity                        # Ordenamiento
?limit=20&offset=0                           # Paginación
```

**Responsabilidades:**

- Validar fechas y ubicaciones
- Aplicar filtros y ordenamientos
- Invocar service layer
- Transformar modelos

**Vistas de Respuesta:**

- `EventTeaser` - Para listados
- `Event` - Vista completa

### BlogEntry controller

**Archivo:** `src/api/modules/blog-entry/blog-entry.controller.ts`

```typescript
// Rutas:
GET    /api/blog                             # Listar todas las entradas
GET    /api/blog/:slug                       # Obtener entrada completa
GET    /api/blog/by-community/:communitySlug # Blog entries de una comunidad
GET    /api/blog/by-author/:authorSlug       # Blog entries de un autor

// Parámetros de consulta:
?community=slug                              # Filtrar por comunidad
?category=analysis|criticism|...             # Filtrar por categoría
?tag=slug                                    # Filtrar por etiqueta
?author=slug                                 # Filtrar por autor
?featured=true                               # Solo destacados
?sort=recent|popular                         # Ordenamiento
?limit=10&offset=0                           # Paginación
?search=query                                # Búsqueda en título/contenido
```

**Responsabilidades:**

- Validar slugs y filtros
- Aplicar control de visibilidad (solo publicados para usuarios no autenticados)
- Invocar service layer
- Paginar resultados

**Vistas de Respuesta:**

- `BlogEntryTeaser` - Para listados
- `BlogEntryCard` - Para tarjetas
- `BlogEntry` - Vista completa

### Contest controller

**Archivo:** `src/api/modules/contest/contest.controller.ts`

```typescript
// Rutas:
GET    /api/contest                          # Listar certámenes
GET    /api/contest/:slug                    # Obtener certamen completo
GET    /api/contest/by-community/:communitySlug # Certámenes de una comunidad
GET    /api/contest/active                   # Certámenes abiertos actualmente
GET    /api/contest/:slug/results            # Resultados de un certamen

// Parámetros de consulta:
?community=slug                              # Filtrar por comunidad
?status=open|closed|judging|results-announced  # Filtrar por estado
?sort=date|popularity                        # Ordenamiento
?limit=20&offset=0                           # Paginación
```

**Responsabilidades:**

- Validar estados de certámenes
- Filtrar certámenes según estado (fecha actual vs fechas de certamen)
- Invocar service layer
- Retornar información de ganadores

**Vistas de Respuesta:**

- `ContestTeaser` - Para listados
- `Contest` - Vista completa
- `ContestResults` - Enfoque en ganadores

### Service layer (ejemplo: CommunityService)

**Archivo:** `src/api/modules/community/community.service.ts`

```typescript
export class CommunityService {
	constructor(private communityRepository: CommunityRepository) {}

	async getAllCommunities(filters: CommunityFilters): Promise<CommunityTeaser[]> {
		const communities = await this.communityRepository.fetch(filters);
		return communities.filter((c) => c.status === 'active').map((c) => this.mapToCommunityTeaser(c));
	}

	async getCommunityBySlug(slug: string): Promise<CommunityProfile> {
		const community = await this.communityRepository.fetchBySlug(slug);
		if (!community || community.status === 'archived') {
			throw new NotFoundError(`Community not found: ${slug}`);
		}
		return this.mapToCommunityProfile(community);
	}

	async getCommunityWithRelatedContent(slug: string): Promise<CommunityFull> {
		const community = await this.communityRepository.fetchBySlug(slug);
		const [authors, stories, storylists, events, blogEntries, contests] = await Promise.all([
			this.authorRepository.fetchByCommunitySlug(slug),
			this.storyRepository.fetchByCommunitySlug(slug),
			this.storylistRepository.fetchByCommunitySlug(slug),
			this.eventRepository.fetchByCommunitySlug(slug),
			this.blogEntryRepository.fetchByCommunitySlug(slug),
			this.contestRepository.fetchByCommunitySlug(slug),
		]);

		return this.mapToCommunityFull(community, {
			authors,
			stories,
			storylists,
			events,
			blogEntries,
			contests,
		});
	}

	private mapToCommunityTeaser(raw: any): CommunityTeaser {
		// Transformar datos de Sanity a modelo de dominio
	}

	private mapToCommunityProfile(raw: any): CommunityProfile {
		// Incluir nombre, descripción, logo, contacto
	}

	private mapToCommunityFull(raw: any, related: any): CommunityFull {
		// Incluir todo el contenido relacionado
	}
}
```

### GROQ queries

**Archivo:** `src/api/_queries/community.query.ts`

```typescript
export const communityBySlugQuery = `
  *[_type == 'community' && slug.current == $slug][0] {
    _id,
    slug,
    name,
    description,
    logo,
    banner,
    primaryColor,
    secondaryColor,
    resources[] {
      ...,
      resourceType-> { ... }
    },
    contacts[],
    members[] {
      ...,
      role-> { ... }
    },
    leadership[] { ... },
    authors[]-> { slug, name },
    stories[]-> { slug, title },
    storylists[]-> { slug, title },
    status,
    publishedAt,
    templateSettings,
    seoTitle,
    seoDescription,
    seoKeywords
  }
`;

export const allCommunitiesQuery = `
  *[_type == 'community' && status == 'active'] | order(publishedAt desc) {
    _id,
    slug,
    name,
    description[0...3],
    logo,
    status,
    publishedAt
  }[$start...$end]
`;
```

---

## Arquitectura de frontend

### Estructura de rutas

Agregar a `src/app/app.routes.ts`:

```typescript
const routes: Routes = [
	// Rutas existentes
	{ path: 'story/:slug', component: StoryComponent },
	{ path: 'author/:slug', component: AuthorComponent },

	// Nuevas rutas de comunidades
	{
		path: 'community',
		children: [
			{
				path: ':slug',
				component: CommunityProfileComponent,
			},
			{
				path: ':slug/members',
				component: CommunityMembersComponent,
			},
			{
				path: ':slug/blog',
				component: CommunityBlogComponent,
			},
			{
				path: ':slug/blog/:entrySlug',
				component: BlogEntryComponent,
			},
			{
				path: ':slug/events',
				component: CommunityEventsComponent,
			},
			{
				path: ':slug/contests',
				component: CommunityContestsComponent,
			},
		],
	},
	{
		path: 'communities',
		component: CommunitiesListComponent,
	},
	{
		path: 'event/:slug',
		component: EventDetailComponent,
	},
	{
		path: 'events',
		component: EventsListComponent,
	},
	{
		path: 'blog/:slug',
		component: BlogEntryComponent,
	},
	{
		path: 'contest/:slug',
		component: ContestDetailComponent,
	},
];
```

### Componentes de página

#### CommunityProfileComponent

**Ubicación:** `src/app/pages/community/community-profile/community-profile.component.ts`

**Responsabilidades:**

- Obtener datos de comunidad vía API
- Inicializar plantilla según configuración
- Mostrar miembros destacados
- Mostrar próximos eventos (widget)
- Mostrar últimas entradas de blog
- Mostrar historias destacadas
- Mostrar colecciones propias
- Implementar plantilla configurable

**Inputs:**

- Community slug (desde URL)

**Servicios:**

- CommunityService (HTTP)
- LayoutService (estado visual)

#### CommunitiesListComponent

**Ubicación:** `src/app/pages/communities/communities-list/communities-list.component.ts`

**Responsabilidades:**

- Listar todas las comunidades activas
- Implementar filtros (búsqueda, país, área)
- Paginación
- Mostrar comunidades en grid/list
- SEO: página `/communities`

#### EventDetailComponent

**Ubicación:** `src/app/pages/event/event-detail/event-detail.component.ts`

**Responsabilidades:**

- Mostrar información completa del evento
- Mapa si es evento físico
- Botón de registro
- Información de comunidad organizadora
- Participantes/autores
- Multimedia relacionada

#### EventsListComponent

**Ubicación:** `src/app/pages/event/events-list/events-list.component.ts`

**Responsabilidades:**

- Listar eventos próximos
- Filtros: comunidad, tipo, ubicación, fecha
- Vistas: grid, list, calendar
- Búsqueda

#### CommunityBlogComponent

**Ubicación:** `src/app/pages/community/community-blog/community-blog.component.ts`

**Responsabilidades:**

- Listar entradas de blog de comunidad
- Filtros: categoría, etiqueta, autor
- Búsqueda en texto
- Paginación

#### BlogEntryComponent

**Ubicación:** `src/app/pages/blog/blog-entry/blog-entry.component.ts`

**Responsabilidades:**

- Mostrar entrada de blog completa
- Tabla de contenidos automática
- Información del autor
- Navegación (anterior/siguiente)
- Compartir en redes sociales
- Comentarios (post-MVP)

### Servicios Angular

#### CommunityService

**Ubicación:** `src/app/providers/community.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class CommunityService {
	private http = inject(HttpClient);
	private url = `${environment.apiUrl}/api/community`;

	getAllCommunities(filters?: CommunityFilters): Observable<CommunityTeaser[]> {
		let params = new HttpParams();
		if (filters?.search) params = params.set('search', filters.search);
		if (filters?.status) params = params.set('status', filters.status);
		return this.http.get<CommunityTeaser[]>(this.url, { params });
	}

	getBySlug(slug: string): Observable<CommunityProfile> {
		return this.http.get<CommunityProfile>(`${this.url}/${slug}`);
	}

	getWithRelatedContent(slug: string): Observable<CommunityFull> {
		return this.http.get<CommunityFull>(`${this.url}/${slug}/full`);
	}
}
```

#### EventService

**Ubicación:** `src/app/providers/event.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class EventService {
	private http = inject(HttpClient);
	private url = `${environment.apiUrl}/api/event`;

	getAll(filters?: EventFilters): Observable<EventTeaser[]> {}
	getBySlug(slug: string): Observable<Event> {}
	getByCommunitySlug(communitySlug: string): Observable<EventTeaser[]> {}
	getUpcoming(days: number = 30): Observable<EventTeaser[]> {}
}
```

#### BlogEntryService

**Ubicación:** `src/app/providers/blog-entry.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class BlogEntryService {
	private http = inject(HttpClient);
	private url = `${environment.apiUrl}/api/blog`;

	getAll(filters?: BlogFilters): Observable<BlogEntryTeaser[]> {}
	getBySlug(slug: string): Observable<BlogEntry> {}
	getByCommunitySlug(communitySlug: string): Observable<BlogEntryTeaser[]> {}
	getByAuthorSlug(authorSlug: string): Observable<BlogEntryTeaser[]> {}
	search(query: string, filters?: BlogFilters): Observable<BlogEntryTeaser[]> {}
}
```

#### ContestService

**Ubicación:** `src/app/providers/contest.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class ContestService {
	private http = inject(HttpClient);
	private url = `${environment.apiUrl}/api/contest`;

	getAll(filters?: ContestFilters): Observable<ContestTeaser[]> {}
	getBySlug(slug: string): Observable<Contest> {}
	getByCommunitySlug(communitySlug: string): Observable<ContestTeaser[]> {}
	getActive(): Observable<ContestTeaser[]> {}
	getResults(slug: string): Observable<ContestResults> {}
}
```

### Modelos de dominio (TypeScript types)

**Ubicación:** `src/app/models/`

Crear archivos:

- `community.model.ts` - Community, CommunityTeaser, CommunityProfile, etc.
- `event.model.ts` - Event, EventTeaser, EventLocation
- `blog-entry.model.ts` - BlogEntry, BlogEntryTeaser
- `contest.model.ts` - Contest, ContestTeaser, ContestResults

**Ejemplo:**

```typescript
// src/app/models/community.model.ts

export interface Community {
	_id: string;
	slug: string;
	name: string;
	description: TextBlockContent[];
	logo: string;
	banner: string;
	// ... otros campos
}

export interface CommunityTeaser {
	_id: string;
	slug: string;
	name: string;
	logo: string;
	description: string; // Extracto
}

export interface CommunityProfile extends Community {
	members: CommunityMember[];
	leadership: MemberRole[];
	authors: AuthorTeaser[];
	stories: StoryNavigationTeaser[];
	templateSettings: TemplateConfiguration;
}

export interface CommunityFull extends CommunityProfile {
	events: EventTeaser[];
	blogEntries: BlogEntryTeaser[];
	contests: ContestTeaser[];
}
```

### Componentes reutilizables

#### CommunityCardComponent

**Ubicación:** `src/app/components/community-card/community-card.component.ts`

Tarjeta de comunidad para uso en listados.

#### CommunityMemberCardComponent

**Ubicación:** `src/app/components/community-member-card/community-member-card.component.ts`

Tarjeta de miembro con foto, rol, enlaces.

#### EventCardComponent

**Ubicación:** `src/app/components/event-card/event-card.component.ts`

Tarjeta de evento con fecha, ubicación, imagen.

#### BlogEntryCardComponent

**Ubicación:** `src/app/components/blog-entry-card/blog-entry-card.component.ts`

Tarjeta de entrada de blog con título, autor, fecha, excerpt.

#### ContestBadgeComponent

**Ubicación:** `src/app/components/contest-badge/contest-badge.component.ts`

Badge que indica si una historia es ganadora/mención especial en certamen.

---

## Gestión de usuarios y autenticación

### Contexto actual

La Cuentoneta actualmente **no tiene sistema de usuarios**. El contenido se gestiona única y exclusivamente a través de Sanity Studio por administradores.

### Requerimientos de autenticación para comunidades

Para que las comunidades puedan gestionar su propio contenido (blog entries, eventos, etc.), se requiere un sistema de usuarios con:

1. **Autenticación**
   - Registro de nuevos usuarios
   - Login con email/contraseña (o SSO)
   - Reseteo de contraseña
   - Sessiones con JWT o cookies

2. **Autorización**
   - Roles por usuario: `viewer`, `member`, `moderator`, `admin`
   - Permisos por acción: crear blog, editar blog, moderar, etc.
   - Permisos por comunidad: miembro de específica comunidad vs global

3. **Gestión de Usuarios**
   - Tabla en PostgreSQL con datos de usuario
   - Asociación usuario ↔ autor
   - Asociación usuario ↔ miembro de comunidad
   - Perfil de usuario editable

### Arquitectura de autenticación (post-MVP)

**Stack Recomendado:**

- **Database:** PostgreSQL (tabla `users`)
- **Authentication:** JWT tokens + Refresh tokens
- **Session Management:** HttpOnly cookies
- **OAuth2 (opcional):** Integración con GitHub, Google
- **Backend:** Hono middleware para validación

**Rutas de API:**

```
POST   /api/auth/register              # Registrar nuevo usuario
POST   /api/auth/login                 # Login
POST   /api/auth/logout                # Logout
POST   /api/auth/refresh               # Refrescar token
POST   /api/auth/password-reset        # Reseteo de contraseña
GET    /api/user/profile               # Obtener perfil actual
PATCH  /api/user/profile               # Editar perfil
```

**Tablas PostgreSQL:**

```sql
users (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  passwordHash VARCHAR NOT NULL,
  name VARCHAR,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
)

user_authors (
  id SERIAL PRIMARY KEY,
  userId INT REFERENCES users(id) ON DELETE CASCADE,
  authorId VARCHAR REFERENCES sanity_authors(_id),
  UNIQUE(userId, authorId)
)

user_community_members (
  id SERIAL PRIMARY KEY,
  userId INT REFERENCES users(id) ON DELETE CASCADE,
  communityId VARCHAR,
  memberSlug VARCHAR,
  isModerator BOOLEAN DEFAULT FALSE,
  joinedAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(userId, communityId)
)

user_roles (
  id SERIAL PRIMARY KEY,
  userId INT REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR -- 'viewer', 'member', 'moderator', 'admin'
)
```

### Control de acceso para comunidades

**Crear Blog Entry:**

- ✅ Miembro autenticado de la comunidad
- ✅ Moderador de la comunidad
- ✅ Administrador global

**Editar Blog Entry:**

- ✅ Autor original
- ✅ Moderador de la comunidad
- ✅ Administrador global

**Moderar Blog Entries:**

- ✅ Moderador de la comunidad
- ✅ Administrador global

**Administrar Comunidad (en Sanity Studio):**

- ✅ Administrador global
- (Futuro: Moderadores de comunidad con acceso limitado a Sanity)

---

## Gestión de eventos

### Ciclo de vida de un evento

```
Planning → Published → Completed/Cancelled → Archived
   ↓            ↓
   └────────────┘ (puede cambiar estado antes de publicar)
```

### Estados y visibilidad

| Estado      | Visible en Frontend | Editable | Descripción                                 |
| ----------- | ------------------- | -------- | ------------------------------------------- |
| `draft`     | ❌                  | ✅       | En preparación, no listado                  |
| `published` | ✅                  | ✅       | Activo, visible en listados                 |
| `cancelled` | ❌                  | ❌       | Cancelado, no mostrar                       |
| `completed` | ✅                  | ❌       | Completado, mostrar en archivo              |
| `archived`  | ❌                  | ❌       | Archivado, históricamente pero no promovido |

### Filtros y ordenamientos

**Próximos Eventos:** Mostrar eventos con `startDate > ahora` ordenados por fecha

**Eventos Pasados:** Mostrar eventos con `startDate < ahora`, estado `completed`

**Por Comunidad:** Filtrar por campo `community`

**Por Tipo:** Filtrar por campo `eventType`

**Por Ubicación:** Filtrar por `location.city` o `location.country`

### Integración con calendario

**Formato iCal:** Exportar eventos en formato estándar para agregar a calendarios externos

**Google Calendar:** URL que agrega automáticamente eventos de La Cuentoneta

---

## Gestión de entradas de blog

### Ciclo de vida de blog entry

```
Draft → Published → Archived
  ↓        ↓
  └────────┘ (puede editar antes de publicar)
```

### Estados y visibilidad

| Estado      | Visible    | Editable             | Descripción              |
| ----------- | ---------- | -------------------- | ------------------------ |
| `draft`     | ❌ Privado | ✅ Autor + Moderador | En preparación           |
| `published` | ✅ Público | ✅ Autor + Moderador | Visible en listados      |
| `archived`  | ❌         | ❌                   | Históricamente archivado |

### Características del editor de blog

**Requisitos de la aplicación para editor de blog:**

- Editor WYSIWYG para PortableText completo (con soporte completo para títulos, imágenes, videos, etc.)
- Guardado en borrador automático cada N segundos
- Vista previa en tiempo real
- Opción de publicar inmediatamente o programar para fecha futura
- Selección de imagen destacada (con crop)
- Selección de categoría y tags
- Generación automática de tabla de contenidos

**Persistencia:**

- Inicialmente guardar en Sanity directamente (via API mutations)
- Post-MVP: Considerar base de datos local (PostgreSQL) antes de publicar

### Búsqueda de blog entries

**Índice de búsqueda:** Implementar búsqueda de texto completo

- Búsqueda en título
- Búsqueda en contenido
- Búsqueda en extracto
- Filtros adicionales: autor, categoría, etiqueta

**Sugerencias de búsqueda:** Auto-complete basado en búsquedas anteriores

### RSS feed de blog

**Ruta:** `/api/blog/feed.rss` o `/blog/feed.xml`

**Contenido:**

- Últimas 20-50 entradas publicadas
- Título, autor, fecha, excerpt
- Link a entrada completa
- Información de comunidad (por comunidad)

---

## Plantillas de contenido dinámicas

### Concepto de plantilla

Una **plantilla** define la estructura visual y disposición de secciones en la página de una comunidad. Permite que cada comunidad tenga una presencia única sin necesidad de código personalizado.

### Configuración de plantilla

Campo `templateSettings` en Community agregado:

```typescript
interface TemplateConfiguration {
	layout: 'minimal' | 'standard' | 'extended';

	sections: {
		showMembers: boolean;
		showEvents: boolean;
		showBlog: boolean;
		showContests: boolean;
		showStories: boolean;
		showStorylist: boolean;
		showResources: boolean;
	};

	heroImagePosition: 'full' | 'half' | 'background';
	memberDisplayMode: 'grid' | 'list' | 'carousel';
	eventsDisplayMode: 'grid' | 'list' | 'timeline';
}
```

### Layouts predefinidos

#### Layout: minimal

Secciones: Descripción, contacto, recursos

- Perfecto para comunidades muy pequeñas
- Foco en información de contacto

#### Layout: standard (predeterminado)

Secciones: Descripción, miembros, últimos eventos, últimas entradas blog, historias destacadas

- Configuración por defecto
- Balance entre información y contenido

#### Layout: extended

Secciones: Todas las disponibles

- Máxima información
- Para comunidades muy activas

### Personalización visual

**Colores:**

- `primaryColor` - Usado en botones, enlaces, acentos
- `secondaryColor` - Usado en fondos secundarios, bordes

**Imágenes:**

- `logo` - Mostrado en header/nav
- `banner` - Imagen hero en página principal

**Tipografía:** (Futura expansión)

- Seleccionar familia de fuentes
- Personalizar tamaños

### Validación de configuración

**Invariantes:**

- Si `layout=minimal`, debe tener al menos descripción y contacto
- Colores deben ser válidos en hexadecimal
- Si se oculta una sección, debe haber al menos una visible
- Las imágenes deben cumplir límites de tamaño

---

## Consideraciones de SEO

### Páginas clave con SEO

#### Página de perfil de comunidad

**Ruta:** `/community/:slug`

**Meta Tags:**

```html
<title>{Community Name} - La Cuentoneta</title>
<meta name="description" content="{seoDescription}" />
<meta name="keywords" content="{seoKeywords.join(',')}" />
<meta property="og:title" content="{Community Name}" />
<meta property="og:description" content="{seoDescription}" />
<meta property="og:image" content="{logo or banner}" />
<meta property="og:url" content="https://cuentoneta.ar/community/{slug}" />
```

**Schema Markup:**

```json
{
	"@context": "https://schema.org",
	"@type": "Organization",
	"name": "{name}",
	"url": "{siteUrl}/community/{slug}",
	"logo": "{logo}",
	"description": "{description}",
	"sameAs": ["{resources_urls}"]
}
```

#### Página de entrada de blog

**Ruta:** `/community/:slug/blog/:entrySlug`

**Meta Tags:**

```html
<title>{title} - La Cuentoneta</title>
<meta name="description" content="{excerpt}" />
<meta property="og:type" content="article" />
<meta property="article:author" content="{author.name}" />
<meta property="article:published_time" content="{publishedAt}" />
```

**Schema Markup:**

```json
{
	"@context": "https://schema.org",
	"@type": "BlogPosting",
	"headline": "{title}",
	"description": "{excerpt}",
	"image": "{featuredImage}",
	"author": { "@type": "Person", "name": "{author.name}" },
	"datePublished": "{publishedAt}"
}
```

#### Página de evento

**Ruta:** `/event/:slug`

**Schema Markup:**

```json
{
	"@context": "https://schema.org",
	"@type": "Event",
	"name": "{name}",
	"description": "{description}",
	"image": "{image}",
	"startDate": "{startDate}",
	"endDate": "{endDate}",
	"location": { "@type": "Place", "name": "{venue}" },
	"organizer": { "@type": "Organization", "name": "{community.name}" },
	"url": "{eventUrl}"
}
```

### Sitemap

Extender `sitemap.xml` para incluir:

- `/communities` (listado)
- `/community/:slug` (cada comunidad activa)
- `/community/:slug/blog` (blog de comunidad)
- `/community/:slug/blog/:entrySlug` (cada entrada)
- `/event/:slug` (cada evento publicado)
- `/contest/:slug` (cada certamen)

### Indexación

**Excluir de indexación:**

- Páginas draft
- Páginas archived
- Páginas con `robots: noindex` en Sanity

**Forzar indexación:**

- Usar sitemap actualizado
- Enviar cambios a Google Search Console

---

## Plan de implementación

### Fase 1: infraestructura base (bloqueadores)

#### Sprint 1.1: autenticación base

- [ ] Implementar tabla de usuarios en PostgreSQL
- [ ] Endpoints `/api/auth/register` y `/api/auth/login`
- [ ] JWT token generation y validation
- [ ] Proteger endpoints con autenticación
- [ ] Testing de autenticación

#### Sprint 1.2: parser de PortableText completo

- [ ] Soporte para headings h1-h6
- [ ] Soporte para highlights/colores
- [ ] Soporte para subrayados, tachado
- [ ] Soporte para imágenes embebidas
- [ ] Soporte para bloques de código
- [ ] Testing visual en storybook

#### Sprint 1.3: eventos base

- [ ] Schema `event` en Sanity
- [ ] GROQ queries para eventos
- [ ] Endpoints API `/api/event/*`
- [ ] Service y Repository layer
- [ ] Event listing page `/events`
- [ ] Event detail page `/event/:slug`
- [ ] Testing

#### Sprint 1.4: blog base

- [ ] Schema `blogEntry` en Sanity
- [ ] GROQ queries para blog entries
- [ ] Endpoints API `/api/blog/*`
- [ ] Service y Repository layer
- [ ] Blog listing page `/blog`
- [ ] Blog entry detail page `/blog/:slug`
- [ ] Basic WYSIWYG editor (sin editor completo aún)
- [ ] Testing

### Fase 2: módulo de comunidades (core)

#### Sprint 2.1: schema y modelos

- [ ] Schema `community` en Sanity
- [ ] Object types: `communityMember`, `memberRole`, `contactInformation`, `templateConfiguration`
- [ ] Integrar campos en schemas existentes (story, author, storylist)
- [ ] GROQ queries para comunidades
- [ ] TypeScript models en frontend

#### Sprint 2.2: backend de comunidades

- [ ] Community controller/service/repository
- [ ] Endpoints: `GET /api/community`, `GET /api/community/:slug`
- [ ] Vistas polimórficas: CommunityTeaser, CommunityProfile
- [ ] Filtros y búsqueda
- [ ] Testing

#### Sprint 2.3: frontend de comunidades

- [ ] Communities list page `/communities`
- [ ] Community profile page `/community/:slug`
- [ ] Community card component
- [ ] Community member card component
- [ ] Responsive design
- [ ] Testing

#### Sprint 2.4: eventos de comunidad

- [ ] Event widget en community profile
- [ ] Community events page `/community/:slug/events`
- [ ] Linkear eventos a comunidades
- [ ] Testing

#### Sprint 2.5: blog de comunidad

- [ ] Blog section en community profile
- [ ] Community blog page `/community/:slug/blog`
- [ ] Link blog entries a comunidades
- [ ] Testing

### Fase 3: contenido generado por usuarios (post-MVP)

#### Sprint 3.1: crear blog entries

- [ ] Autenticación del usuario
- [ ] Página de crear blog entry
- [ ] Editor WYSIWYG completo
- [ ] Guardado automático en borrador
- [ ] Publicación de blog entry
- [ ] Testing

#### Sprint 3.2: moderación de contenido

- [ ] Interfaz de moderación en Sanity Studio
- [ ] Aprobar/rechazar blog entries
- [ ] Control de acceso para miembros
- [ ] Auditoria de cambios
- [ ] Testing

#### Sprint 3.3: certámenes base

- [ ] Schema `contest` en Sanity
- [ ] GROQ queries
- [ ] Contest listing y detail pages
- [ ] Testing

### Fase 4: funcionalidades avanzadas (post-MVP)

#### Sprint 4.1: plantillas dinámicas

- [ ] Implementar template configuration system
- [ ] Permitir customización de layout
- [ ] Customización de colores
- [ ] Testing visual

#### Sprint 4.2: SEO completo

- [ ] Meta tags para todas las páginas
- [ ] Schema markup
- [ ] Sitemap dinámico
- [ ] Open Graph tags
- [ ] Testing SEO

#### Sprint 4.3: características avanzadas

- [ ] RSS feeds de blog
- [ ] Calendario de eventos
- [ ] Notificaciones de eventos
- [ ] Búsqueda avanzada
- [ ] Analytics por comunidad

---

## Matriz de dependencias

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Core Platform (Existente)                                 │
│  ├─ Story                                                  │
│  ├─ Author                                                 │
│  └─ Storylist                                              │
│                                                             │
└──────────────┬──────────────────────────────────────────────┘
               │
         ┌─────▼──────────────────────────────────────────────────────┐
         │  FASE 1: Infraestructura Base (BLOQUEADORES)              │
         │  ├─ Autenticación y Gestión de Usuarios (Requiere)        │
         │  ├─ Parser PortableText Completo                          │
         │  ├─ Eventos (Independiente, pero usado por Comunidades)   │
         │  └─ Blog Base (Depende de Parser Completo)               │
         └──────────┬──────────────────────────────────────────────┘
                    │
         ┌──────────▼───────────────────────────────────────────────┐
         │  FASE 2: Módulo de Comunidades (Core)                   │
         │  ├─ Community Aggregate                                  │
         │  ├─ Community UI Components                              │
         │  ├─ Event Widget en Community Profile                    │
         │  └─ Blog Widget en Community Profile                     │
         └──────────┬──────────────────────────────────────────────┘
                    │
         ┌──────────▼───────────────────────────────────────────────┐
         │  FASE 3: Contenido Generado por Usuarios                │
         │  ├─ Editor de Blog Entries                               │
         │  ├─ Control de Acceso (Requiere Autenticación)           │
         │  ├─ Moderación de Contenido                              │
         │  └─ Certámenes (Depende de Historias)                    │
         └──────────┬──────────────────────────────────────────────┘
                    │
         ┌──────────▼───────────────────────────────────────────────┐
         │  FASE 4: Funcionalidades Avanzadas                       │
         │  ├─ Plantillas Dinámicas                                 │
         │  ├─ SEO Avanzado                                         │
         │  └─ Características Complementarias                      │
         └─────────────────────────────────────────────────────────┘
```

---

## Glosario de términos

| Término            | Definición                                                                             |
| ------------------ | -------------------------------------------------------------------------------------- |
| **Comunidad**      | Organización de personas que comparten elementos en común y persiguen un fin literario |
| **Miembro**        | Persona que forma parte de una comunidad                                               |
| **Rol de Miembro** | Posición o función específica dentro de una comunidad                                  |
| **Evento**         | Actividad (lectura, conferencia, taller) organizada por una comunidad                  |
| **Blog Entry**     | Artículo o entrada de blog publicado por un miembro o autor de comunidad               |
| **Certamen**       | Concurso de escritura con categorías, premios y cronograma                             |
| **Slug**           | Identificador único y amigable basado en el nombre (ej: tertulia-literaria)            |
| **Plantilla**      | Configuración visual y estructura de secciones en página de comunidad                  |
| **Teaser**         | Vista resumida de una entidad para listados                                            |
| **PortableText**   | Formato de contenido enriquecido de Sanity (Portable Text)                             |

---

## Referencias y recursos

### Documentación interna

- [Modelo de Dominio (DDD)](./DOMAIN_MODEL.md)
- [Guía de Desarrollo](./DEVELOPMENT_GUIDE.md)
- [Integración Sanity](./SANITY.md)
- [Estrategias de Actualización de Contenido](./CONTENT_UPDATE_STRATEGIES.md)
- [Campañas de Contenido](./CONTENT_CAMPAIGNS.md)

### Comunidades literarias objetivo

- [Tertulia Literaria](https://www.tertulia-literaria.com/) (Archived)
- [Book & Morfi](https://www.instagram.com/booknmorfi/) (Instagram)
- [La conspiración de los fuleros](https://www.instagram.com/laconspiracióndelfulos/) (Instagram)
- [ASDE - Asociación de Escritores de Santa Fe](https://www.asdeasociaciondeescritores.com.ar/)

### Patrones y Arquitectura

- [Domain-Driven Design Reference](https://www.domainlanguage.com/ddd/reference/)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
- [Portable Text Specification](https://www.portabletext.org/)

### Tecnologías

- [Angular Documentation](https://angular.io/docs)
- [Hono Documentation](https://hono.dev/)
- [Sanity CMS](https://www.sanity.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## Aprobación y control de versiones

| Versión | Fecha      | Cambios                         |
| ------- | ---------- | ------------------------------- |
| 1.0     | 2024-11-22 | Especificación inicial completa |

**Última Actualización:** 2024-11-22

**Próxima Revisión:** Después de completar Fase 1 (Infraestructura Base)

---

_Esta especificación está en proceso de implementación y será refinada conforme se avance en su desarrollo._
