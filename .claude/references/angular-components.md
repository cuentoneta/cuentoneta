# Componentes Angular — convenciones de cuentoneta

> Detalle de componentes referenciado desde [`CLAUDE.md`](../../CLAUDE.md) (sección "Arquitectura de código (Angular)").
> Para el manejo de **estado** (servicios + signals/RxJS, signals-first), ver [`angular-state.md`](./angular-state.md).
>
> **Idioma:** la documentación va en español; el **código y los identificadores siempre en inglés**. Los comentarios pueden ir en español.

Esta referencia describe cómo se escriben los **componentes de presentación y de página** en cuentoneta. Los ejemplos buenos se anclan en componentes reales del repo (p. ej. `src/app/components/author-teaser-v3/`, alineado con el Design System v3). Algunos componentes antiguos del repo (p. ej. `badge`, `header`) todavía violan estas reglas: **son deuda técnica, no el patrón a imitar** — al tocarlos, migrarlos.

---

## Base de todo componente

- **Standalone** (sin `NgModule`). No se declara `standalone: true` porque ya es el default de Angular.
- **`ChangeDetectionStrategy.OnPush`** siempre.
- App **zoneless** (sin Zone.js): la detección de cambios se dispara por signals, no por callbacks async. No depender de change detection automática post-evento.
- **Selector con prefijo `cuentoneta-`** (kebab-case, selector de elemento) para componentes; `cuentoneta` (camelCase, selector de atributo) para directivas.
- **`imports` explícitos** en el decorador con los componentes/directivas/pipes que usa la plantilla.

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthorTeaser } from '@models/author.model';
import { Tag } from '@models/tag.model';
import { ImageProfileComponent } from '../image-profile/image-profile.component';
import { TagsListComponent } from '../tags-list/tags-list.component';

@Component({
	selector: 'cuentoneta-author-teaser-v3',
	imports: [NgOptimizedImage, RouterLink, ImageProfileComponent, TagsListComponent],
	template: `
		<article class="relative flex items-start gap-4" data-testid="author">
			<!-- ... -->
		</article>
	`,
	host: {
		class: 'block',
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorTeaserV3Component {
	// Inputs
	readonly author = input.required<AuthorTeaser>();
	readonly tags = input<Tag[]>([]);
	readonly storyCount = input<number>();
}
```

---

## Visibilidad de campos

Regla central: **un campo de componente nunca es `public` por defecto.** Las plantillas de Angular pueden acceder a miembros `protected`, así que no hay razón para exponer nada como `public` solo para usarlo en la plantilla.

| Visibilidad | Cuándo                                                                                                                                                                               |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `protected` | Campos/métodos usados **solo en la plantilla** del propio componente (rutas de navegación, helpers de formato, flags de UI).                                                         |
| `private`   | Internos no referenciados en ninguna plantilla (servicios inyectados, effects, estado interno).                                                                                      |
| `public`    | **Solo** inputs/outputs/models de signals (`input()`, `output()`, `model()`), **API imperativa** llamada por padres (`open()`, `close()`), y miembros **requeridos por interfaces**. |

```typescript
export class AuthorTeaserV3Component {
	// public: input de signal → parte de la API del componente
	readonly author = input.required<AuthorTeaser>();

	// protected: solo lo consume la plantilla
	protected readonly appRoutes = AppRoutes;

	// private: interno, no aparece en la plantilla
	private readonly store = inject(StoryService);
}
```

> Los `input()`/`output()`/`model()` no llevan modificador (son `public` implícito): son la API del componente. El resto, decidir entre `protected` y `private` según se use o no en la plantilla.

---

## Inputs / outputs / queries con signals

Nunca usar decoradores `@Input()`/`@Output()`/`@ViewChild()`/`@ContentChild()`. Usar las APIs de signals:

| API                                    | Uso                                                    |
| -------------------------------------- | ------------------------------------------------------ |
| `input<T>(default)`                    | Input opcional con valor por defecto.                  |
| `input.required<T>()`                  | Input obligatorio (sin default).                       |
| `input(default, { transform })`        | Input con transformación de entrada.                   |
| `output<T>()`                          | Evento de salida (reemplaza `@Output() EventEmitter`). |
| `model<T>()`                           | Two-way binding (`[(x)]`).                             |
| `viewChild()` / `viewChildren()`       | Referencias a la vista propia.                         |
| `contentChild()` / `contentChildren()` | Referencias a contenido proyectado.                    |

```typescript
// Inputs
readonly author = input.required<AuthorTeaser>();
readonly tags = input<Tag[]>([]);
readonly storyCount = input<number>();

// Input con transform
readonly isVisible = input(VisibilityState.Visible, {
	transform: (value) => (value ? VisibilityState.Visible : VisibilityState.Hidden),
});

// Output / model / queries
readonly selected = output<string>();
readonly value = model<string>('');
readonly listItems = contentChildren(TagComponent);
```

Los valores **derivados** son `computed()`, nunca estado duplicado guardado a mano:

```typescript
readonly icon = computed(() => {
	if (!this.tag().slug) {
		return null;
	}
	return iconMappers.find((m) => m.name === this.tag().slug)?.ngIconsName ?? null;
});
```

---

## Prohibido: lifecycle hooks

**No usar lifecycle hooks** (`OnInit`/`ngOnInit`, `OnChanges`, `AfterViewInit`, `OnDestroy`, etc.). Reemplazar por las primitivas reactivas:

| En vez de…                                       | Usar…                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------------- |
| `ngOnInit` / `ngOnChanges` reaccionando a inputs | `computed()` (derivación pura) o `effect()` (efecto colateral)            |
| `ngAfterViewInit` para tocar el DOM              | `viewChild()` / `afterNextRender()` / `afterRenderEffect()`               |
| `ngAfterContentInit`                             | `contentChild()` / `contentChildren()`                                    |
| `ngOnDestroy` para limpieza                      | `takeUntilDestroyed()`, o el cleanup que retorna `effect()` (`onCleanup`) |

> Componentes antiguos como `badge.component.ts` aún usan `implements OnInit`; al modificarlos, migrar el `ngOnInit` a un `effect()` nombrado o a `computed()`.

---

## `effect()` como field initializers nombrados

Todo `effect()` / `afterRenderEffect()` / `afterNextRender()` se declara como **field initializer nombrado**, **nunca dentro del `constructor`**. Los field initializers de clases decoradas corren en contexto de inyección, así que `effect()` funciona ahí.

```typescript
// ✅ Correcto — effect nombrado como field, después de lo que referencia
export class StoryComponent {
	private readonly store = inject(StoryService);
	readonly slug = input.required<string>();

	private readonly syncSlugEffect = effect(() => {
		const slug = this.slug();
		untracked(() => this.store.load(slug));
	});
}

// ❌ Incorrecto — effect anónimo dentro del constructor
export class StoryComponent {
	constructor() {
		effect(() => {
			/* ... */
		});
	}
}
```

Reglas:

- **Nombre descriptivo** del efecto (`syncSlugEffect`, `closeOnSuccessEffect`, `hideMenuOnNavigationEffect`).
- Los campos que el effect **referencia se declaran antes** que el effect en el orden del cuerpo de la clase (los field initializers corren de arriba hacia abajo).
- Para escribir señales dentro del effect sin crear dependencias, envolver con `untracked()`.

---

## Inyección de dependencias

- **Siempre `inject()`**, nunca inyección por constructor.
- Marcar las dependencias `private readonly` (o `protected readonly` si la plantilla las usa).

```typescript
private readonly store = inject(StoryService);
private readonly injector = inject(EnvironmentInjector);
```

### App initializers

`provideAppInitializer` usa una **factory nombrada** en un archivo `<nombre>.initializer.ts` que devuelve un closure async. **Nunca** lógica inline en `app.config.ts`.

```typescript
// foo.initializer.ts
export function provideFooInitializer() {
	return provideAppInitializer(() => {
		const service = inject(FooService);
		return service.preload();
	});
}
```

---

## Control flow en plantillas

- **`@if` / `@for` / `@switch`** — nunca `*ngIf` / `*ngFor` / `*ngSwitch`.
- `@for` **requiere `track`**.
- **Self-closing tags** para elementos sin contenido proyectado (`<cuentoneta-tag ... />`).
- **`ngSrc`** (de `NgOptimizedImage`) para imágenes, no `src` crudo; declarar `width`/`height`.
- Vincular clases de host vía la propiedad `host` del decorador, no `@HostBinding`.

```html
<article class="relative flex items-start gap-4" data-testid="author">
	<cuentoneta-image-profile [src]="author().imageUrl" [alt]="'Retrato de ' + author().name" size="lg" />

	@if (tags().length > 0) {
	<cuentoneta-tags-list>
		@for (tag of tags(); track tag.slug) {
		<cuentoneta-tag [label]="tag.title" variant="filled" />
		}
	</cuentoneta-tags-list>
	} @if (author().nationality.flag) {
	<img [ngSrc]="author().nationality.flag" [alt]="author().nationality.country" width="21" height="16" />
	} @if (storyCount() !== undefined) {
	<span data-testid="story-count"> {{ storyCount() }} {{ storyCount() === 1 ? 'historia' : 'historias' }} </span>
	}
</article>
```

> Las signals se **invocan** en la plantilla: `author()`, `tags()`, `storyCount()`.

---

## Prohibiciones adicionales

- **Propiedades estáticas** en componentes/servicios → usar un servicio singleton (`providedIn: 'root'`).
- **`enum` de TypeScript** → usar `Object.freeze({...} as const)` con su `type` derivado (ver `CLAUDE.md`).
- **Non-null assertion (`!`)** → estrechar con `@if`/guards o tipar correctamente.
- En el frontend: **`firstValueFrom`/`lastValueFrom`/`toPromise`** prohibidos → componer con `computed()`/`toSignal()`/operadores RxJS (ver [`angular-state.md`](./angular-state.md)).

---

## Checklist al crear/modificar un componente

- [ ] `ChangeDetectionStrategy.OnPush` y selector `cuentoneta-…`.
- [ ] Inputs/outputs con `input()`/`input.required()`/`output()`/`model()`; queries con `viewChild()`/`contentChild()`.
- [ ] Campos `protected` (plantilla) / `private` (interno); `public` solo para API (inputs/outputs/imperativa/interfaces).
- [ ] Sin lifecycle hooks: derivar con `computed()`, efectos como `effect()` nombrados (no en el constructor).
- [ ] DI con `inject()`.
- [ ] Plantilla con `@if`/`@for` (con `track`)/`@switch`, self-closing tags y `ngSrc`.
- [ ] Sin `enum`, sin propiedades estáticas, sin `!`.
- [ ] Acompañar con su `*.stories.ts` (Storybook) y tests con Angular Testing Library (ver [`testing.md`](./testing.md)).
- [ ] El estado vive en servicios + signals (ver [`angular-state.md`](./angular-state.md)).
