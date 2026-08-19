// Doble controlable de `document.fonts` para tests: el entorno de tests no lo expone, y el caso "la
// fuente carga tarde y cambia la altura del texto" tiene que ser afirmable.
//
// Sustituye un entorno, no un almacenamiento, así que sigue la taxonomía `Controllable*`: el spec
// decide cuándo la carga de fuentes termina, en vez de esperar a que ocurra.
let resolveReady: (() => void) | undefined;

/**
 * Instala `document.fonts` con una promesa `ready` pendiente hasta que el spec la resuelva.
 *
 * No hace nada sin `document`: los specs de `tools/` corren en entorno Node y comparten este setup.
 */
export function installDocumentFontsStub(): void {
	if (typeof document === 'undefined') {
		return;
	}

	const ready = new Promise<void>((resolve) => {
		resolveReady = resolve;
	});

	Object.defineProperty(document, 'fonts', {
		value: { ready },
		configurable: true,
	});
}

/** Resuelve la carga de fuentes, como haría el navegador al terminar de aplicarlas. */
export async function resolveFontsReady(): Promise<void> {
	resolveReady?.();
	// Cede el turno para que las continuaciones encoladas sobre `ready` corran antes de asertar.
	await Promise.resolve();
}
