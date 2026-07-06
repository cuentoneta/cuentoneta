import { inject, Injector, type ResourceRef } from '@angular/core';
import { pendingUntilEvent, rxResource, type RxResourceOptions } from '@angular/core/rxjs-interop';

/**
 * `rxResource` cuyo stream se pipea por `pendingUntilEvent`: registra una `PendingTask` que hace
 * esperar a `ApplicationRef.whenStable()` (lo que `@angular/ssr` aguarda antes de serializar) hasta
 * que el stream emite, completa, falla o se desuscribe. Así el SSR y el prerender de build sirven
 * contenido + meta tags reales en vez del skeleton genérico, y un fetch que falla libera el bloqueo
 * en vez de colgar la serialización. En el browser no bloquea el render, solo retrasa `isStable`,
 * por lo que la carga progresiva in-app se conserva.
 *
 * Reemplazo zoneless de `FetchContentDirective` → `MacroTaskWrapperService` (macrotask de Zone.js),
 * perdido en la migración a signals/zoneless (#1144).
 *
 * El `Injector` se captura acá y se pasa explícito a `pendingUntilEvent`: el callback `stream()`
 * corre fuera del contexto de inyección (se invoca al disparar el fetch, no en el field initializer),
 * donde un `pendingUntilEvent()` sin argumento fallaría con NG0203.
 */
export function ssrBlockingRxResource<T, R>(
	options: RxResourceOptions<T, R> & { defaultValue: NoInfer<T> },
): ResourceRef<T>;
export function ssrBlockingRxResource<T, R>(options: RxResourceOptions<T, R>): ResourceRef<T | undefined>;
export function ssrBlockingRxResource<T, R>(options: RxResourceOptions<T, R>): ResourceRef<T | undefined> {
	const injector = options.injector ?? inject(Injector);
	return rxResource<T, R>({
		...options,
		stream: (params) => options.stream(params).pipe(pendingUntilEvent(injector)),
	});
}

/**
 * Opt-out explícito del bloqueo de SSR: alias directo de `rxResource` para datos secundarios o no
 * indexables (p. ej. el listado de cuentos de un autor), que se sirven como skeleton y resuelven en
 * el cliente.
 */
export const progressiveRxResource = rxResource;
