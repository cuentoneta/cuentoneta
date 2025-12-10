<div align="center" width="100%">
    <h1>La Cuentoneta</h1>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
        <img width="33%" alt="La Cuentoneta" src="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
    </picture>
</div>

---

# Mejoras Recomendadas - Domain-Driven Design

Este documento detalla las mejoras recomendadas para evolucionar la arquitectura de La Cuentoneta siguiendo los principios de Domain-Driven Design. Cada mejora incluye la situación actual, una propuesta de solución con ejemplos de código, y los beneficios esperados.

Para contexto sobre el modelo de dominio actual, consulta [Modelo de Dominio - DDD](./DOMAIN_MODEL.md).

---

## Tabla de Contenidos

1. [Formalizar Patrón de Repositorio](#1-formalizar-patrón-de-repositorio)
2. [Implementar Eventos de Dominio](#2-implementar-eventos-de-dominio)
3. [Patrón de Especificación para Consultas](#3-patrón-de-especificación-para-consultas)
4. [Objetos de Valor para Primitivas](#4-objetos-de-valor-para-primitivas)
5. [Mapeo Explícito entre Contextos](#5-mapeo-explícito-entre-contextos)
6. [Invariantes Explícitas](#6-invariantes-explícitas)

---

## 1. Formalizar Patrón de Repositorio

### Situación Actual

Los servicios en `src/api/modules/*/` mezclan lógica de negocio con acceso a datos. No existe una abstracción clara entre la capa de aplicación y la capa de infraestructura, lo que dificulta:

- Testing unitario (requiere mockar todo el servicio)
- Cambio de estrategia de persistencia
- Reutilización de lógica de consulta
- Claridad en responsabilidades

```typescript
// Ejemplo actual - Mezcla de responsabilidades
class AuthorService {
	constructor(private sanityClient: SanityClient) {}

	async findBySlug(slug: string): Promise<Author | null> {
		// Aquí se mezcla acceso a datos con lógica de negocio
		const result = await this.sanityClient.fetch(authorQuery);
		if (!result) return null;
		return mapAuthor(result);
	}

	// Más métodos...
}
```

### Mejora Propuesta

Crear interfaces de repositorio explícitas que definan el contrato de acceso a datos. Los servicios (capa de aplicación) usarán inyección de dependencias para obtener repositorios.

```typescript
// 1. Definir interfaz de repositorio (capa de dominio)
interface StoryRepository {
	findBySlug(slug: string): Promise<Story | null>;
	findById(id: string): Promise<Story | null>;
	findAll(spec: StorySpecification): Promise<Story[]>;
	getMostRead(limit: number): Promise<Story[]>;
	save(story: Story): Promise<void>;
}

// 2. Implementación de repositorio (capa de infraestructura)
@Injectable({ providedIn: 'root' })
class SanityStoryRepository implements StoryRepository {
	constructor(private sanityClient: SanityClient) {}

	async findBySlug(slug: string): Promise<Story | null> {
		const result = await this.sanityClient.fetch(storyBySlugQuery(slug));
		return result ? mapStoryContent(result) : null;
	}

	async findById(id: string): Promise<Story | null> {
		const result = await this.sanityClient.fetch(storyByIdQuery(id));
		return result ? mapStoryContent(result) : null;
	}

	async findAll(spec: StorySpecification): Promise<Story[]> {
		const query = this.buildGroqQuery(spec);
		const results = await this.sanityClient.fetch(query);
		return results.map(mapStoryContent);
	}

	async getMostRead(limit: number): Promise<Story[]> {
		const query = mostReadStoriesQuery(limit);
		const results = await this.sanityClient.fetch(query);
		return results.map(mapStoryContent);
	}

	async save(story: Story): Promise<void> {
		// Implementación de persistencia
		// En Sanity, esto sería una mutación
	}

	private buildGroqQuery(spec: StorySpecification): string {
		let query = '*[_type == "story"';

		if (spec.minReadingTime) {
			query += ` && approximateReadingTime >= ${spec.minReadingTime}`;
		}
		// ... más condiciones

		query += ']';
		return query;
	}
}

// 3. Servicio de aplicación usando inyección (capa de aplicación)
@Injectable({ providedIn: 'root' })
class StoryApplicationService {
	constructor(private storyRepository: StoryRepository) {}

	async getStory(slug: string): Promise<Story | null> {
		return await this.storyRepository.findBySlug(slug);
	}

	async getMostReadStories(limit: number = 10): Promise<Story[]> {
		return await this.storyRepository.getMostRead(limit);
	}

	async getStoriesBySpecification(spec: StorySpecification): Promise<Story[]> {
		return await this.storyRepository.findAll(spec);
	}
}

// 4. Uso en componentes/servicios frontend
@Injectable({ providedIn: 'root' })
class StoryService {
	constructor(private http: HttpClient) {}

	getStory(slug: string): Observable<Story> {
		return this.http.get<Story>(`/api/story/${slug}`);
	}
}
```

### Configuración en Angular (Inyección de Dependencias)

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
	providers: [
		// ... otros providers
		{
			provide: StoryRepository,
			useClass: SanityStoryRepository,
		},
		StoryApplicationService,
	],
};
```

### Beneficios

- ✅ **Separación clara de responsabilidades** - Cada capa tiene una responsabilidad única
- ✅ **Testing mejorado** - Fácil crear mocks de repositorios para tests unitarios
- ✅ **Flexibilidad** - Cambiar de Sanity a otra persistencia solo requiere implementar la interfaz
- ✅ **Reutilización** - Múltiples servicios pueden compartir el mismo repositorio
- ✅ **Claridad** - El contrato de acceso a datos es explícito

### Archivos a Crear/Modificar

```
src/
├── api/
│   ├── modules/
│   │   ├── story/
│   │   │   ├── story.repository.ts          (nuevo)
│   │   │   ├── sanity-story.repository.ts   (nuevo)
│   │   │   ├── story.service.ts             (refactorizado)
│   │   │   └── story.query.ts               (existente)
│   │   ├── author/
│   │   │   ├── author.repository.ts         (nuevo)
│   │   │   ├── sanity-author.repository.ts  (nuevo)
│   │   │   └── author.service.ts            (refactorizado)
│   │   └── storylist/
│   │       ├── storylist.repository.ts      (nuevo)
│   │       └── ...
```

### Issues Relacionados

- [ ] Crear interfaces de repositorio para Story, Author, Storylist, Contributor
- [ ] Implementar repositorios concretos de Sanity
- [ ] Refactorizar servicios para usar repositorios
- [ ] Agregar tests unitarios para repositorios
- [ ] Actualizar documentación de arquitectura

---

## 2. Implementar Eventos de Dominio

### Situación Actual

Los cambios significativos en agregados (como publicar una historia) no se registran ni se comunican a otros contextos. Esto dificulta:

- Auditoría de cambios
- Sincronización entre contextos
- Notificaciones a suscriptores
- Implementación de CQRS en el futuro

```typescript
// Ejemplo actual - Sin eventos
async publishStory(slug: string): Promise<void> {
  const story = await this.storyRepository.findBySlug(slug);
  if (story) {
    // El cambio se persiste pero no se notifica a nadie
    story.published = true;
    await this.storyRepository.save(story);
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
	aggregateType: string; // Tipo del agregado (Story, Author, etc.)
	version: number; // Versión del evento
	metadata?: Record<string, unknown>; // Metadatos adicionales
}

// 2. Eventos específicos de dominio
export class StoryPublishedEvent implements DomainEvent {
	eventId: string;
	eventName = 'StoryPublished';
	occurredAt: Date;
	aggregateId: string;
	aggregateType = 'Story';
	version = 1;

	constructor(
		public storyId: string,
		public storySlug: string,
		public authorId: string,
		public publishedAt: Date,
		public storylistId?: string,
	) {
		this.eventId = generateUuid();
		this.occurredAt = new Date();
		this.aggregateId = storyId;
	}
}

export class StoryCreatedEvent implements DomainEvent {
	eventId: string;
	eventName = 'StoryCreated';
	occurredAt: Date;
	aggregateId: string;
	aggregateType = 'Story';
	version = 1;

	constructor(
		public storyId: string,
		public storySlug: string,
		public title: string,
		public authorId: string,
	) {
		this.eventId = generateUuid();
		this.occurredAt = new Date();
		this.aggregateId = storyId;
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

@Injectable({ providedIn: 'root' })
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
class Story {
	private domainEvents: DomainEvent[] = [];

	private constructor(
		readonly _id: string,
		readonly slug: string,
		readonly title: string,
		readonly author: Author,
		// ... otras propiedades
	) {}

	// Factory method
	static create(props: CreateStoryProps): Story {
		const story = new Story(
			props._id,
			props.slug,
			props.title,
			props.author,
			// ...
		);

		// Registrar evento de creación
		story.addDomainEvent(new StoryCreatedEvent(story._id, story.slug, story.title, story.author._id));

		return story;
	}

	// Método para cambiar estado
	publish(publishedAt: Date, storylistId?: string): void {
		// Validar invariantes
		if (!this.author) {
			throw new Error('No se puede publicar una historia sin autor');
		}

		// Cambiar estado
		this.published = true;
		this.publishedAt = publishedAt;

		// Registrar evento
		this.addDomainEvent(new StoryPublishedEvent(this._id, this.slug, this.author._id, publishedAt, storylistId));
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
@Injectable({ providedIn: 'root' })
class StoryApplicationService {
	constructor(
		private storyRepository: StoryRepository,
		private eventPublisher: EventPublisher,
	) {}

	async publishStory(slug: string): Promise<void> {
		const story = await this.storyRepository.findBySlug(slug);

		if (!story) {
			throw new Error(`Historia ${slug} no encontrada`);
		}

		// Cambiar estado del agregado (genera eventos)
		story.publish(new Date());

		// Persistir
		await this.storyRepository.save(story);

		// Publicar eventos
		const events = story.getDomainEvents();
		for (const event of events) {
			await this.eventPublisher.publish(event);
		}

		// Limpiar eventos
		story.clearDomainEvents();
	}
}

// 6. Suscriptores a eventos
@Injectable({ providedIn: 'root' })
class StoryEventHandlers {
	constructor(
		private eventPublisher: EventPublisher,
		private notificationService: NotificationService,
	) {
		// Suscribirse a eventos
		this.eventPublisher.subscribe('StoryPublished', (event) => this.onStoryPublished(event as StoryPublishedEvent));

		this.eventPublisher.subscribe('StoryCreated', (event) => this.onStoryCreated(event as StoryCreatedEvent));
	}

	private async onStoryPublished(event: StoryPublishedEvent): Promise<void> {
		// Lógica de reacción a la publicación
		console.log(`Historia publicada: ${event.storySlug}`);

		// Notificar a usuarios interesados
		await this.notificationService.notifyStoryPublished(event.storySlug, event.authorId);

		// Actualizar caché
		// Registrar en auditoría
		// etc.
	}

	private async onStoryCreated(event: StoryCreatedEvent): Promise<void> {
		console.log(`Nueva historia creada: ${event.storySlug}`);
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

@Injectable({ providedIn: 'root' })
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
- [ ] Agregar eventos a agregados (Story, Author, Storylist, Contributor)
- [ ] Crear event handlers para reacciones
- [ ] Implementar EventStore en Sanity (opcional)
- [ ] Agregar tests para eventos

---

## 3. Patrón de Especificación para Consultas

### Situación Actual

Las consultas de datos actualmente se realizan con métodos específicos. Para cada combinación de filtros, se requiere un método nuevo, lo que resulta en:

- Explosión combinatoria de métodos
- Código duplicado en construcción de GROQ queries
- Dificultad para filtros dinámicos

```typescript
// Ejemplo actual - Métodos específicos para cada caso
class StoryService {
	async findBySlug(slug: string): Promise<Story | null> {}
	async findByAuthor(authorId: string): Promise<Story[]> {}
	async findMostRead(limit: number): Promise<Story[]> {}
	// ¿Y si necesito: historias del autor X con tiempo de lectura mayor a 10 minutos?
}
```

### Mejora Propuesta

Crear objetos de especificación que encapsulen la lógica de filtrado:

```typescript
// 1. Definir especificación
interface StorySpecification {
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
interface StoryRepository {
	findBySpecification(spec: StorySpecification): Promise<Story[]>;
	countBySpecification(spec: StorySpecification): Promise<number>;
}

// 3. Implementación del repositorio
class SanityStoryRepository implements StoryRepository {
	async findBySpecification(spec: StorySpecification): Promise<Story[]> {
		const query = this.buildQuery(spec);
		const results = await this.sanityClient.fetch(query);
		return results.map(mapStoryContent);
	}

	async countBySpecification(spec: StorySpecification): Promise<number> {
		const query = this.buildCountQuery(spec);
		return await this.sanityClient.fetch(query);
	}

	private buildQuery(spec: StorySpecification): string {
		let query = '*[_type == "story"';

		// Agregar filtros dinámicamente
		if (spec.slug) {
			query += ` && slug == "${spec.slug}"`;
		}

		if (spec.authorId) {
			query += ` && author._ref == "${spec.authorId}"`;
		}

		if (spec.minReadingTime) {
			query += ` && approximateReadingTime >= ${spec.minReadingTime}`;
		}

		if (spec.maxReadingTime) {
			query += ` && approximateReadingTime <= ${spec.maxReadingTime}`;
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
					query += ' | order(approximateReadingTime desc)';
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

	private buildCountQuery(spec: StorySpecification): string {
		// Similar a buildQuery pero retorna count
		const query = this.buildQuery(spec).replace('*[', 'count(*[');
		return query;
	}
}

// 4. Uso desde el servicio de aplicación
@Injectable({ providedIn: 'root' })
class StoryApplicationService {
	constructor(private storyRepository: StoryRepository) {}

	async searchStories(criteria: {
		author?: string;
		minReadingTime?: number;
		maxReadingTime?: number;
		page?: number;
		pageSize?: number;
	}): Promise<{ stories: Story[]; total: number }> {
		const spec: StorySpecification = {
			authorId: criteria.author,
			minReadingTime: criteria.minReadingTime,
			maxReadingTime: criteria.maxReadingTime,
			limit: criteria.pageSize || 10,
			offset: ((criteria.page || 1) - 1) * (criteria.pageSize || 10),
			sortBy: 'publishDate',
		};

		const stories = await this.storyRepository.findBySpecification(spec);
		const total = await this.storyRepository.countBySpecification(spec);

		return { stories, total };
	}

	async getMostReadStories(): Promise<Story[]> {
		const spec: StorySpecification = {
			sortBy: 'views',
			limit: 10,
		};

		return await this.storyRepository.findBySpecification(spec);
	}

	// Ahora es trivial agregar nuevas búsquedas sin crear nuevos métodos
	async getRecentSpanishLongStories(): Promise<Story[]> {
		const spec: StorySpecification = {
			minReadingTime: 20,
			sortBy: 'publishDate',
			limit: 5,
		};

		return await this.storyRepository.findBySpecification(spec);
	}
}

// 5. Validador de especificación (opcional pero recomendado)
class StorySpecificationValidator {
	static validate(spec: StorySpecification): void {
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
	selector: 'app-story-search',
	template: `
		<form [formGroup]="filterForm">
			<input formControlName="minReadingTime" type="number" placeholder="Min lectura" />
			<input formControlName="maxReadingTime" type="number" placeholder="Max lectura" />
			<button (click)="search()">Buscar</button>
		</form>

		<div *ngFor="let story of stories">
			<h3>{{ story.title }}</h3>
		</div>
	`,
})
export class StorySearchComponent {
	filterForm = new FormGroup({
		minReadingTime: new FormControl(null),
		maxReadingTime: new FormControl(null),
	});

	stories: Story[] = [];

	constructor(private storyService: StoryApplicationService) {}

	search(): void {
		const criteria = this.filterForm.value;
		this.storyService.searchStories(criteria).subscribe((result) => {
			this.stories = result.stories;
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

- [ ] Crear interfaces de especificación (StorySpecification, AuthorSpecification, etc.)
- [ ] Implementar en repositorios
- [ ] Agregar validadores de especificación
- [ ] Crear tests para especificaciones complejas
- [ ] Documentar especificaciones soportadas

---

## 4. Objetos de Valor para Primitivas

### Situación Actual

Se usan tipos primitivos (strings, numbers) para conceptos del dominio como `slug` y `dateString`. Esto permite:

- Crear slugs inválidos sin detección
- Pasar cualquier string donde se espera una fecha
- Sin validación en tiempo de construcción

```typescript
// Ejemplo actual - Sin tipo fuerte
interface Story {
	slug: string; // ¿Es realmente un slug válido?
	title: string;
	bornOn?: string; // ¿Es realmente una fecha YYYY-MM-DD?
}

// Uso arriesgado
const story: Story = {
	slug: 'Historia con Espacios!', // ❌ Inválido, no se detecta
	title: 'El Aleph',
	bornOn: '24/08/1899', // ❌ Formato incorrecto, no se detecta
};
```

### Mejora Propuesta

Crear clases Value Object que encapsulen la validación:

```typescript
// 1. Value Object: Slug
class Slug {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	static create(value: string): Slug {
		// Normalizar
		const normalized = value
			.toLowerCase()
			.trim()
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9-]/g, '');

		// Validar
		if (!normalized || normalized.length === 0) {
			throw new Error('Slug no puede estar vacío');
		}

		if (!/^[a-z0-9]/.test(normalized)) {
			throw new Error('Slug debe comenzar con letra o número');
		}

		if (!/[a-z0-9]$/.test(normalized)) {
			throw new Error('Slug debe terminar con letra o número');
		}

		if (normalized.length > 100) {
			throw new Error('Slug no puede exceder 100 caracteres');
		}

		return new Slug(normalized);
	}

	static createUnsafe(value: string): Slug {
		// Para migraciones o casos excepcionales
		return new Slug(value);
	}

	getValue(): string {
		return this.value;
	}

	equals(other: Slug): boolean {
		return this.value === other.value;
	}

	toString(): string {
		return this.value;
	}
}

// 2. Value Object: DateString
class DateString {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	static create(value: string): DateString {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
			throw new Error('Formato de fecha inválido. Esperado: YYYY-MM-DD');
		}

		const date = new Date(value);
		if (isNaN(date.getTime())) {
			throw new Error(`Fecha inválida: ${value}`);
		}

		return new DateString(value);
	}

	static today(): DateString {
		const date = new Date();
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return new DateString(`${year}-${month}-${day}`);
	}

	static fromDate(date: Date): DateString {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return new DateString(`${year}-${month}-${day}`);
	}

	getValue(): string {
		return this.value;
	}

	toDate(): Date {
		return new Date(this.value);
	}

	isBefore(other: DateString): boolean {
		return this.toDate() < other.toDate();
	}

	isAfter(other: DateString): boolean {
		return this.toDate() > other.toDate();
	}

	equals(other: DateString): boolean {
		return this.value === other.value;
	}

	toString(): string {
		return this.value;
	}
}

// 3. Value Object: ReadingTime
class ReadingTime {
	private readonly minutes: number;

	private constructor(minutes: number) {
		this.minutes = minutes;
	}

	static create(minutes: number): ReadingTime {
		if (minutes < 1) {
			throw new Error('Tiempo de lectura debe ser al menos 1 minuto');
		}

		if (minutes > 1000) {
			throw new Error('Tiempo de lectura no puede exceder 1000 minutos');
		}

		if (!Number.isInteger(minutes)) {
			throw new Error('Tiempo de lectura debe ser un número entero');
		}

		return new ReadingTime(minutes);
	}

	getMinutes(): number {
		return this.minutes;
	}

	getFormattedTime(): string {
		if (this.minutes < 60) {
			return `${this.minutes}m`;
		}
		const hours = Math.floor(this.minutes / 60);
		const mins = this.minutes % 60;
		return `${hours}h ${mins}m`;
	}

	equals(other: ReadingTime): boolean {
		return this.minutes === other.minutes;
	}
}

// 4. Actualizar modelos de dominio
interface Story {
	_id: string;
	slug: Slug; // ✅ Tipo fuerte
	title: string;
	approximateReadingTime: ReadingTime; // ✅ Tipo fuerte
	// ... resto de propiedades
}

interface Author {
	_id: string;
	slug: Slug; // ✅ Tipo fuerte
	name: string;
	bornOn?: DateString; // ✅ Tipo fuerte
	diedOn?: DateString; // ✅ Tipo fuerte
	// ... resto de propiedades
}

// 5. Uso mejorado
const storySlug = Slug.create('el aleph'); // ✅ Valida y normaliza
// storySlug.getValue() == 'el-aleph'

const birthDate = DateString.create('1899-08-24'); // ✅ Valida formato
// birthDate.toDate() retorna Date válido

const readingTime = ReadingTime.create(15); // ✅ Valida rango
// readingTime.getFormattedTime() == '15m'

// Esto lanzaría error:
try {
	const invalidSlug = Slug.create('Slug Inválido!@#');
} catch (e) {
	console.error('Slug inválido:', e.message);
}

try {
	const invalidDate = DateString.create('24/08/1899');
} catch (e) {
	console.error('Fecha inválida:', e.message);
}
```

### Mapeo desde Sanity

```typescript
// Función de mapeo que convierte strings de Sanity a Value Objects
function mapStoryFromSanity(sanityStory: SanityStorySchemaObject): Story {
	return {
		_id: sanityStory._id,
		slug: Slug.createUnsafe(sanityStory.slug), // Sanity valida, usamos unsafe
		title: sanityStory.title,
		approximateReadingTime: ReadingTime.create(sanityStory.approximateReadingTime),
		// ...
	};
}

function mapAuthorFromSanity(sanityAuthor: SanityAuthorSchemaObject): Author {
	return {
		_id: sanityAuthor._id,
		slug: Slug.createUnsafe(sanityAuthor.slug),
		name: sanityAuthor.name,
		bornOn: sanityAuthor.bornOn ? DateString.create(sanityAuthor.bornOn) : undefined,
		diedOn: sanityAuthor.diedOn ? DateString.create(sanityAuthor.diedOn) : undefined,
		// ...
	};
}
```

### Serialización para API

```typescript
// Cuando envías a frontend, convierte a strings nuevamente
function storyToApiResponse(story: Story): StoryApiResponse {
	return {
		_id: story._id,
		slug: story.slug.getValue(), // Convertir a string
		title: story.title,
		approximateReadingTime: story.approximateReadingTime.getMinutes(),
		// ...
	};
}
```

### Beneficios

- ✅ **Validación en construcción** - Imposible crear valores inválidos
- ✅ **Semántica clara** - El código expresa intención
- ✅ **Métodos de utilidad** - `DateString.isBefore()`, `ReadingTime.getFormattedTime()`
- ✅ **Igualdad estructural** - Dos slugs iguales son considerados iguales
- ✅ **Refactorización segura** - Los compiladores detectan cambios

### Issues Relacionados

- [ ] Crear Value Objects (Slug, DateString, ReadingTime)
- [ ] Actualizar interfaces de dominio
- [ ] Actualizar funciones de mapeo
- [ ] Actualizar tests
- [ ] Documentar creación de Value Objects

---

## 5. Mapeo Explícito entre Contextos

### Situación Actual

Las funciones de mapeo están dispersas en `src/api/_utils/functions.ts` sin una estructura clara. No es obvio qué transforma qué.

```typescript
// Ejemplo actual - Sin patrón claro
export function mapStoryContent(sanityStory: any): Story {}
export function mapStoryTeaser(sanityStory: any): StoryTeaser {}
export function mapAuthor(sanityAuthor: any): Author {}
// ... Muchas funciones sin organización
```

### Mejora Propuesta

Crear mappers explícitos usando el patrón Namespace/Module:

```typescript
// 1. Mapper para Story
namespace StoryMapper {
	export function toDomain(sanityStory: SanityStorySchemaObject): Story {
		return {
			_id: sanityStory._id,
			slug: Slug.create(sanityStory.slug),
			title: sanityStory.title,
			approximateReadingTime: ReadingTime.create(sanityStory.approximateReadingTime),
			badLanguage: sanityStory.badLanguage,
			originalPublication: sanityStory.originalPublication,
			author: AuthorMapper.toDomain(sanityStory.author),
			paragraphs: sanityStory.paragraphs,
			summary: sanityStory.summary,
			epigraphs: sanityStory.epigraphs,
			resources: sanityStory.resources,
			media: sanityStory.media,
		};
	}

	export function toTeaser(story: Story): StoryTeaser {
		return {
			_id: story._id,
			slug: story.slug,
			title: story.title,
			approximateReadingTime: story.approximateReadingTime,
			badLanguage: story.badLanguage,
			originalPublication: story.originalPublication,
			author: undefined,
			resources: story.resources,
			paragraphs: [], // Importante: vacío en teaser
			media: story.media,
		};
	}

	export function toNavigationTeaser(story: Story): StoryNavigationTeaser {
		return {
			...this.toTeaser(story),
			paragraphs: [], // Explícitamente vacío
		};
	}

	export function toNavigationTeaserWithAuthor(story: Story): StoryNavigationTeaserWithAuthor {
		return {
			...this.toNavigationTeaser(story),
			author: AuthorMapper.toTeaser(story.author),
		};
	}

	export function toApiResponse(story: Story): StoryApiResponse {
		return {
			_id: story._id,
			slug: story.slug.getValue(),
			title: story.title,
			approximateReadingTime: story.approximateReadingTime.getMinutes(),
			badLanguage: story.badLanguage,
			originalPublication: story.originalPublication,
			author: AuthorMapper.toApiResponse(story.author),
			paragraphs: story.paragraphs,
			summary: story.summary,
			epigraphs: story.epigraphs,
			resources: story.resources,
			media: story.media,
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

// 3. Mapper para Storylist
namespace StorylistMapper {
	export function toDomain(sanityStorylist: SanityStorylistSchemaObject): Storylist {
		return {
			title: sanityStorylist.title,
			slug: Slug.create(sanityStorylist.slug),
			displayDates: sanityStorylist.displayDates,
			editionPrefix: sanityStorylist.editionPrefix,
			comingNextLabel: sanityStorylist.comingNextLabel,
			count: sanityStorylist.count,
			description: sanityStorylist.description,
			featuredImage: sanityStorylist.featuredImage,
			tags: sanityStorylist.tags,
			publications: sanityStorylist.publications.map((pub) => PublicationMapper.toDomain(pub)),
		};
	}

	export function toTeaser(storylist: Storylist): StorylistTeaser {
		return {
			title: storylist.title,
			slug: storylist.slug,
			displayDates: storylist.displayDates,
			editionPrefix: storylist.editionPrefix,
			comingNextLabel: storylist.comingNextLabel,
			count: storylist.count,
			description: storylist.description,
			featuredImage: storylist.featuredImage,
			tags: storylist.tags,
			publications: [], // Vacío en teaser
		};
	}

	export function toApiResponse(storylist: Storylist): StorylistApiResponse {
		return {
			title: storylist.title,
			slug: storylist.slug.getValue(),
			displayDates: storylist.displayDates,
			editionPrefix: storylist.editionPrefix,
			comingNextLabel: storylist.comingNextLabel,
			count: storylist.count,
			description: storylist.description,
			featuredImage: storylist.featuredImage,
			tags: storylist.tags,
			publications: storylist.publications.map((pub) => PublicationMapper.toApiResponse(pub)),
		};
	}
}

// 4. Mapper para Publication (entidad dentro de Storylist)
namespace PublicationMapper {
	export function toDomain(sanityPub: SanityPublicationSchemaObject): Publication {
		return {
			publishingOrder: sanityPub.publishingOrder,
			published: sanityPub.published,
			publishingDate: sanityPub.publishingDate ? DateString.create(sanityPub.publishingDate) : undefined,
			story: StoryMapper.toNavigationTeaserWithAuthor(StoryMapper.toDomain(sanityPub.story)),
		};
	}

	export function toApiResponse(publication: Publication): PublicationApiResponse {
		return {
			publishingOrder: publication.publishingOrder,
			published: publication.published,
			publishingDate: publication.publishingDate?.getValue(),
			story: StoryMapper.toApiResponse(publication.story),
		};
	}
}

// 5. Uso desde repositorio
class SanityStoryRepository implements StoryRepository {
	async findBySlug(slug: string): Promise<Story | null> {
		const result = await this.sanityClient.fetch(storyBySlugQuery(slug));
		return result ? StoryMapper.toDomain(result) : null;
	}

	async findAll(spec: StorySpecification): Promise<Story[]> {
		const query = this.buildGroqQuery(spec);
		const results = await this.sanityClient.fetch(query);
		return results.map(StoryMapper.toDomain);
	}
}

// 6. Uso desde controlador/servicio
@Controller('/api/story')
class StoryController {
	constructor(private storyRepository: StoryRepository) {}

	@Get(':slug')
	async getStory(@Param('slug') slug: string): Promise<StoryApiResponse> {
		const story = await this.storyRepository.findBySlug(slug);
		if (!story) {
			throw new NotFoundException('Story not found');
		}
		return StoryMapper.toApiResponse(story);
	}

	@Get(':slug/teaser')
	async getStoryTeaser(@Param('slug') slug: string): Promise<StoryTeaserApiResponse> {
		const story = await this.storyRepository.findBySlug(slug);
		if (!story) {
			throw new NotFoundException('Story not found');
		}
		const teaser = StoryMapper.toTeaser(story);
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
# Story Mappings

## toDomain

Convierte un documento de Sanity a un objeto Story de dominio.

**Input:** SanityStorySchemaObject
**Output:** Story
**Validaciones:** Se validan slugs y fechas

## toTeaser

Proyecta una Story a una vista ligera sin contenido pesado.

**Input:** Story
**Output:** StoryTeaser
**Cambios:** `paragraphs = []`

## toNavigationTeaser

Proyecta a vista mínima para navegación.

**Input:** Story
**Output:** StoryNavigationTeaser

## toNavigationTeaserWithAuthor

Igual que `toNavigationTeaser` pero incluye información del autor.

**Input:** Story
**Output:** StoryNavigationTeaserWithAuthor
**Cambios:** Incluye `author` como AuthorTeaser

## toApiResponse

Serializa Story para HTTP.

**Input:** Story
**Output:** StoryApiResponse (JSON serializable)
**Cambios:** Value Objects se convierten a strings
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

## 6. Invariantes Explícitas

### Situación Actual

Las reglas de negocio (invariantes) no están explícitas en el código. Se encuentran dispersas en validaciones o comentarios.

```typescript
// Ejemplo actual - Invariantes implícitas
interface Story {
	paragraphs: TextBlockContent[]; // ¿Puede estar vacío?
	author: Author; // ¿Siempre presente?
	approximateReadingTime: number; // ¿Puede ser negativo?
}

// Crear historia - Sin validación clara
const story: Story = {
	_id: '123',
	slug: 'test',
	title: 'Test',
	paragraphs: [], // ¿Se aceptan historias sin contenido?
	author: null!, // ¿Se aceptan sin autor?
	approximateReadingTime: -5, // ¿Tiempos negativos?
};
```

### Mejora Propuesta

Crear clases de agregado que enforzen invariantes en construcción:

```typescript
// 1. Clase agregado Story
class Story {
  readonly _id: string;
  readonly slug: Slug;
  readonly title: string;
  readonly paragraphs: TextBlockContent[];
  readonly author: Author;
  readonly approximateReadingTime: ReadingTime;
  readonly badLanguage?: boolean;
  readonly originalPublication: string;
  readonly epigraphs: Epigraph[];
  readonly summary: TextBlockContent[];
  readonly resources: Resource[];
  readonly media: Media[];

  // Constructor privado - fuerza uso de factory
  private constructor(props: StoryProps) {
    this._id = props._id;
    this.slug = props.slug;
    this.title = props.title;
    this.paragraphs = props.paragraphs;
    this.author = props.author;
    this.approximateReadingTime = props.approximateReadingTime;
    this.badLanguage = props.badLanguage;
    this.originalPublication = props.originalPublication;
    this.epigraphs = props.epigraphs;
    this.summary = props.summary;
    this.resources = props.resources;
    this.media = props.media;
  }

  // Factory method que valida invariantes
  static create(props: CreateStoryProps): Story {
    // Validar invariantes
    StoryInvariants.validate(props);

    return new Story({
      _id: props._id,
      slug: props.slug,
      title: props.title,
      paragraphs: props.paragraphs,
      author: props.author,
      approximateReadingTime: props.approximateReadingTime,
      badLanguage: props.badLanguage,
      originalPublication: props.originalPublication,
      epigraphs: props.epigraphs,
      summary: props.summary,
      resources: props.resources,
      resources: props.resources,
      media: props.media,
    });
  }

  // Factory alternativo para reconstrucción desde persistencia
  static reconstruct(props: StoryProps): Story {
    // No valida - asume que ya fue validado cuando se persistió
    return new Story(props);
  }

  // Métodos de negocio
  canBePublished(): boolean {
    return (
      this.paragraphs.length > 0 &&
      this.author !== null &&
      this.approximateReadingTime.getMinutes() > 0
    );
  }

  publish(): void {
    if (!this.canBePublished()) {
      throw new Error('Historia no cumple invariantes de publicación');
    }
    // Lógica de publicación
  }

  // Copiar con cambios (patrón Builder)
  withTitle(title: string): Story {
    return Story.create({
      ...this,
      title,
    });
  }

  withResources(resources: Resource[]): Story {
    return Story.create({
      ...this,
      resources,
    });
  }
}

// 2. Clase de invariantes
class StoryInvariants {
  static validate(props: CreateStoryProps | StoryProps): void {
    this.validateSlug(props.slug);
    this.validateTitle(props.title);
    this.validateContent(props.paragraphs);
    this.validateAuthor(props.author);
    this.validateReadingTime(props.approximateReadingTime);
  }

  private static validateSlug(slug: Slug): void {
    if (!slug) {
      throw new Error('Invariante violada: Historia debe tener slug');
    }
  }

  private static validateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Invariante violada: Historia debe tener título');
    }

    if (title.length > 255) {
      throw new Error('Invariante violada: Título no puede exceder 255 caracteres');
    }
  }

  private static validateContent(paragraphs: TextBlockContent[]): void {
    if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
      throw new Error('Invariante violada: Historia debe tener al menos un párrafo');
    }
  }

  private static validateAuthor(author: Author | null | undefined): void {
    if (!author) {
      throw new Error('Invariante violada: Historia debe tener un autor');
    }
  }

  private static validateReadingTime(readingTime: ReadingTime): void {
    if (!readingTime || readingTime.getMinutes() <= 0) {
      throw new Error('Invariante violada: Tiempo de lectura debe ser positivo');
    }
  }
}

// 3. Clase agregado Author
class Author {
  readonly _id: string;
  readonly slug: Slug;
  readonly name: string;
  readonly imageUrl: string;
  readonly nationality: AuthorNationality;
  readonly bornOn?: DateString;
  readonly diedOn?: DateString;
  readonly biography: TextBlockContent[];
  readonly resources: Resource[];

  private constructor(props: AuthorProps) {
    this._id = props._id;
    this.slug = props.slug;
    this.name = props.name;
    this.imageUrl = props.imageUrl;
    this.nationality = props.nationality;
    this.bornOn = props.bornOn;
    this.diedOn = props.diedOn;
    this.biography = props.biography;
    this.resources = props.resources;
  }

  static create(props: CreateAuthorProps): Author {
    AuthorInvariants.validate(props);
    return new Author({
      _id: props._id,
      slug: props.slug,
      name: props.name,
      imageUrl: props.imageUrl,
      nationality: props.nationality,
      bornOn: props.bornOn,
      diedOn: props.diedOn,
      biography: props.biography,
      resources: props.resources,
    });
  }

  static reconstruct(props: AuthorProps): Author {
    return new Author(props);
  }

  isAlive(): boolean {
    return !this.diedOn;
  }

  getAge(): number | null {
    if (!this.bornOn) return null;
    const today = DateString.today();
    // Implementar cálculo de edad
    return today.toDate().getFullYear() - this.bornOn.toDate().getFullYear();
  }
}

// 4. Clase de invariantes para Author
class AuthorInvariants {
  static validate(props: CreateAuthorProps | AuthorProps): void {
    this.validateSlug(props.slug);
    this.validateName(props.name);
    this.validateDates(props.bornOn, props.diedOn);
    this.validateNationality(props.nationality);
  }

  private static validateSlug(slug: Slug): void {
    if (!slug) {
      throw new Error('Invariante violada: Autor debe tener slug');
    }
  }

  private static validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Invariante violada: Autor debe tener nombre');
    }
  }

  private static validateDates(bornOn?: DateString, diedOn?: DateString): void {
    if (bornOn && diedOn) {
      if (!bornOn.isBefore(diedOn)) {
        throw new Error('Invariante violada: Fecha de muerte debe ser posterior a nacimiento');
      }
    }

    if (bornOn && bornOn.isAfter(DateString.today())) {
      throw new Error('Invariante violada: Fecha de nacimiento no puede ser futura');
    }
  }

  private static validateNationality(nationality: AuthorNationality): void {
    if (!nationality || !nationality.country || !nationality.flag) {
      throw new Error('Invariante violada: Nacionalidad incompleta');
    }
  }
}

// 5. Uso
try {
  const story = Story.create({
    _id: '123',
    slug: Slug.create('el-aleph'),
    title: 'El Aleph',
    paragraphs: [...], // No vacío
    author: author,    // Presente
    approximateReadingTime: ReadingTime.create(20),
    epigraphs: [],
    summary: [],
    resources: [],
    media: [],
  });
  // ✅ Válido - Se crea correctamente
} catch (error) {
  console.error('Historia inválida:', error.message);
}

try {
  const invalidStory = Story.create({
    _id: '456',
    slug: Slug.create('invalid'),
    title: 'Sin Contenido',
    paragraphs: [], // ❌ Vacío - Viola invariante
    author: author,
    approximateReadingTime: ReadingTime.create(5),
    epigraphs: [],
    summary: [],
    resources: [],
    media: [],
  });
} catch (error) {
  console.error(error.message);
  // Output: "Invariante violada: Historia debe tener al menos un párrafo"
}
```

### Mapeo desde Sanity con Invariantes

```typescript
namespace StoryMapper {
	export function toDomain(sanityStory: SanityStorySchemaObject): Story {
		try {
			return Story.create({
				_id: sanityStory._id,
				slug: Slug.createUnsafe(sanityStory.slug),
				title: sanityStory.title,
				paragraphs: sanityStory.paragraphs,
				author: AuthorMapper.toDomain(sanityStory.author),
				approximateReadingTime: ReadingTime.create(sanityStory.approximateReadingTime),
				badLanguage: sanityStory.badLanguage,
				originalPublication: sanityStory.originalPublication,
				epigraphs: sanityStory.epigraphs,
				summary: sanityStory.summary,
				resources: sanityStory.resources,
				media: sanityStory.media,
			});
		} catch (error) {
			// Los invariantes violados en Sanity indican un problema de datos
			console.error(`Error al mapear historia ${sanityStory.slug} desde Sanity:`, error.message);
			throw new InvalidDomainDataError(`Historia ${sanityStory.slug} no cumple invariantes del dominio`);
		}
	}
}
```

### Beneficios

- ✅ **Imposible estado inválido** - No se pueden crear instancias que violen invariantes
- ✅ **Validación centralizada** - Una clase controla todas las reglas
- ✅ **Documentación viva** - Los invariantes son código, no comentarios
- ✅ **Type-safe** - El compilador enforza estructura
- ✅ **Errors descriptivos** - Los mensajes explican qué invariante se violó

### Issues Relacionados

- [ ] Crear clases de agregado (Story, Author, Storylist, Contributor)
- [ ] Crear clases de invariantes para cada agregado
- [ ] Actualizar mappers para usar factories
- [ ] Agregar tests para violaciones de invariantes
- [ ] Documentar invariantes por agregado

---

## Patrones recomendados

### Patrón: Especificación (Specification Pattern) - Recomendado

**Descripción:** Encapsular lógica de consulta y filtrado en objetos especializados.

**Ejemplo propuesto:**

```typescript
// Especificación: Obtener historias publicadas después de 2023
interface StorySpecification {
	publishedAfter?: DateString;
	author?: string;
	minReadingTime?: number;
}

// Uso
const spanishStoriesSpec: StorySpecification = {
	publishedAfter: '2023-01-01',
};

const stories = await storyService.findBySpecification(spanishStoriesSpec);
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

interface StoryPublishedEvent extends DomainEvent {
	storyId: string;
	storySlug: string;
	authorId: string;
	storylistId?: string;
}

interface AuthorCreatedEvent extends DomainEvent {
	authorId: string;
	authorSlug: string;
	name: string;
}

// Publicación de eventos
story.publish(); // Internally: emits StoryPublishedEvent
```

**Beneficio:** Facilita integración entre contextos y rastrea cambios significativos.

---

## Priorización Recomendada

Para implementar estas mejoras de forma ordenada, se sugiere este orden:

1. **Formalizar Patrón de Repositorio** (Fundacional)
   - Necesaria para todas las otras mejoras
   - Menor impacto en código existente
   - Mejora testabilidad inmediatamente

2. **Objetos de Valor para Primitivas** (Fundacional)
   - Requiere de repositorio formal
   - Impacta múltiples archivos pero cambios mecánicos
   - Mejora type-safety significativamente

3. **Invariantes Explícitas** (Consolidación)
   - Utiliza Value Objects
   - Crea clases de agregado robustas
   - Elimina validaciones dispersas

4. **Mapeo Explícito entre Contextos** (Claridad)
   - Reorganiza código existente
   - No requiere cambios lógicos
   - Mejora mantenibilidad

5. **Patrón de Especificación** (Escalabilidad)
   - Opcional pero recomendado para consultas complejas
   - Fácil de agregar después de repositorio

6. **Implementar Eventos de Dominio** (Integración)
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
