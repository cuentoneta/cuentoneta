// Stub global de ResizeObserver para tests. happy-dom trae un constructor que no hace nada, así que un
// componente que lo use igual se renderiza: este stub no está para eso, sino para el control que ni el
// no-op ni un observer real dan — qué elementos están observados, cuándo se entrega el callback y
// cuántos observers siguen conectados.
//
// El entorno de tests no computa layout, así que las medidas darían todas cero y ningún resize ocurre.
// Estos helpers sustituyen ese entorno: `setMeasuredSize` fija el alto real y el visible de un elemento,
// y `triggerResize` entrega el callback de forma síncrona.
let observers: ResizeObserverStub[] = [];

class ResizeObserverStub {
	private readonly targets: Element[] = [];
	private connected = true;

	constructor(private readonly callback: ResizeObserverCallback) {
		observers.push(this);
	}

	// Un ResizeObserver real entrega una primera medición al empezar a observar, sin esperar a que
	// nada cambie de tamaño. Es el camino por el que una directiva obtiene su valor inicial, así que
	// el stub lo reproduce: sin esto, ningún test cubriría esa entrega.
	public observe(target: Element): void {
		this.targets.push(target);
		this.deliver();
	}

	public unobserve(target: Element): void {
		const index = this.targets.indexOf(target);
		if (index !== -1) {
			this.targets.splice(index, 1);
		}
	}

	public disconnect(): void {
		this.connected = false;
		this.targets.length = 0;
	}

	public isConnected(): boolean {
		return this.connected;
	}

	public deliver(): void {
		if (!this.connected || this.targets.length === 0) {
			return;
		}
		const entries = this.targets.map((target) => ({ target }) as ResizeObserverEntry);
		this.callback(entries, this as unknown as ResizeObserver);
	}
}

/** Instala el stub como `ResizeObserver` global y resetea el estado capturado. */
export function installResizeObserverStub(): void {
	(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub;
	observers = [];
}

/**
 * Fija el alto del contenido y el alto visible de un elemento, que el entorno de tests deja en cero.
 * Un `scrollHeight` mayor que el `clientHeight` es lo que una directiva de recorte lee como desborde.
 */
export function setMeasuredSize(element: Element, size: { scrollHeight: number; clientHeight: number }): void {
	Object.defineProperty(element, 'scrollHeight', { value: size.scrollHeight, configurable: true });
	Object.defineProperty(element, 'clientHeight', { value: size.clientHeight, configurable: true });
}

/** Entrega el callback de los observers todavía conectados, como haría un resize real. */
export function triggerResize(): void {
	for (const observer of observers) {
		observer.deliver();
	}
}

/**
 * Cuántos observers siguen conectados. Es lo que permite afirmar que una directiva desconecta el suyo
 * al destruirse: un observer que sobrevive a su host sigue escribiendo estado sobre una vista muerta.
 */
export function activeObserverCount(): number {
	return observers.filter((observer) => observer.isConnected()).length;
}
