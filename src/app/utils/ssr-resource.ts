import { inject, Injector, type ResourceRef } from '@angular/core';
import { pendingUntilEvent, rxResource, type RxResourceOptions } from '@angular/core/rxjs-interop';

/**
 * Envuelve `rxResource` piping el stream por `pendingUntilEvent`, para que el fetch bloquee la
 * estabilización del SSR hasta el primer emit (contenido + meta tags server-rendered). En el browser
 * no afecta el skeleton: la app ya está estable, así que el recurso muestra su `defaultValue` mientras carga.
 *
 * Es el reemplazo zoneless del viejo `FetchContentDirective` (Zone.js macrotask) que se perdió en #1144.
 * En páginas es obligatorio usar este helper o `progressiveRxResource` — ver la regla de lint en pages.
 */
export function ssrBlockingRxResource<T, R>(
	options: RxResourceOptions<T, R> & { defaultValue: NoInfer<T> },
): ResourceRef<T>;
export function ssrBlockingRxResource<T, R>(options: RxResourceOptions<T, R>): ResourceRef<T | undefined>;
export function ssrBlockingRxResource<T, R>(options: RxResourceOptions<T, R>): ResourceRef<T | undefined> {
	const injector = inject(Injector);
	return rxResource<T, R>({
		...options,
		stream: (params) => options.stream(params).pipe(pendingUntilEvent(injector)),
	});
}

/**
 * Recurso que NO bloquea el SSR: la carga sale como skeleton en el HTML server-rendered y resuelve en cliente.
 * Es el opt-out explícito de `ssrBlockingRxResource` — usalo solo para datos secundarios/no indexables
 * (p. ej. el listado de cuentos de un autor) y justificá por qué no necesita estar en el HTML inicial.
 */
export const progressiveRxResource = rxResource;
