# Estado: signals-first (sin NgRx)

> **Alcance:** cómo se modela y muta el **estado** en el frontend de La Cuentoneta. Complementa el bullet **Frontend** de [`CLAUDE.md` → Arquitectura (resumen)](../../CLAUDE.md#arquitectura-resumen) —donde se fija el estado **signals-first sin NgRx**— con ejemplos anclados en el código real.
>
> **Idioma:** explicación en español, **código/identificadores en inglés**.
>
> Ver también: [`angular-components.md`](angular-components.md) (effects, DI/providers, control flow) · [`guiding-principles.md`](guiding-principles.md) (YAGNI/KISS + disciplina de operadores RxJS).

---

## Principio: servicios + signals + RxJS, sin NgRx

Cuentoneta **no usa NgRx**. El estado vive en **servicios**, se expone como **signals** y se compone/orquesta con **RxJS**. Las reglas "signals-first" se adoptan como **principio de diseño**, no a través del mecanismo `rxMethod` / Signal Store (eso es la dirección futura — ver la sección final).

Dónde viven los servicios de estado:

- **`@Injectable({ providedIn: 'root' })`** para estado/acceso a datos de aplicación (singleton). Ej.: `LayoutService`, `StoryService`, `StorylistService`, `ContentService` en [`src/app/providers/`](../../src/app/providers/).
- **`@Injectable()` provisto en un componente** cuando el estado es local a un subárbol y debe morir con él. Ej.: `CarouselStateService`, provisto en el `providers` del componente de carousel.

> Los servicios de acceso a datos del frontend viven en `src/app/providers/` _(en migración al patrón `provideX()` / `*.provider.ts` — ver #1499)_.

---

## Reglas (con anclajes en el código)

### 1. Sin promesas sobre observables

**Prohibido** `firstValueFrom`, `lastValueFrom`, `toPromise` y `async/await` sobre observables en el frontend (restricción dura de `CLAUDE.md`). Se compone con **operadores RxJS** y se cruza a signals con `rxResource` / `toSignal`.

```typescript
// ✅ Correcto — el HTTP queda como Observable y se consume vía un rxResource (story.component.ts).
// En componentes de página se usa el wrapper `ssrBlockingRxResource` (ver §7), no `rxResource` crudo.
readonly storyResource = ssrBlockingRxResource({
	params: this.slug,
	stream: ({ params }) => this.storyService.getBySlug(params),
	defaultValue: undefined,
});

// ❌ Incorrecto — convierte el observable en promesa
const story = await firstValueFrom(this.storyService.getBySlug(slug));
```

El servicio de datos devuelve **siempre `Observable<T>`**, nunca `Promise<T>`:

```typescript
// story.service.ts
public getBySlug(slug: string): Observable<Story> {
	return this.http.get<Story>(`${this.url}/${slug}`);
}
```

### 2. Derivar con `computed()` / `toSignal()` — nunca duplicar estado

Los valores derivados son **`computed`** (o `toSignal` para fuentes observables), **jamás** estado guardado que haya que sincronizar a mano.

```typescript
// ✅ Correcto — todo lo derivado cuelga de un único origen (story.component.ts)
readonly story = computed(() => this.storyResource.value());
readonly sharingRoute = computed(() => `${AppRoutes.Story}/${this.story()?.slug}`);
readonly shareMessage = computed(
	() => `Leí "${this.story()?.title}" de ${this.story()?.author.name} en La Cuentoneta ...`,
);

// ❌ Incorrecto — segundo signal que hay que mantener en sync a mano
readonly sharingRoute = signal('');
// ...y luego un effect/set por cada cambio de story → estado duplicado
```

> **Leer el valor = invocar el signal**, también en condiciones y expresiones: `resources().length`, no `resources.length` (esto último lee `Function.length`, un bug silencioso). En **código TS** lo enforcea `@angular-eslint/no-uncalled-signals` (typed-linting, sobre `src/**/*.ts`). **No** cubre plantillas — ese punto ciego se documenta en [`angular-components.md`](./angular-components.md).

### 3. Mutaciones con `signal.set()` / `signal.update()` en servicios

El estado mutable vive como `signal(...)` **privado** dentro del servicio; se muta solo con `set()` / `update()` y se expone **de solo lectura** con `asReadonly()`.

```typescript
// ✅ Correcto — patrón writable-privado / readonly-público (carousel-state.service.ts)
@Injectable()
export class CarouselStateService {
	private readonly _activeIndex = signal(0);
	private readonly _isTransitioning = signal(false);

	// Signals públicas de solo lectura
	readonly activeIndex: Signal<number> = this._activeIndex.asReadonly();
	readonly isTransitioning: Signal<boolean> = this._isTransitioning.asReadonly();

	selectSlide(index: number, direction: 'left' | 'right'): void {
		if (this._isTransitioning() || index === this._activeIndex()) return;
		this._isTransitioning.set(true);
		this._activeIndex.set(index);
	}
}
```

Esto mantiene el control de las transiciones de estado dentro del servicio: los componentes **leen** la signal de solo lectura y **piden** mutaciones vía métodos (`next()`, `prev()`, `selectSlide()`), nunca escribiendo el estado directamente.

### 4. `switchMap` como aplanado por defecto

Para encadenar una emisión (un input, un cambio de ruta) a un request, el **operador de aplanado por defecto es `switchMap`**: cancela el request en vuelo cuando llega una emisión nueva, evitando respuestas obsoletas pisando estado más reciente.

```typescript
// ✅ Correcto — switchMap cancela el fetch anterior cuando cambia el slug
slug$.pipe(switchMap((slug) => this.storyService.getBySlug(slug)));

// ❌ Incorrecto — mergeMap deja correr todos: una respuesta vieja puede ganar la carrera
slug$.pipe(mergeMap((slug) => this.storyService.getBySlug(slug)));
```

Usar `concatMap` / `exhaustMap` solo cuando la semántica lo exija (preservar orden, ignorar mientras hay uno en curso) y dejarlo justificado. Ver la disciplina de operadores en [`guiding-principles.md`](guiding-principles.md).

### 5. Debounce / coordinación centralizados en servicios

El throttle/debounce, el merge de fuentes de eventos y la coordinación de estado viven **en el servicio**, no esparcidos por los componentes. El componente solo consume el resultado ya coordinado.

```typescript
// ✅ Correcto — LayoutService centraliza el throttle y el merge de eventos (layout.service.ts)
private _userHasScrolled$ = fromEvent(this.window, 'scroll').pipe(
	takeUntilDestroyed(),
	throttleTime(25),
	map(() => this.window?.scrollY),
	filter((scrollAmount) => scrollAmount > 400),
	pairwise(),
	map(([y1, y2]) => (y2 < y1 ? Direction.Up : Direction.Down)),
	distinctUntilChanged(),
);

private _viewportHasChanged$ = merge(
	fromEvent(this.window, 'resize').pipe(startWith(null)),
	fromEvent(this.window, 'orientationchange').pipe(startWith(null)),
).pipe(takeUntilDestroyed(), throttleTime(100));
```

El componente que lo consume no repite el `throttleTime` ni el `merge`: inyecta `LayoutService` y se suscribe (con `takeUntilDestroyed`) o lo lleva a signal.

### 6. Errores tipados por operación

Preferir un estado de error **por operación** a un único `string | null` compartido entre todas las operaciones del servicio. Cada lectura/mutación expone su propio estado de error/carga, de modo que la UI distingue qué falló. Con `rxResource` esto sale del propio recurso (`.status()` / `.error()` por recurso); con observables crudos, modelar un signal de error por operación, no un campo global del servicio.

> La regla base para los **errores atrapados** —preservar la causa (ESLint `preserve-caught-error`) y tipar el error por operación— es una restricción dura: ver la fila _Errores atrapados_ en [`CLAUDE.md` → Restricciones duras](../../CLAUDE.md#restricciones-duras-hard-constraints).

### 7. Recursos de página: bloquear el SSR con `ssrBlockingRxResource`

En **componentes de página** (`src/app/pages/**`), los recursos que alimentan contenido indexable o meta tags por página se declaran con **`ssrBlockingRxResource`** (de [`@utils/ssr-resource`](../../src/app/utils/ssr-resource.ts)), no con `rxResource` crudo. El helper pipea el stream por `pendingUntilEvent`: registra una `PendingTask` que hace esperar la serialización del SSR (`ApplicationRef.whenStable()`) hasta que el fetch emite, completa o falla. Sin él, el server emite el skeleton con meta genérico y Google indexa una página vacía (#1704). En el browser no afecta el render, solo retrasa `isStable`, así que la carga progresiva in-app se conserva.

Para **datos secundarios o no indexables** que deben seguir cargando progresivamente (p. ej. el listado de cuentos de un autor, o los frames de navegación), usar **`progressiveRxResource`** — un alias explícito de `rxResource` que documenta que el no-bloqueo es una decisión, no un olvido.

```typescript
// ✅ Página: el perfil bloquea el SSR; el listado secundario carga progresivamente (author.component.ts)
readonly authorResource = ssrBlockingRxResource({
	params: this.slug,
	stream: ({ params }) => this.authorService.getBySlug(params),
	defaultValue: undefined,
});
readonly storiesResource = progressiveRxResource({
	params: this.slug,
	stream: ({ params }) => this.stories$(params),
	defaultValue: [],
});
```

Cuándo **bloquear**: rutas cuyo HTML server-rendered debe traer contenido/meta reales — `RenderMode.Server` indexables y `Prerender` con contenido (el prerender de build gana contenido real en vez de skeleton). Cuándo **no**: rutas `noindex` servidas por request con meta estáticos (bloquear solo agrega latencia sin ganar indexación → `progressiveRxResource`), y datos secundarios.

**Enforced por lint:** en `src/app/pages/**` está prohibido `rxResource`/`httpResource` crudo — el gate `lint` obliga a elegir `ssrBlockingRxResource` o `progressiveRxResource` (`no-restricted-syntax`, bloque `ssr-fetch-must-decide-blocking` de `eslint.config.mjs`; #1705).

### 8. Directivas de SEO de página: declarar el combo según la indexabilidad

Cada componente de página compone su SEO en el campo **`hostDirectives`** del decorador `@Component` (distinto de `host`, ver [`angular-components.md`](angular-components.md#host-element)). Hay exactamente **dos formas**, elegidas según si la ruta es indexable:

- **Página indexable** (`RenderMode.Server`/`Prerender` sin `noindex`): `hostDirectives: [<Page>MetaTagsDirective, <Page>StructuredDataDirective]`. Ambas extienden `AbstractMetaTagsDirective`/`AbstractStructuredDataDirective`; la `<Page>MetaTagsDirective` emite `setRobots('index, follow')` y la `<Page>StructuredDataDirective` inyecta el JSON-LD. Ejemplos: `home`, `author`, `story`, `storylist`.
- **Página no indexable** (`noindex`): `hostDirectives: [HeadMetadataDirective]` (la directiva genérica, sin structured data) y el componente llama `setRobots('noindex, ...')` en su constructor. Ejemplos: `about`, `authors`, `stories`, `dmca`. La ausencia de structured data acá es intencional, no un hueco.

Una página indexable **nunca** debe usar la forma no indexable: quedaría sin structured data y sin `setRobots('index...')` de forma silenciosa.

**Enforced por test:** el gate `test` corre `src/app/pages/seo-host-directives.spec.ts` (#1726), que descubre las páginas desde `app.routes.server.ts` (rutas `Server`/`Prerender`) resolviendo su fuente vía el `loadComponent` de `app.routes.ts`, y deriva la indexabilidad del propio código: una página que llama `setRobots('noindex...')` solo debe declarar `[HeadMetadataDirective]`; cualquier otra se considera indexable y debe declarar el combo MetaTags + StructuredData. No hay registro que mantener ni imports de componentes: una página nueva se chequea automáticamente y **rompe el test** si es indexable sin structured data (para saltearse el combo hay que emitir un `noindex` real, visible en el diff).

---

## Checklist rápido

- [ ] ¿El estado vive en un **servicio** (`providedIn: 'root'` o provisto en el componente), no en propiedades estáticas?
- [ ] ¿Lo derivado es `computed()` / `toSignal()` y **no** un signal duplicado sincronizado a mano?
- [ ] ¿El estado mutable es un signal **privado** expuesto con `asReadonly()` y mutado solo con `set()`/`update()`?
- [ ] ¿Cero `firstValueFrom` / `lastValueFrom` / `toPromise` / `async-await` sobre observables?
- [ ] ¿El aplanado por defecto es `switchMap` (y cualquier otro está justificado)?
- [ ] ¿El debounce/throttle/coordinación está en el servicio, no en el componente?
- [ ] ¿Los errores están tipados por operación, no en un `string | null` global?
- [ ] ¿Los recursos de página que alimentan contenido/meta indexable usan `ssrBlockingRxResource`, y los secundarios/`noindex` usan `progressiveRxResource` (nunca `rxResource` crudo en `pages/**`)?
- [ ] ¿La página declara sus `hostDirectives` de SEO según su indexabilidad (indexable: MetaTags + StructuredData; no indexable/`noindex`: HeadMetadataDirective + `setRobots('noindex...')`)? Lo verifica automáticamente `seo-host-directives.spec.ts`.

---

## Dirección futura: NgRx Signal Store (no adoptado)

La paridad con el starter contempla adoptar **NgRx Signal Store** (`@ngrx/signals` + `rxMethod`) para encapsular estado, mutaciones y efectos de forma declarativa. Esa adopción es el issue **#1530**.

**Hasta que #1530 se implemente, rige todo lo de arriba** (servicios + signals + RxJS) y **no se genera código NgRx** (`signalStore`, `withState`, `withMethods`, `rxMethod`, etc.) salvo que el propio issue lo indique. No introducir `@ngrx/signals` como dependencia ni anticipar su API en código nuevo.
