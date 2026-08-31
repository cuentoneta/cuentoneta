<div align="center" width="100%">
    <img width="33%" alt="" src="../.github/assets/cuentoneta-logo.png">
</div>

---

# Mejoras Recomendadas - Domain-Driven Design

Este documento enuncia los patrones DDD que **todavía no están adoptados** en La Cuentoneta, ejemplificados sobre los agregados vigentes (`LiteraryWork`, `Author`, `Collection`). Cada mejora incluye la situación actual, una propuesta de solución con ejemplos de código, y los beneficios esperados.

Para contexto sobre el modelo de dominio actual, consulta [Modelo de Dominio - DDD](./DOMAIN_MODEL.md).

> **Alcance de este documento.** Cubre los patrones que ningún agregado adoptó todavía. Lo que falta en un agregado puntual —las interfaces de repositorio de `Author` y `Contributor`, el brandeo de sus identificadores, o sus invariantes hechas cumplir en código— vive con el agregado: en [Modelo de Dominio](./DOMAIN_MODEL.md) y en las referencias de [arquitectura limpia](../.claude/references/clean-architecture.md) y del [ACL de Sanity](../.claude/references/sanity-acl.md).

---

## Tabla de Contenidos

1. [Implementar Eventos de Dominio](#1-implementar-eventos-de-dominio)
2. [Patrón de Especificación para Consultas](#2-patrón-de-especificación-para-consultas)
3. [Mapeo Explícito entre Contextos](#3-mapeo-explícito-entre-contextos)

---

## 1. Implementar Eventos de Dominio

### Situación Actual

Los cambios significativos en agregados (como publicar una obra) no se registran ni se comunican a otros contextos. Esto dificulta:

- Auditoría de cambios
- Sincronización entre contextos
- Notificaciones a suscriptores
- Implementación de CQRS en el futuro

```typescript
// Ejemplo actual - Sin eventos
async publishLiteraryWork(slug: string): Promise<void> {
  const work = await this.repository.findBySlug(slug);
  if (work) {
    // El cambio se persiste pero no se notifica a nadie
    work.published = true;
    await this.repository.save(work);
  }
}
```

### Mejora Propuesta

Implementar un sistema de eventos de dominio que registre cambios significativos en agregados y permita que otros contextos se suscriban a ellos.

```typescript
// 1. Interfaz base de evento de dominio
interface DomainEvent {
	eventId: string; // Identificador único del evento
	eventName: string; // Nombre del evento
	occurredAt: Date; // Cuándo ocurrió
	aggregateId: string; // ID del agregado que cambió
	aggregateType: string; // Tipo del agregado (LiteraryWork, Author, etc.)
	version: number; // Versión del evento
	metadata?: Record<string, unknown>; // Metadatos adicionales
}

// 2. Eventos específicos de dominio
export class LiteraryWorkPublishedEvent implements DomainEvent {
	eventId: string;
	eventName = 'LiteraryWorkPublished';
	occurredAt: Date;
	aggregateId: string;
	aggregateType = 'LiteraryWork';
	version = 1;

	constructor(
		public literaryWorkId: string,
		public literaryWorkSlug: string,
		public authorId: string,
		public publishedAt: Date,
		public collectionId?: string,
	) {
		this.eventId = generateUuid();
		this.occurredAt = new Date();
		this.aggregateId = literaryWorkId;
	}
}

export class LiteraryWorkCreatedEvent implements DomainEvent {
	eventId: string;
	eventName = 'LiteraryWorkCreated';
	occurredAt: Date;
	aggregateId: string;
	aggregateType = 'LiteraryWork';
	version = 1;

	constructor(
		public literaryWorkId: string,
		public literaryWorkSlug: string,
		public title: string,
		public authorId: string,
	) {
		this.eventId = generateUuid();
		this.occurredAt = new Date();
		this.aggregateId = literaryWorkId;
	}
}

export class AuthorCreatedEvent implements DomainEvent {
	eventId: string;
	eventName = 'AuthorCreated';
	occurredAt: Date;
	aggregateId: string;
	aggregateType = 'Author';
	version = 1;

	constructor(
		public authorId: string,
		public authorSlug: string,
		public name: string,
	) {
		this.eventId = generateUuid();
		this.occurredAt = new Date();
		this.aggregateId = authorId;
	}
}

// 3. Bus de eventos (Event Publisher)
interface EventPublisher {
	publish(event: DomainEvent): Promise<void>;
	subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void>): void;
}

@Service()
class InMemoryEventPublisher implements EventPublisher {
	private subscribers: Map<string, ((event: DomainEvent) => Promise<void>)[]> = new Map();

	async publish(event: DomainEvent): Promise<void> {
		console.log(`Publishing event: ${event.eventName}`, event);

		const handlers = this.subscribers.get(event.eventName) || [];
		await Promise.all(handlers.map((handler) => handler(event)));
	}

	subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void>): void {
		if (!this.subscribers.has(eventName)) {
			this.subscribers.set(eventName, []);
		}
		this.subscribers.get(eventName)!.push(handler);
	}
}

// 4. Agregado con eventos
class LiteraryWork {
	private domainEvents: DomainEvent[] = [];

	private constructor(
		readonly _id: string,
		readonly slug: string,
		readonly title: string,
		readonly author: Author,
		// ... otras propiedades
	) {}

	// Factory method
	static create(props: CreateLiteraryWorkProps): LiteraryWork {
		const literaryWork = new LiteraryWork(
			props._id,
			props.slug,
			props.title,
			props.author,
			// ...
		);

		// Registrar evento de creación
		literaryWork.addDomainEvent(
			new LiteraryWorkCreatedEvent(literaryWork._id, literaryWork.slug, literaryWork.title, literaryWork.author._id),
		);

		return literaryWork;
	}

	// Método para cambiar estado
	publish(publishedAt: Date, collectionId?: string): void {
		// Validar invariantes
		if (!this.author) {
			throw new Error('No se puede publicar una obra sin autor');
		}

		// Cambiar estado
		this.published = true;
		this.publishedAt = publishedAt;

		// Registrar evento
		this.addDomainEvent(
			new LiteraryWorkPublishedEvent(this._id, this.slug, this.author._id, publishedAt, collectionId),
		);
	}

	// Gestión de eventos
	private addDomainEvent(event: DomainEvent): void {
		this.domainEvents.push(event);
	}

	getDomainEvents(): DomainEvent[] {
		return [...this.domainEvents]; // Retornar copia
	}

	clearDomainEvents(): void {
		this.domainEvents = [];
	}
}

// 5. Servicio que publica eventos
@Service()
class LiteraryWorkApplicationService {
	constructor(
		private literaryWorkRepository: LiteraryWorkRepository,
		private eventPublisher: EventPublisher,
	) {}

	async publishLiteraryWork(slug: string): Promise<void> {
		const literaryWork = await this.literaryWorkRepository.findBySlug(slug);

		if (!literaryWork) {
			throw new Error(`Obra ${slug} no encontrada`);
		}

		// Cambiar estado del agregado (genera eventos)
		literaryWork.publish(new Date());

		// Persistir
		await this.literaryWorkRepository.save(literaryWork);

		// Publicar eventos
		const events = literaryWork.getDomainEvents();
		for (const event of events) {
			await this.eventPublisher.publish(event);
		}

		// Limpiar eventos
		literaryWork.clearDomainEvents();
	}
}

// 6. Suscriptores a eventos
@Service()
class LiteraryWorkEventHandlers {
	constructor(
		private eventPublisher: EventPublisher,
		private notificationService: NotificationService,
	) {
		// Suscribirse a eventos
		this.eventPublisher.subscribe('LiteraryWorkPublished', (event) =>
			this.onLiteraryWorkPublished(event as LiteraryWorkPublishedEvent),
		);

		this.eventPublisher.subscribe('LiteraryWorkCreated', (event) =>
			this.onLiteraryWorkCreated(event as LiteraryWorkCreatedEvent),
		);
	}

	private async onLiteraryWorkPublished(event: LiteraryWorkPublishedEvent): Promise<void> {
		// Lógica de reacción a la publicación
		console.log(`Obra publicada: ${event.literaryWorkSlug}`);

		// Notificar a usuarios interesados
		await this.notificationService.notifyLiteraryWorkPublished(event.literaryWorkSlug, event.authorId);

		// Actualizar caché
		// Registrar en auditoría
		// etc.
	}

	private async onLiteraryWorkCreated(event: LiteraryWorkCreatedEvent): Promise<void> {
		console.log(`Nueva obra creada: ${event.literaryWorkSlug}`);
		// Más lógica...
	}
}
```

### Almacenamiento de Eventos (Recomendado para Producción)

Para un sistema más robusto, los eventos deberían persistirse en una tabla de eventos:

```typescript
interface EventStore {
	append(event: DomainEvent): Promise<void>;
	getEvents(aggregateId: string): Promise<DomainEvent[]>;
	getEventsSince(timestamp: Date): Promise<DomainEvent[]>;
}

@Service()
class SanityEventStore implements EventStore {
	constructor(private sanityClient: SanityClient) {}

	async append(event: DomainEvent): Promise<void> {
		// Crear documento de evento en Sanity
		await this.sanityClient.create({
			_type: 'domainEvent',
			eventId: event.eventId,
			eventName: event.eventName,
			occurredAt: event.occurredAt,
			aggregateId: event.aggregateId,
			aggregateType: event.aggregateType,
			payload: event,
		});
	}

	async getEvents(aggregateId: string): Promise<DomainEvent[]> {
		// Recuperar eventos del agregado
		const query = `*[_type == "domainEvent" && aggregateId == "${aggregateId}"] | order(occurredAt asc)`;
		return await this.sanityClient.fetch(query);
	}

	async getEventsSince(timestamp: Date): Promise<DomainEvent[]> {
		// Recuperar eventos desde una marca de tiempo
		const query = `*[_type == "domainEvent" && occurredAt >= "${timestamp.toISOString()}"] | order(occurredAt asc)`;
		return await this.sanityClient.fetch(query);
	}
}
```

### Beneficios

- ✅ **Auditoría completa** - Registro de todos los cambios significativos
- ✅ **Integración entre contextos** - Otros contextos pueden reaccionar a eventos
- ✅ **Historial** - Se puede reconstruir el estado del sistema en cualquier punto en el tiempo
- ✅ **CQRS-ready** - Base para implementar Command Query Responsibility Segregation
- ✅ **Event Sourcing** - Posibilidad de almacenar eventos como única fuente de verdad

### Issues Relacionados

- [ ] Crear interfaces de eventos de dominio
- [ ] Implementar EventPublisher (in-memory primero)
- [ ] Agregar eventos a agregados (`LiteraryWork`, `Author`, `Collection`, `Contributor`)
- [ ] Crear event handlers para reacciones
- [ ] Implementar EventStore en Sanity (opcional)
- [ ] Agregar tests para eventos

---

## 2. Patrón de Especificación para Consultas

### Situación Actual

Las consultas de datos actualmente se realizan con métodos específicos. Para cada combinación de filtros, se requiere un método nuevo, lo que resulta en:

- Explosión combinatoria de métodos
- Código duplicado en construcción de GROQ queries
- Dificultad para filtros dinámicos

```typescript
// Ejemplo actual - Métodos específicos para cada caso
class LiteraryWorkService {
	async findBySlug(slug: string): Promise<LiteraryWork | null> {}
	async findByAuthor(authorId: string): Promise<LiteraryWork[]> {}
	async findMostRead(limit: number): Promise<LiteraryWork[]> {}
	// ¿Y si necesito: obras del autor X con tiempo de lectura mayor a 10 minutos?
}
```

### Mejora Propuesta

Crear objetos de especificación que encapsulen la lógica de filtrado:

```typescript
// 1. Definir especificación
interface LiteraryWorkSpecification {
	slug?: string;
	authorId?: string;
	minReadingTime?: number;
	maxReadingTime?: number;
	hasWarnings?: boolean;
	sortBy?: 'publishDate' | 'readingTime' | 'views';
	limit?: number;
	offset?: number;
}

// 2. Interfaz del repositorio con especificación
interface LiteraryWorkRepository {
	findBySpecification(spec: LiteraryWorkSpecification): Promise<LiteraryWork[]>;
	countBySpecification(spec: LiteraryWorkSpecification): Promise<number>;
}

// 3. Implementación del repositorio
class SanityLiteraryWorkRepository implements LiteraryWorkRepository {
	async findBySpecification(spec: LiteraryWorkSpecification): Promise<LiteraryWork[]> {
		const query = this.buildQuery(spec);
		const results = await this.sanityClient.fetch(query);
		return results.map(mapLiteraryWork);
	}

	async countBySpecification(spec: LiteraryWorkSpecification): Promise<number> {
		const query = this.buildCountQuery(spec);
		return await this.sanityClient.fetch(query);
	}

	private buildQuery(spec: LiteraryWorkSpecification): string {
		let query = '*[_type == "literaryWork"';

		// Agregar filtros dinámicamente
		if (spec.slug) {
			query += ` && slug == "${spec.slug}"`;
		}

		if (spec.authorId) {
			query += ` && author._ref == "${spec.authorId}"`;
		}

		if (spec.minReadingTime) {
			query += ` && totalReadingTime >= ${spec.minReadingTime}`;
		}

		if (spec.maxReadingTime) {
			query += ` && totalReadingTime <= ${spec.maxReadingTime}`;
		}

		if (spec.hasWarnings !== undefined) {
			query += ` && badLanguage == ${spec.hasWarnings}`;
		}

		query += ']';

		// Ordenamiento
		if (spec.sortBy) {
			switch (spec.sortBy) {
				case 'publishDate':
					query += ' | order(_createdAt desc)';
					break;
				case 'readingTime':
					query += ' | order(totalReadingTime desc)';
					break;
				case 'views':
					query += ' | order(viewCount desc)';
					break;
			}
		}

		// Paginación
		if (spec.offset) {
			query += `[${spec.offset}...]`;
		}

		if (spec.limit) {
			const end = spec.offset ? spec.offset + spec.limit : spec.limit;
			query += `[0...${end}]`;
		}

		return query;
	}

	private buildCountQuery(spec: LiteraryWorkSpecification): string {
		// Similar a buildQuery pero retorna count
		const query = this.buildQuery(spec).replace('*[', 'count(*[');
		return query;
	}
}

// 4. Uso desde el servicio de aplicación
@Service()
class LiteraryWorkApplicationService {
	constructor(private literaryWorkRepository: LiteraryWorkRepository) {}

	async searchLiteraryWorks(criteria: {
		author?: string;
		minReadingTime?: number;
		maxReadingTime?: number;
		page?: number;
		pageSize?: number;
	}): Promise<{ literaryWorks: LiteraryWork[]; total: number }> {
		const spec: LiteraryWorkSpecification = {
			authorId: criteria.author,
			minReadingTime: criteria.minReadingTime,
			maxReadingTime: criteria.maxReadingTime,
			limit: criteria.pageSize || 10,
			offset: ((criteria.page || 1) - 1) * (criteria.pageSize || 10),
			sortBy: 'publishDate',
		};

		const literaryWorks = await this.literaryWorkRepository.findBySpecification(spec);
		const total = await this.literaryWorkRepository.countBySpecification(spec);

		return { literaryWorks, total };
	}

	async getMostReadLiteraryWorks(): Promise<LiteraryWork[]> {
		const spec: LiteraryWorkSpecification = {
			sortBy: 'views',
			limit: 10,
		};

		return await this.literaryWorkRepository.findBySpecification(spec);
	}

	// Ahora es trivial agregar nuevas búsquedas sin crear nuevos métodos
	async getRecentLongLiteraryWorks(): Promise<LiteraryWork[]> {
		const spec: LiteraryWorkSpecification = {
			minReadingTime: 20,
			sortBy: 'publishDate',
			limit: 5,
		};

		return await this.literaryWorkRepository.findBySpecification(spec);
	}
}

// 5. Validador de especificación (opcional pero recomendado)
class LiteraryWorkSpecificationValidator {
	static validate(spec: LiteraryWorkSpecification): void {
		if (spec.minReadingTime && spec.maxReadingTime) {
			if (spec.minReadingTime > spec.maxReadingTime) {
				throw new Error('minReadingTime no puede ser mayor que maxReadingTime');
			}
		}

		if (spec.limit && spec.limit > 100) {
			throw new Error('limit máximo es 100 registros');
		}

		if (spec.offset && spec.offset < 0) {
			throw new Error('offset no puede ser negativo');
		}
	}
}
```

### Uso en Componentes

```typescript
@Component({
	selector: 'app-literary-work-search',
	template: `
		<form [formGroup]="filterForm">
			<input formControlName="minReadingTime" type="number" placeholder="Min lectura" />
			<input formControlName="maxReadingTime" type="number" placeholder="Max lectura" />
			<button (click)="search()">Buscar</button>
		</form>

		@for (literaryWork of literaryWorks; track literaryWork.slug) {
			<h3>{{ literaryWork.title }}</h3>
		}
	`,
})
export class LiteraryWorkSearchComponent {
	filterForm = new FormGroup({
		minReadingTime: new FormControl(null),
		maxReadingTime: new FormControl(null),
	});

	literaryWorks: LiteraryWork[] = [];

	constructor(private literaryWorkService: LiteraryWorkApplicationService) {}

	search(): void {
		const criteria = this.filterForm.value;
		this.literaryWorkService.searchLiteraryWorks(criteria).subscribe((result) => {
			this.literaryWorks = result.literaryWorks;
		});
	}
}
```

### Beneficios

- ✅ **Evita explosión de métodos** - Un solo método `findBySpecification` maneja todos los casos
- ✅ **Código DRY** - La construcción de GROQ queries está centralizada
- ✅ **Reutilizable** - Las especificaciones se pueden pasar entre servicios
- ✅ **Testeable** - Fácil de testear diferentes especificaciones
- ✅ **Mantenible** - Agregar nuevos filtros es trivial

### Issues Relacionados

- [ ] Crear interfaces de especificación (`LiteraryWorkSpecification`, `AuthorSpecification`, etc.)
- [ ] Implementar en repositorios
- [ ] Agregar validadores de especificación
- [ ] Crear tests para especificaciones complejas
- [ ] Documentar especificaciones soportadas

---

## 3. Mapeo Explícito entre Contextos

### Situación Actual

Las funciones de mapeo están dispersas en `src/api/_utils/functions.ts` sin una estructura clara. No es obvio qué transforma qué.

```typescript
// Ejemplo actual - Sin patrón claro
export function mapLiteraryWork(sanityLiteraryWork: any): LiteraryWork {}
export function mapLiteraryWorkTeaser(sanityLiteraryWork: any): LiteraryWorkTeaser {}
export function mapAuthor(sanityAuthor: any): Author {}
// ... Muchas funciones sin organización
```

### Mejora Propuesta

Crear mappers explícitos usando el patrón Namespace/Module:

```typescript
// 1. Mapper para LiteraryWork
namespace LiteraryWorkMapper {
	export function toDomain(sanityLiteraryWork: SanityLiteraryWorkSchemaObject): LiteraryWork {
		return {
			_id: sanityLiteraryWork._id,
			slug: Slug.create(sanityLiteraryWork.slug),
			title: sanityLiteraryWork.title,
			totalReadingTime: ReadingTime.create(sanityLiteraryWork.totalReadingTime),
			badLanguage: sanityLiteraryWork.badLanguage,
			originalPublication: sanityLiteraryWork.originalPublication,
			authors: sanityLiteraryWork.authors.map((author) => AuthorMapper.toDomain(author)),
			content: sanityLiteraryWork.content,
			resources: sanityLiteraryWork.resources,
			mediaSources: sanityLiteraryWork.mediaSources,
		};
	}

	export function toTeaser(literaryWork: LiteraryWork): LiteraryWorkTeaser {
		return {
			_id: literaryWork._id,
			slug: literaryWork.slug,
			title: literaryWork.title,
			totalReadingTime: literaryWork.totalReadingTime,
			badLanguage: literaryWork.badLanguage,
			originalPublication: literaryWork.originalPublication,
			authors: literaryWork.authors.map((author) => AuthorMapper.toTeaser(author)),
			resources: literaryWork.resources,
			excerpt: literaryWork.excerpt,
			mediaSources: literaryWork.mediaSources,
		};
	}

	export function toNavigationTeaser(literaryWork: LiteraryWork): LiteraryWorkNavigationTeaser {
		return {
			...this.toTeaser(literaryWork),
			authors: [], // Explícitamente vacío
		};
	}

	export function toNavigationTeaserWithAuthors(literaryWork: LiteraryWork): LiteraryWorkNavigationTeaserWithAuthors {
		return {
			...this.toNavigationTeaser(literaryWork),
			authors: literaryWork.authors.map((author) => AuthorMapper.toTeaser(author)),
		};
	}

	export function toApiResponse(literaryWork: LiteraryWork): LiteraryWorkApiResponse {
		return {
			_id: literaryWork._id,
			slug: literaryWork.slug.getValue(),
			title: literaryWork.title,
			totalReadingTime: literaryWork.totalReadingTime.getMinutes(),
			badLanguage: literaryWork.badLanguage,
			originalPublication: literaryWork.originalPublication,
			authors: literaryWork.authors.map((author) => AuthorMapper.toApiResponse(author)),
			content: literaryWork.content,
			resources: literaryWork.resources,
			mediaSources: literaryWork.mediaSources,
		};
	}
}

// 2. Mapper para Author
namespace AuthorMapper {
	export function toDomain(sanityAuthor: SanityAuthorSchemaObject): Author {
		return {
			_id: sanityAuthor._id,
			slug: Slug.create(sanityAuthor.slug),
			name: sanityAuthor.name,
			imageUrl: sanityAuthor.imageUrl,
			nationality: sanityAuthor.nationality,
			bornOn: sanityAuthor.bornOn ? DateString.create(sanityAuthor.bornOn) : undefined,
			diedOn: sanityAuthor.diedOn ? DateString.create(sanityAuthor.diedOn) : undefined,
			biography: sanityAuthor.biography,
			resources: sanityAuthor.resources,
		};
	}

	export function toTeaser(author: Author): AuthorTeaser {
		return {
			_id: author._id,
			slug: author.slug,
			name: author.name,
			imageUrl: author.imageUrl,
			nationality: author.nationality,
			bornOn: author.bornOn,
			diedOn: author.diedOn,
			biography: [], // Vacío en teaser
			resources: [], // Vacío en teaser
		};
	}

	export function toApiResponse(author: Author): AuthorApiResponse {
		return {
			_id: author._id,
			slug: author.slug.getValue(),
			name: author.name,
			imageUrl: author.imageUrl,
			nationality: author.nationality,
			bornOn: author.bornOn?.getValue(),
			diedOn: author.diedOn?.getValue(),
			biography: author.biography,
			resources: author.resources,
		};
	}
}

// 3. Mapper para Collection
namespace CollectionMapper {
	export function toDomain(sanityCollection: SanityCollectionSchemaObject): Collection {
		return {
			_id: sanityCollection._id,
			title: sanityCollection.title,
			slug: Slug.create(sanityCollection.slug),
			count: sanityCollection.count,
			description: sanityCollection.description,
			imagery: sanityCollection.imagery,
			tags: sanityCollection.tags,
			literaryWorks: sanityCollection.literaryWorks.map((work) => LiteraryWorkMapper.toTeaser(work)),
			config: sanityCollection.config,
		};
	}

	export function toTeaser(collection: Collection): CollectionTeaser {
		return {
			_id: collection._id,
			title: collection.title,
			slug: collection.slug,
			count: collection.count,
			description: collection.description,
			imagery: collection.imagery,
			tags: collection.tags,
			literaryWorks: [], // Vacío en teaser
			config: collection.config,
		};
	}

	export function toApiResponse(collection: Collection): CollectionApiResponse {
		return {
			_id: collection._id,
			title: collection.title,
			slug: collection.slug.getValue(),
			count: collection.count,
			description: collection.description,
			imagery: collection.imagery,
			tags: collection.tags,
			literaryWorks: collection.literaryWorks.map((work) => LiteraryWorkMapper.toApiResponse(work)),
			config: collection.config,
		};
	}
}

// 4. Uso desde repositorio
class SanityLiteraryWorkRepository implements LiteraryWorkRepository {
	async findBySlug(slug: string): Promise<LiteraryWork | null> {
		const result = await this.sanityClient.fetch(literaryWorkBySlugQuery(slug));
		return result ? LiteraryWorkMapper.toDomain(result) : null;
	}

	async findAll(spec: LiteraryWorkSpecification): Promise<LiteraryWork[]> {
		const query = this.buildGroqQuery(spec);
		const results = await this.sanityClient.fetch(query);
		return results.map(LiteraryWorkMapper.toDomain);
	}
}

// 6. Uso desde controlador/servicio
@Controller('/api/literary-work')
class LiteraryWorkController {
	constructor(private literaryWorkRepository: LiteraryWorkRepository) {}

	@Get(':slug')
	async getLiteraryWork(@Param('slug') slug: string): Promise<LiteraryWorkApiResponse> {
		const literaryWork = await this.literaryWorkRepository.findBySlug(slug);
		if (!literaryWork) {
			throw new NotFoundException('LiteraryWork not found');
		}
		return LiteraryWorkMapper.toApiResponse(literaryWork);
	}

	@Get(':slug/teaser')
	async getLiteraryWorkTeaser(@Param('slug') slug: string): Promise<LiteraryWorkTeaserApiResponse> {
		const literaryWork = await this.literaryWorkRepository.findBySlug(slug);
		if (!literaryWork) {
			throw new NotFoundException('LiteraryWork not found');
		}
		const teaser = LiteraryWorkMapper.toTeaser(literaryWork);
		return {
			...teaser,
			slug: teaser.slug.getValue(),
		};
	}
}
```

### Documentación de Mapeos

Crear un archivo de documentación que explique los mapeos:

```markdown
# LiteraryWork Mappings

## toDomain

Convierte un documento de Sanity a un objeto LiteraryWork de dominio.

**Input:** SanityLiteraryWorkSchemaObject
**Output:** LiteraryWork
**Validaciones:** Se validan slugs y fechas

## toTeaser

Proyecta una LiteraryWork a una vista ligera sin contenido pesado.

**Input:** LiteraryWork
**Output:** LiteraryWorkTeaser
**Cambios:** `content` se reemplaza por un `excerpt` recortado

## toNavigationTeaser

Proyecta a vista mínima para navegación.

**Input:** LiteraryWork
**Output:** LiteraryWorkNavigationTeaser

## toNavigationTeaserWithAuthors

Igual que `toNavigationTeaser` pero incluye información de los autores.

**Input:** LiteraryWork
**Output:** LiteraryWorkNavigationTeaserWithAuthors
**Cambios:** Incluye `authors` como `AuthorTeaser[]`

## toApiResponse

Serializa LiteraryWork para HTTP.

**Input:** LiteraryWork
**Output:** LiteraryWorkApiResponse (JSON serializable)
**Cambios:** Value Objects se convierten a strings

# Collection Mappings

## toDomain

Convierte un documento de Collection desde Sanity a un objeto Collection de dominio.

**Input:** SanityCollectionSchemaObject
**Output:** Collection
**Validaciones:** Se validan slugs
**Cambios:** Las obras literarias se mapean directamente (sin wrapper Publication)

## toTeaser

Proyecta una Collection a una vista ligera sin obras cargadas.

**Input:** Collection
**Output:** CollectionTeaser
**Cambios:** `literaryWorks = []`

## toApiResponse

Serializa Collection para HTTP.

**Input:** Collection
**Output:** CollectionApiResponse (JSON serializable)
**Cambios:** Value Objects se convierten a strings, obras se mapean a API response
```

### Beneficios

- ✅ **Centralizado** - Todos los mapeos en un lugar
- ✅ **Documentado** - El mapeo es explícito y autodocumentado
- ✅ **Reutilizable** - Múltiples controladores usan los mismos mappers
- ✅ **Testeable** - Fácil de testear cada transformación
- ✅ **Mantenible** - Cambios en tipos se detectan en compilación

### Issues Relacionados

- [ ] Reorganizar funciones de mapeo en namespaces
- [ ] Crear archivos separados por mapper
- [ ] Agregar documentación de mapeos
- [ ] Agregar tests unitarios para mapeos
- [ ] Crear tipos API response explícitos

---

## Patrones recomendados

### Patrón: Especificación (Specification Pattern) - Recomendado

**Descripción:** Encapsular lógica de consulta y filtrado en objetos especializados.

**Ejemplo propuesto:**

```typescript
// Especificación: Obtener obras publicadas después de 2023
interface LiteraryWorkSpecification {
	publishedAfter?: DateString;
	author?: string;
	minReadingTime?: number;
}

// Uso
const spanishWorksSpec: LiteraryWorkSpecification = {
	publishedAfter: '2023-01-01',
};

const literaryWorks = await literaryWorkService.findBySpecification(spanishWorksSpec);
```

**Beneficio:** Evita crear nuevos métodos para cada combinación de filtros.

---

### Patrón: Eventos de Dominio (Domain Events) - Recomendado

**Descripción:** Los cambios significativos en agregados se representan como eventos que otros contextos pueden suscribirse.

**Ejemplo propuesto:**

```typescript
// Eventos de dominio
interface DomainEvent {
	eventId: string;
	occurredAt: Date;
	aggregateId: string;
	aggregateType: string;
}

interface LiteraryWorkPublishedEvent extends DomainEvent {
	literaryWorkId: string;
	literaryWorkSlug: string;
	authorId: string;
	collectionId?: string;
}

interface AuthorCreatedEvent extends DomainEvent {
	authorId: string;
	authorSlug: string;
	name: string;
}

// Publicación de eventos
literaryWork.publish(); // Internally: emits LiteraryWorkPublishedEvent
```

**Beneficio:** Facilita integración entre contextos y rastrea cambios significativos.

---

## Priorización Recomendada

Para implementar estas mejoras de forma ordenada, se sugiere este orden:

1. **Mapeo Explícito entre Contextos** (Claridad)
   - Reorganiza código existente
   - No requiere cambios lógicos
   - Mejora mantenibilidad

2. **Patrón de Especificación** (Escalabilidad)
   - Opcional pero recomendado para consultas complejas
   - Fácil de agregar de forma incremental

3. **Implementar Eventos de Dominio** (Integración)
   - Más avanzado
   - Necesita infraestructura (EventPublisher)
   - Último paso hacia arquitectura event-driven

---

## Recursos y Referencias

- [Domain-Driven Design](https://www.domainlanguage.com/) - Eric Evans
- [Implementing Domain-Driven Design](https://vaughnvernon.com/) - Vaughn Vernon
- [Value Objects](https://martinfowler.com/eaaCatalog/valueObject.html) - Martin Fowler
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html) - Martin Fowler
- [Domain Events](https://martinfowler.com/eaaCatalog/domainEvent.html) - Martin Fowler
- [Specification Pattern](https://en.wikipedia.org/wiki/Specification_pattern) - Wikipedia

---

**Documento creado:** Noviembre 2024

Para propuestas de mejoras o clarificaciones, abre un [issue en GitHub](https://github.com/cuentoneta/cuentoneta/issues).
