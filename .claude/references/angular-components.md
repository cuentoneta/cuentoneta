# Componentes Angular — convenciones de cuentoneta

> Detalle de componentes referenciado desde el bullet **Frontend** de [`CLAUDE.md` → Arquitectura (resumen)](../../CLAUDE.md#arquitectura-resumen).
> Para el manejo de **estado** (servicios + signals/RxJS, signals-first), ver [`angular-state.md`](./angular-state.md).
>
> **Idioma:** la documentación va en español; el **código y los identificadores siempre en inglés**. Los comentarios pueden ir en español.

Esta referencia describe cómo se escriben los **componentes de presentación y de página** en cuentoneta. Los ejemplos buenos se anclan en componentes reales del repo (p. ej. `src/app/components/author-teaser-v3/`, alineado con el Design System v3). Los componentes previos al Design System v3 siguen pendientes de rediseño, pero la deuda contra **estas** reglas ya está saldada: `src/` no tiene lifecycle hooks, `@HostBinding`/`@HostListener`, `*ngIf`/`*ngFor` ni `firstValueFrom`.

---

## Base de todo componente

- **Standalone** (sin `NgModule`). No se declara `standalone: true` porque ya es el default de Angular.
- **OnPush por defecto**: en Angular 22 `OnPush` es la estrategia de detección de cambios por defecto, así que **no se declara** `changeDetection: ChangeDetectionStrategy.OnPush` en el decorador (igual que con `standalone: true`). No introducir esa línea en componentes nuevos ni dejarla en los existentes.
- App **zoneless** (sin Zone.js): la detección de cambios se dispara por signals, no por callbacks async. No depender de change detection automática post-evento.
- **Selector con prefijo `cuentoneta-`** (kebab-case, selector de elemento) para componentes; `cuentoneta` (camelCase, selector de atributo) para directivas.
- **`imports` explícitos** en el decorador con los componentes/directivas/pipes que usa la plantilla.

```typescript
import { Component, input } from '@angular/core';
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
})
export class AuthorTeaserV3Component {
	// Inputs
	public readonly author = input.required<AuthorTeaser>();
	public readonly tags = input<Tag[]>([]);
	public readonly storyCount = input<number>();
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
// Miembros de `src/app/components/share-button/share-button.component.ts`
export class ShareButtonComponent {
	public readonly platform = input.required<SharingPlatform>();

	protected readonly NgIcon = NgIcon;

	private readonly tooltipDirective = inject(TooltipDirective);
}
```

> Los `input()` / `output()` / `model()` llevan **`public` explícito**: son la API del componente. El resto, decidir entre `protected` y `private` según la plantilla lo consuma o no.

### Signals dentro del componente

Un `computed()` —y cualquier otra signal que no sea `input()`/`output()`/`model()`— es **`private` por defecto**. Pasa a **`protected`** solo cuando la plantilla del propio componente interpola su valor.

```typescript
protected readonly icon = computed(() => /* … */); // la plantilla lo interpola
private readonly isExpanded = signal(false); // estado interno, no llega a la plantilla
```

`public` queda reservado a las dos excepciones que ya fija la tabla: un miembro **requerido por una interfaz** (p. ej. `story` en `StoryComponent`, exigido por `StoryHost`) o **consumido por otro componente** (p. ej. `hiddenCount` de `TagsOverflowDirective`, que lee `TagsListComponent`). Exponer una signal en `public` "por las dudas" agranda la API del componente sin que nadie la consuma.

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
public readonly author = input.required<AuthorTeaser>();
public readonly tags = input<Tag[]>([]);
public readonly storyCount = input<number>();

// Input con transform
public readonly isVisible = input(VisibilityState.Visible, {
	transform: (value) => (value ? VisibilityState.Visible : VisibilityState.Hidden),
});

// Output / model — también API del componente
public readonly selected = output<string>();
public readonly value = model<string>('');

// Queries — no son API: `protected` si la plantilla las usa, `private` si no
private readonly listItems = contentChildren(TagComponent);
```

Los valores **derivados** son `computed()`, nunca estado duplicado guardado a mano:

```typescript
protected readonly icon = computed(() => {
	if (!this.tag().slug) {
		return null;
	}
	return iconMappers.find((m) => m.name === this.tag().slug)?.ngIconsName ?? null;
});
```

---

## Prohibido: lifecycle hooks

**No usar lifecycle hooks** (`OnInit`/`ngOnInit`, `OnChanges`, `AfterViewInit`, `OnDestroy`, etc.). Reemplazar por las primitivas reactivas:

| En vez de…                                       | Usar…                                                                                                            |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `ngOnInit` / `ngOnChanges` reaccionando a inputs | `computed()` (derivación pura) o `effect()` (efecto colateral)                                                   |
| `ngAfterViewInit` para tocar el DOM              | `viewChild()` / `afterNextRender()` / `afterRenderEffect()`                                                      |
| `ngAfterContentInit`                             | `contentChild()` / `contentChildren()`                                                                           |
| `ngOnDestroy` para limpieza                      | **`effect((onCleanup) => onCleanup(...))`** (por defecto); `takeUntilDestroyed()` para cortar suscripciones RxJS |

El reemplazo de `ngOnDestroy` por un `effect()` nombrado con `onCleanup` es el patrón **por defecto** para cualquier limpieza al destruirse: sirve en componentes, directivas y servicios creados en contexto de inyección (un `effect()` sin lecturas de signals solo corre su `onCleanup` en la destrucción). Es un mapeo canónico — **no se comenta** que el `effect` reemplaza al hook (ver [`coding-agent-policies.md`](./coding-agent-policies.md) Sección 3).

```typescript
// ❌ Antes
export class MetaTagsDirective implements OnDestroy {
	ngOnDestroy() {
		this.resetTags();
	}
}

// ✅ Después — field initializer nombrado, sin comentario que reitere el reemplazo
export class MetaTagsDirective {
	private readonly resetTagsOnDestroy = effect((onCleanup) => {
		onCleanup(() => this.resetTags());
	});
}
```

---

## `effect()` como field initializers nombrados

Todo `effect()` / `afterRenderEffect()` / `afterNextRender()` se declara como **field initializer nombrado**, **nunca dentro del `constructor`**. Los field initializers de clases decoradas corren en contexto de inyección, así que `effect()` funciona ahí.

```typescript
// ✅ Correcto — effect nombrado como field, después de lo que referencia
// (tomado de `share-button.component.ts`)
export class ShareButtonComponent {
	private readonly tooltipDirective = inject(TooltipDirective);
	public readonly platform = input.required<SharingPlatform>();

	private readonly syncTooltipEffect = effect(() => {
		this.tooltipDirective.text.set(`Compartir en ${this.platform().name}`);
		this.tooltipDirective.position.set('bottom');
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
private readonly storyApi = inject(StoryApi); // token del API provider, no la clase concreta
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
- Manejar el elemento anfitrión (clases, bindings, eventos) vía la propiedad `host` del decorador, nunca con `@HostBinding`/`@HostListener` ni con `:host { @apply ... }` en `styles` (ver [Host element](#host-element)).

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
>
> **Punto ciego:** olvidar el `()` en una **plantilla** no lo atrapa el lint — `@angular-eslint/no-uncalled-signals` solo cubre código **TS** (ver [`angular-state.md`](./angular-state.md)). `strictTemplates` tampoco lo detecta: `mySignal.length` es type-válido (lee `Function.length`, un `number`). En plantillas, invocar el signal queda como disciplina de revisión.

---

## Host element

Todo lo que afecte al elemento anfitrión (host) se declara en la propiedad **`host`** del decorador `@Component`/`@Directive`. No usar los decoradores `@HostBinding`/`@HostListener` ni el bloque `:host { @apply ... }` en `styles`. Todo está **enforced por lint**: los decoradores vía `@angular-eslint/prefer-host-metadata-property`, y el `:host { @apply ... }` vía las reglas custom `no-apply-in-host-styles` (ESLint, estilos inline en `.ts`) y `cuentoneta/no-apply-in-host` (Stylelint, archivos `.css`).

| En vez de…                                   | Usar en `host`                        |
| -------------------------------------------- | ------------------------------------- |
| `@HostListener('<evento>') handler()`        | `host: { '(<evento>)': 'handler()' }` |
| `@HostBinding('<prop>') prop`                | `host: { '[<prop>]': 'expr' }`        |
| `:host { @apply <utilidades>; }` en `styles` | `host: { class: '<utilidades>' }`     |

```typescript
@Directive({
	selector: '[cuentonetaTooltip]',
	host: {
		'(mouseenter)': 'onMouseEnter()',
		'(mouseleave)': 'onMouseLeave()',
	},
})
export class TooltipDirective {
	// Los métodos referenciados por string desde `host` alcanzan con ser `protected`.
	protected onMouseEnter() {
		/* ... */
	}
	protected onMouseLeave() {
		/* ... */
	}
}
```

Notas:

- Los métodos/propiedades referenciados por string desde `host` solo necesitan ser **`protected`** (no `public`). Distinto es el caso de las directivas cuya API la consumen los anfitriones vía `hostDirectives` + `inject(Directive)` (p. ej. `TooltipDirective.text.set(...)`): esas signals **sí** son `public` por ser API imperativa.
- El bloque `:host` en `styles` se reserva para lo que **no** es `@apply`: CSS crudo (`font-family`, `transition`, …), `:host ::ng-deep ...` y `:host(.clase)` condicionales. Esas reglas **no** se mueven a `host`.
- Si el componente ya tiene `host: { class: '...' }`, **agregar** las utilidades al string existente, no reemplazarlo.
- **`hostDirectives`** (campo del decorador, distinto de `host`) es el mecanismo de composición de directivas del anfitrión. En **componentes de página** es cómo se declaran las directivas de SEO (meta tags + structured data): la forma correcta depende de la indexabilidad de la ruta y está **enforced por test** — ver [`angular-state.md` §8](./angular-state.md#8-directivas-de-seo-de-página-declarar-el-combo-según-la-indexabilidad).

---

## Prohibiciones adicionales

- **Propiedades estáticas** en componentes/servicios → usar un servicio singleton (`providedIn: 'root'`).
- **`enum` de TypeScript** → usar `Object.freeze({...} as const)` con su `type` derivado (ver `CLAUDE.md`).
- **Non-null assertion (`!`)** → estrechar con `@if`/guards o tipar correctamente.
- En el frontend: **`firstValueFrom`/`lastValueFrom`/`toPromise`** prohibidos → componer con `computed()`/`toSignal()`/operadores RxJS (ver [`angular-state.md`](./angular-state.md)).

---

## Checklist al crear/modificar un componente

- [ ] Selector `cuentoneta-…`; sin declarar `changeDetection` (OnPush es el default de v22).
- [ ] Inputs/outputs con `input()`/`input.required()`/`output()`/`model()`; queries con `viewChild()`/`contentChild()`.
- [ ] Campos `protected` (plantilla) / `private` (interno); `public` solo para API (inputs/outputs/imperativa/interfaces).
- [ ] Sin lifecycle hooks: derivar con `computed()`, efectos como `effect()` nombrados (no en el constructor).
- [ ] DI con `inject()`.
- [ ] Plantilla con `@if`/`@for` (con `track`)/`@switch`, self-closing tags y `ngSrc`.
- [ ] Host (clases/bindings/eventos) en la propiedad `host` del decorador; sin `@HostBinding`/`@HostListener` ni `:host { @apply ... }`.
- [ ] Sin `enum`, sin propiedades estáticas, sin `!`.
- [ ] Acompañar con su `*.stories.ts` (Storybook) y tests con Angular Testing Library (ver [`testing.md`](./testing.md)).
- [ ] El estado vive en servicios + signals (ver [`angular-state.md`](./angular-state.md)).
