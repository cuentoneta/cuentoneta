// TODO(#1494): eliminar este stub al migrar a Vitest. Su browser mode provee un IntersectionObserver
// real, lo que permitiría testear el recorte con layout real en vez de simular el callback a mano.
//
// Stub de IntersectionObserver para tests (jsdom no lo implementa). Captura el callback del observer y
// las opciones con que se creó, y permite simular que ciertos elementos entran o no en el contenedor.
let callback: IntersectionObserverCallback | undefined;
let options: IntersectionObserverInit | undefined;

class IntersectionObserverStub {
	constructor(cb: IntersectionObserverCallback, init?: IntersectionObserverInit) {
		callback = cb;
		options = init;
	}
	observe(): void {
		return;
	}
	disconnect(): void {
		return;
	}
}

/** Instala el stub como `IntersectionObserver` global y resetea el estado. Llamar en `beforeEach`. */
export function installIntersectionObserverStub(): void {
	(globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = IntersectionObserverStub;
	callback = undefined;
	options = undefined;
}

/** Simula que los elementos quedaron fuera del contenedor (no entran). */
export function markOutsideViewport(...elements: Element[]): void {
	callback?.(
		elements.map((target) => ({ target, intersectionRatio: 0 }) as IntersectionObserverEntry),
		{} as IntersectionObserver,
	);
}

/** Simula que los elementos volvieron a entrar completos en el contenedor. */
export function markInsideViewport(...elements: Element[]): void {
	callback?.(
		elements.map((target) => ({ target, intersectionRatio: 1 }) as IntersectionObserverEntry),
		{} as IntersectionObserver,
	);
}

/** Opciones con que se creó el último observer (p. ej. para inspeccionar el `rootMargin`). */
export function lastObserverOptions(): IntersectionObserverInit | undefined {
	return options;
}
