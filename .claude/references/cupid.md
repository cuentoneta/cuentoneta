<!-- Fuente: CLAUDE.md | Última actualización: 2026-06-15 -->

# Principios CUPID

Escribí código que dé gusto trabajar haciéndolo:

## Componible (Composable)

- Diseñá unidades que se combinen fácilmente con otras
- Mantené las dependencias mínimas y explícitas (`inject()`, no estado global oculto)
- Favorecé piezas pequeñas y enfocadas que funcionen bien juntas
- Habilitá el plug-and-play mediante interfaces claras

```typescript
// ✅ Componible: el mapper es una función pura que se compone con cualquier query
export function mapAuthorTeaser(raw: SanityAuthor): AuthorTeaser {
	return {
		slug: raw.slug.current,
		name: raw.name,
		imageUrl: urlForWithAutoFormat(raw.image),
	};
}
```

## Filosofía Unix (Unix Philosophy)

- Hacé una sola cosa, y hacela bien (un `fetchStoryBySlug` lee; no mapea ni valida)
- Trabajá con interfaces simples y bien definidas entre capas (`repository` → `service` → `controller`)
- Diseñá para componer con otras herramientas
- Evitá la complejidad innecesaria (respetá los límites de función ≤ 50 líneas y complejidad ≤ 10)

```typescript
// ✅ Cada capa hace una cosa
// repository: solo trae el resultado crudo de Sanity
export const fetchStoryBySlug = (slug: string) => client.fetch(storyBySlugQuery, { slug });

// service: envuelve al repository y mapea al dominio vía la ACL
export const getStoryBySlug = async (slug: string): Promise<Story> => mapStory(await fetchStoryBySlug(slug));
```

## Predecible (Predictable)

- El código hace lo que parece que hace
- Comportate de forma consistente y determinística
- Minimizá las sorpresas; seguí el principio de la menor sorpresa
- Usá nombres que revelen la intención (`getStories`, `closeOnSuccessEffect`)
- Manejá los casos límite de forma explícita y visible (errores tipados por operación, no un `string | null` compartido)

```typescript
// ✅ El nombre del effect revela qué hace y cuándo
private readonly syncSlugEffect = effect(() => {
	const slug = this.slug();
	untracked(() => this.load(slug));
});
```

## Idiomático (Idiomatic)

- Seguí las convenciones del lenguaje, del framework y del propio repo
- Escribí código que se sienta natural para quien conoce el ecosistema
- Usá patrones estándar — no reinventes la rueda
- Respetá el estilo y la estructura existentes en cuentoneta:
  - Componentes standalone, `OnPush`, app **zoneless**: signals / `computed` / `effect` en vez de lifecycle hooks
  - `@if` / `@for` / `@switch` en plantillas (nunca `*ngIf`/`*ngFor`), self-closing tags, `ngSrc`
  - `Object.freeze({...} as const)` en vez de `enum`
  - Tests con Angular Testing Library + wrappers de `@test-utils` (nunca `vi.*` directo)

```typescript
// ✅ Idiomático en cuentoneta: derivar con computed, no estado duplicado
protected readonly hasStories = computed(() => this.stories().length > 0);
```

## Basado en el dominio (Domain-Based)

- Usá el lenguaje del dominio del problema, no detalles de implementación técnica
- Estructurá el código alrededor de conceptos de negocio (`Story`, `Author`, `Storylist`, `Resource`)
- Hacé que el código cuente la historia de lo que el sistema hace
- Mantené la lógica de dominio separada de la infraestructura: el **ACL (mappers)** traduce el shape crudo de Sanity al modelo de dominio, y los resultados crudos de GROQ **nunca** se filtran al frontend

```typescript
// ✅ El dominio habla: lecturas de Storylist, no "documents con _type"
export const getStorylistBySlug = async (slug: string): Promise<Storylist> =>
	mapStorylist(await fetchStorylistBySlug(slug));
```

_Fuente: Dan North, "CUPID—for joyful coding"_
