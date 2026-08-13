// Stub global de ResizeObserver para tests (el entorno de tests no lo implementa). Se instala en
// test-setup para que las directivas que miden su host se puedan renderizar, y expone el control que un
// observer real no da: qué elementos están observados y cuándo se entrega el callback.
//
// El entorno de tests no computa layout, así que un ResizeObserver real nunca dispararía y las medidas
// darían todas cero. Estos helpers sustituyen ese entorno: `setMeasuredSize` fija el alto real y el
// visible de un elemento, y `triggerResize` entrega el callback de forma síncrona.
let callbacks: ResizeObserverCallback[] = [];
let observed: Element[] = [];

class ResizeObserverStub {
	constructor(callback: ResizeObserverCallback) {
		callbacks.push(callback);
	}
	public observe(target: Element): void {
		observed.push(target);
	}
	public unobserve(): void {
		return;
	}
	public disconnect(): void {
		return;
	}
}

/** Instala el stub como `ResizeObserver` global y resetea el estado capturado. */
export function installResizeObserverStub(): void {
	(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub;
	callbacks = [];
	observed = [];
}

/**
 * Fija el alto del contenido y el alto visible de un elemento, que el entorno de tests deja en cero.
 * Un `scrollHeight` mayor que el `clientHeight` es lo que una directiva de recorte lee como desborde.
 */
export function setMeasuredSize(element: Element, size: { scrollHeight: number; clientHeight: number }): void {
	Object.defineProperty(element, 'scrollHeight', { value: size.scrollHeight, configurable: true });
	Object.defineProperty(element, 'clientHeight', { value: size.clientHeight, configurable: true });
}

/** Entrega el callback de todos los observers creados, como haría un resize real. */
export function triggerResize(): void {
	const entries = observed.map((target) => ({ target }) as ResizeObserverEntry);
	for (const callback of callbacks) {
		callback(entries, {} as ResizeObserver);
	}
}
