# Componentes Angular — convenciones de cuentoneta

> Detalle de componentes referenciado desde el bullet **Frontend** de [`CLAUDE.md` → Arquitectura (resumen)](../../CLAUDE.md#arquitectura-resumen).
> Para el manejo de **estado** (servicios + signals/RxJS, signals-first), ver [`angular-state.md`](./angular-state.md).
>
> **Idioma:** la documentación va en español; el **código y los identificadores siempre en inglés**. Los comentarios pueden ir en español.

Esta referencia describe cómo se escriben los **componentes de presentación y de página** en cuentoneta. Los ejemplos buenos se anclan en componentes reales del repo (p. ej. `src/app/components/author-card-teaser/`, alineado con el Design System v3). Los componentes previos al Design System v3 siguen pendientes de rediseño, pero la deuda contra **estas** reglas ya está saldada: `src/` no tiene lifecycle hooks, `@HostBinding`/`@HostListener`, `*ngIf`/`*ngFor` ni `firstValueFrom`.

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
	selector: 'cuentoneta-author-card-teaser',
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
export class AuthorCardTeaserComponent {
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
// Miembros de `src/app/components/resource/resource.component.ts`
export class ResourceComponent {
	public readonly resource = input.required<Resource>();

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

`public` queda reservado a las dos excepciones que ya fija la tabla: un miembro **requerido por una interfaz** (p. ej. `literaryWork` en `LiteraryWorkPage`, exigido por `LiteraryWorkHost`) o **consumido por otro componente** (p. ej. `hiddenCount` de `TagsOverflowDirective`, que lee `TagsListComponent`). Exponer una signal en `public` "por las dudas" agranda la API del componente sin que nadie la consuma.

---

## Configuración de la clase

La configuración propia de un componente, directiva o servicio —un mapa `size → clase`, una tabla de iconos, una tabla de estilo— va como **`private readonly` de instancia** y se consume con `this.`. Nunca como `const` a nivel de módulo.

El discriminante es **de quién es la tabla**, no qué contiene ni cuántos la leen hoy. Si la correspondencia solo significa algo puertas adentro de una clase —cómo se pinta _este_ componente— es configuración suya y va adentro, aunque mañana otro quiera copiarla. Si en cambio la correspondencia es del dominio y sigue siendo verdadera fuera de cualquier clase —qué widget corresponde a cada tipo de medio, con independencia de qué política los monte—, no es configuración de nadie: va a su propio módulo, sin decoradores, como única cara por la que se consulta. Extraerla es lo que impide que dos consumidores declaren cada uno la suya y diverjan; el momento de hacerlo es cuando aparece el segundo, no cuando ya divergieron.

La regla de ESLint **no verifica esa propiedad** —no puede: solo mira si el archivo declara un decorador—. Lo que verifica es la mitad mecánica: dentro de un archivo con decorador, la config va en la clase.

```ts
// ❌ El mapa es estado del componente, pero vive fuera de él.
const SIZE_MAP = { sm: 'h-8 w-8', lg: 'h-16 w-16' };

@Component({/* … */})
export class ImageProfileComponent {
	protected readonly classes = computed(() => SIZE_MAP[this.size()]);
}
```

```ts
// ✅ Co-locado con su único consumidor.
@Component({/* … */})
export class ImageProfileComponent {
	private readonly sizeMap = { sm: 'h-8 w-8', lg: 'h-16 w-16' };

	protected readonly classes = computed(() => this.sizeMap[this.size()]);
}
```

**Rationale.** Dos razones:

1. **Encapsulación.** Un mapa que solo tiene sentido para una clase es parte de esa clase. A nivel de módulo queda al alcance de cualquier cosa que se agregue después al archivo, y deja de estar claro quién lo gobierna.
2. **Co-locación.** El único consumidor está a unas líneas; la constante de módulo obliga a saltar al tope del archivo para leer lo que la clase usa acá.

Lo aplica la regla de ESLint **`component-config-in-class`**, que dispara ante un `const` de módulo **no exportado** con literal de objeto o de arreglo —incluido el envuelto en `Object.freeze(...)`, `as const`, `as Foo` o `satisfies Foo`— en un archivo que declare `@Component`, `@Directive`, `@Injectable` o `@Service`.

Quedan fuera tres casos:

- Un `const` **exportado**: es API compartida, y si se consume desde otro archivo ya no es configuración privada de la clase.
- El **sustituto de `enum`** que exigen las [restricciones duras](../../CLAUDE.md#restricciones-duras-hard-constraints) — `Object.freeze({...} as const)` con su `type` homónimo derivado por `typeof`—, porque un alias de tipo no puede derivarse de un campo de instancia y el `const` necesita scope de módulo. La regla lo detecta por esa derivación.
- Los `*.spec.ts` y `*.stories.ts`, cuyos componentes host y fixtures de módulo son datos del test, no configuración de una clase.

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

El reemplazo de `ngOnDestroy` por un `effect()` nombrado con `onCleanup` es el patrón **por defecto** para cualquier limpieza al destruirse: sirve en componentes, directivas y servicios creados en contexto de inyección (un `effect()` sin lecturas de signals solo corre su `onCleanup` en la destrucción). Es un mapeo canónico — **no se comenta** que el `effect` reemplaza al hook (ver la skill [`aposd-comments-style`](../skills/aposd-comments-style/SKILL.md), "Cuatro formas de ruido que este repo produce seguido").

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
// (tomado de `resource.component.ts`)
export class ResourceComponent {
	private readonly tooltipDirective = inject(TooltipDirective);
	public readonly resource = input.required<Resource>();

	private readonly syncTooltipEffect = effect(() => {
		this.tooltipDirective.text.set(this.resource().title);
		this.tooltipDirective.position.set('bottom');
	});
}

// ❌ Incorrecto — effect anónimo dentro del constructor
export class LiteraryWorkPage {
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
private readonly literaryWorkApi = inject(LiteraryWorkApi); // token del API provider, no la clase concreta
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
- **La transformación de una imagen de Sanity no se escribe en el componente.** La resuelve el `IMAGE_LOADER` que `app.config.ts` registra (`src/app/providers/sanity-image-loader.ts`): envolver la URL a mano duplica los parámetros, porque el loader corre igual. Lo que el componente sí controla es de dónde salen los anchos del `srcset` — de `width`/`height`, que producen el tamaño de display y su 2×, o de `sizes`, que produce los breakpoints. Con `fill` y sin `sizes` declarado, Angular asume `100vw`: el `srcset` sale igual, pero pide anchos de viewport completo para una imagen que quizá ocupe una fracción, así que declarar `sizes` sigue siendo lo correcto cuando no lo ocupa entero.
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

## Escala de apilamiento (z-index)

Todo apilamiento sale de la escala del Design System, declarada como tokens `--z-index-*` en el `@theme` de `src/tailwind.css`. Nunca un número crudo (`z-10`, `z-[999]`, `z-index: 2`).

| Token        | Valor | Alcance     | Quién la usa                                                                     |
| ------------ | ----- | ----------- | -------------------------------------------------------------------------------- |
| `z-content`  | 10    | **Interna** | Ordena hermanos dentro de un componente (p. ej. superponer texto a una imagen).  |
| `z-raised`   | 20    | **Interna** | Un elemento que se eleva por encima de `z-content` dentro del mismo componente.  |
| `z-nav`      | 50    | **Global**  | La barra de navegación fija (`header.component.ts`).                             |
| `z-floating` | 60    | **Global**  | La capa flotante anclada al `body` (p. ej. el tooltip, `tooltip.directive.css`). |

### Norma de confinamiento

Un componente que eleva algo **dentro de sí** aísla su apilamiento con `isolate` en el elemento que contiene la elevación (`z-content`/`z-raised`). Confinado el contexto, el valor numérico deja de significar nada afuera de ese subárbol: dos componentes no relacionados pueden usar `z-raised` cada uno sin competir entre sí.

Las capas globales son lo contrario: se usan **sin** aislar. Aislar la barra o la capa flotante las haría perder contra el contenido de página en vez de quedar por encima de todo. Por eso su franja (50-60) está **reservada** — ningún otro archivo puede usarlas, ni como utilidad (`z-nav`) ni como declaración (`z-index: var(--z-index-nav)`), salvo los que ya las declaran a nivel de aplicación.

**Sumar una capa nueva toca dos archivos si es global:** el token en el `@theme` y el conjunto de capas globales de `tools/z-index-scale.js`. Que una capa sea global es una decisión de diseño y no una consecuencia de su número, así que el helper la distingue por nombre; un token global agregado solo al tema pasaría por interno.

**No hay capa "por debajo".** Las utilidades negativas (`-z-content`) se rechazan: mandar algo detrás se resuelve con el orden del documento dentro de un contexto confinado. Si aparece un caso real que no se pueda expresar así, se suma una capa a la escala en vez de un valor suelto.

### Cobertura por gate

| Gate        | Qué valida                                                                                                                                                                       |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lint`      | `custom-z-index/z-index-scale` (ESLint) sobre `src/**/*.ts` y `src/**/*.html` — cubre `host: { class }`, mapas de clases, `styles` inline, plantillas inline y `.html` externos. |
| `stylelint` | `cuentoneta/z-index-scale` sobre los `.css` — declaraciones `z-index` y utilidades en `@apply`.                                                                                  |
| `test`      | El spec del helper `tools/z-index-scale.js` valida la escala contra el `@theme` real de `src/tailwind.css`.                                                                      |
| `e2e`       | La aserción de apilamiento contra la barra de navegación (`e2e/_utils/stacking.ts`), en todas las rutas con fixture estable.                                                     |

Las dos reglas de lint reservan la franja global con la opción `allowGlobalLayersIn`, acotada por archivo: solo el componente o directiva dueños de una capa global pueden nombrarla.

### Puntos ciegos declarados

- Un nombre de clase computado en runtime (`'z-' + n`) es invisible a un escaneo estático.
- Una asignación directa a `style.zIndex` también lo es.
- Que el `isolate` esté en el ancestro correcto no lo decide ninguna regla de lint: lo mide el e2e de apilamiento, que discrimina el defecto por hit-test en un navegador real. Ese e2e mira la barra de navegación; el orden **dentro** de un componente no lo cubre ningún gate, así que un cambio de capas internas se verifica en el navegador.
- El **drawer** no participa de la escala: se apoya en `<dialog>.showModal()`, que promueve el elemento al top layer nativo del navegador — un mecanismo inmune al `z-index` de la página.

### Por qué el enforcement vive en lint

La utilidad `z` de Tailwind resuelve cualquier número sin consultar el tema, así que `z-10` compila con o sin escala declarada. Una capa mal escrita (`z-nvv`) tampoco falla el build: no emite CSS alguno y el defecto viaja invisible hasta que alguien lo ve en pantalla. Por eso la namespace `--z-index-*` del `@theme` **no** se limpia con `initial`, a diferencia de `--color-*`/`--breakpoint-*`/`--radius-*`: no hay defaults de Tailwind que limpiar, y limpiarla tampoco desactivaría los números crudos. Lo que cierra ese hueco es una regla de lint, no el archivo del tema.

---

## Prohibiciones adicionales

- **Propiedades estáticas** en componentes/servicios → usar un servicio singleton (`@Service()`).
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
- [ ] Todo apilamiento con un token de la escala (`z-content`/`z-raised`/`z-nav`/`z-floating`), nunca un número crudo; `isolate` si el componente eleva algo dentro de sí (ver [Escala de apilamiento](#escala-de-apilamiento-z-index)).
- [ ] Sin `enum`, sin propiedades estáticas, sin `!`.
- [ ] Acompañar con tests de Angular Testing Library y con su `*.stories.ts` (Storybook), salvo que delegue toda su vista en otro componente ya catalogado (ver [`testing.md`](./testing.md)).
- [ ] El estado vive en servicios + signals (ver [`angular-state.md`](./angular-state.md)).
