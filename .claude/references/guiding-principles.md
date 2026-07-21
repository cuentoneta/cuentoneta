<!-- Fuente: CLAUDE.md | Última actualización: 2026-06-15 -->

# Principios rectores

> Adaptación para **La Cuentoneta** de los principios rectores del starter de referencia.
> La documentación va en **español**; el **código y los identificadores en inglés** (los comentarios pueden ir en español).

---

## YAGNI (You Aren't Gonna Need It)

**Agregá funcionalidad solo cuando se necesite de verdad, no para un uso futuro hipotético.**

**Hacer:**

- Implementar exactamente lo que pide el requerimiento actual
- Borrar código, parámetros y abstracciones que no se usan
- Cuestionar cada agregado del tipo "¿y si más adelante lo necesitamos?"

**No hacer:**

- Agregar parámetros "por flexibilidad"
- Crear clases abstractas para una única implementación
- Construir opciones de configuración que nadie pidió
- Agregar puntos de extensión "por las dudas"

**Test práctico:** si no podés nombrar un caso de uso concreto y actual para algo, no lo construyas.

---

## KISS (Keep It Simple, Stupid)

**Preferí soluciones simples antes que ingeniosas. La complejidad es un costo, no una funcionalidad.**

**Hacer:**

- Elegir primero el enfoque directo
- Usar funciones de la librería estándar antes que implementaciones propias
- Escribir código que una persona junior pueda entender
- Refactorizar cuando la complejidad crece

**No hacer:**

- Sobre-abstraer de forma prematura
- Usar patrones de diseño solo por usarlos
- Optimizar antes de medir
- Agregar capas sin un propósito claro

**Test práctico:** ¿podés explicar qué hace este código en una sola oración? Si no, simplificalo.

---

## Disciplina de operadores RxJS

**Usá cada operador para lo que está pensado. Los efectos colaterales van en `tap`; las transformaciones van en `map`.**

`map` es un operador de transformación pura: recibe un valor y devuelve un valor nuevo. Poner efectos colaterales (mutaciones de estado, logging, manipulación del DOM) dentro de `map` crea una dependencia oculta del momento de la suscripción. Si después el stream se multicastea, se reproduce (replay) o se compone con un operador que no se suscribe, el efecto colateral se dispara de más o no se dispara.

**Hacer:**

- Usar `tap` para efectos colaterales: actualizaciones de estado en un servicio (p. ej. `signal.set()` / `signal.update()`), logging, analytics
- Usar `map` exclusivamente para transformar valores: reformar datos, mapear DTOs/resultados de API al modelo de dominio
- Cuando hagan falta ambos, encadenarlos por separado: `map(transform)` y luego `tap(sideEffect)`

**No hacer:**

- Meter `signal.set()`, `signal.update()` u otra mutación dentro de `map`
- Hacer logging o tracking de analytics dentro de `map`
- Llamar métodos con efectos colaterales (HTTP, navegación) dentro de `map`

```typescript
// ✅ Correcto — transformación y efecto colateral separados
return this.storyService.getStoryBySlug(slug).pipe(
	map((response) => mapStory(response)),
	tap((story) => this.story.set(story)), // efecto colateral en tap
);

// ❌ Incorrecto — efecto colateral escondido en un operador puro
return this.storyService.getStoryBySlug(slug).pipe(
	map((response) => {
		const story = mapStory(response);
		this.story.set(story); // ¡efecto colateral dentro de map!
		return story;
	}),
);
```

**Test práctico:** si sacaras el `subscribe()`, ¿el operador seguiría teniendo sentido? `map` sí debería: es solo una transformación de datos. `tap` no debería: así sabés que el efecto colateral está en el lugar correcto.

---

## Operaciones async signals-first (sin promesas)

**El frontend es signals-first. Componé con operadores RxJS y no conviertas observables a promesas.**

El frontend de cuentoneta modela el estado con **servicios + signals + RxJS** (ver [`angular-state.md`](angular-state.md)). No hay NgRx Signal Store ni `rxMethod`: la coordinación async vive en **servicios Angular** (`providedIn: 'root'` o providers en `src/app/providers/`) que exponen observables y signals a los componentes.

**Hacer:**

- Componer las llamadas a la API en métodos de servicio con un pipe declarativo: `service.getX(params).pipe(map(mapper), tap(sideEffect), catchError(...))`
- Derivar valores con `computed()` / `toSignal()` en vez de mantener estado duplicado (p. ej. `totalPages` se deriva, no se guarda)
- Usar `switchMap` como operador de aplanado por defecto (cancela los requests en vuelo obsoletos); `concatMap` cuando el orden importa, `mergeMap` para concurrencia, `exhaustMap` para ignorar disparos mientras hay uno en curso
- Centralizar debounce/coordinación en servicios (p. ej. `LayoutService`), no esparcidos en los componentes
- Usar errores tipados por operación (p. ej. una signal de error por operación) en vez de un único `string | null` compartido
- Loguear los errores con contexto suficiente en cada handler (`catchError`)

**No hacer:**

- Usar `firstValueFrom`, `lastValueFrom` o `toPromise` para convertir observables a promesas (prohibido en el frontend — ver Restricciones duras en `CLAUDE.md`)
- Usar `async/await` sobre observables en métodos de servicio que llaman a la API
- Anidar `subscribe()` dentro de otro `subscribe()` — componer con operadores de orden superior (`switchMap`, `mergeMap`, `concatMap`, `exhaustMap`)
- Suscribirse manualmente cuando alcanza con `toSignal()` / el `async` pipe en la plantilla; cuando una suscripción manual es inevitable, atarla a `takeUntilDestroyed()`
- Mantener estado derivado como estado guardado: derivarlo con `computed()`
- Inventar signals contador/trigger (`reloadCounter`, `_reload`, `forceRefresh`) para forzar re-evaluación — son workarounds innecesarios que ensucian el estado; usá una llamada imperativa al método del servicio con el valor actual

```typescript
// ✅ Correcto — composición declarativa con switchMap, derivación con computed,
//              efectos colaterales en tap y sin promesas
@Injectable({ providedIn: 'root' })
export class StorylistService {
	private readonly api = inject(StorylistApi);
	private readonly stories = signal<Story[]>([]);

	readonly storyCount = computed(() => this.stories().length); // derivado, no guardado

	load(slug: string): Observable<Story[]> {
		return this.api.getStorylistBySlug(slug).pipe(
			map((raw) => raw.stories.map(mapStory)),
			tap((stories) => this.stories.set(stories)), // efecto colateral en tap
			catchError((err) => {
				this.logError('load', err);
				return of([]);
			}),
		);
	}
}
```

**Test práctico:** si un método de servicio tiene `async` en su firma o importa `firstValueFrom`/`toPromise`, hay que refactorizarlo a un pipe declarativo con operadores RxJS.

> **Dirección futura (paridad con el starter):** adoptar **NgRx Signal Store** (`@ngrx/signals` + `rxMethod` de `@ngrx/signals/rxjs-interop`) — ver **#1530**. Hasta esa adopción rige lo de arriba (servicios + signals/RxJS); **no** generar código NgRx (`rxMethod`/`patchState`/Signal Store) salvo que el issue lo indique.
