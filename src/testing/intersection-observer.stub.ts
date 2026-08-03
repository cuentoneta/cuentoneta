// Stub global de IntersectionObserver para tests (el entorno de tests no lo implementa). Se instala en
// test-setup para que `TagsOverflowDirective` —hoy el único consumidor de IO— se pueda renderizar.
// Captura el callback y las opciones del último observer creado, y expone helpers para simular que
// ciertos elementos entran o no en el contenedor.
//
// El browser mode de Vitest no lo jubila: proveería el IO real, pero no la superficie de control que
// estos tests necesitan. `lastObserverOptions()` afirma sobre el `rootMargin` con que se construyó el
// observer, que un IO real no expone de vuelta, y los helpers deciden qué elemento cruza el borde de
// forma síncrona. Con un IO real haría falta layout y fuentes reales, y la entrega asíncrona del
// callback, para testear justamente el recorte por ancho.
let callback: IntersectionObserverCallback | undefined;
let options: IntersectionObserverInit | undefined;

class IntersectionObserverStub {
	constructor(cb: IntersectionObserverCallback, init?: IntersectionObserverInit) {
		callback = cb;
		options = init;
	}
	public observe(): void {
		return;
	}
	public unobserve(): void {
		return;
	}
	public disconnect(): void {
		return;
	}
	public takeRecords(): IntersectionObserverEntry[] {
		return [];
	}
}

/** Instala el stub como `IntersectionObserver` global y resetea el estado capturado. */
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
