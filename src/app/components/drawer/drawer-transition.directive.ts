import { Directive, signal } from '@angular/core';

/**
 * Orquesta la transición de entrada/salida del drawer. Expone `isTransitionedIn` como signal para que
 * `DrawerComponent` maneje el atributo `data-open` de forma declarativa en la plantilla; solo el timing de
 * pintado (`requestAnimationFrame`) y el fin de la transición CSS (`transitionend`) se manejan de forma
 * imperativa, porque son Web APIs sin equivalente reactivo. Se aplica como `hostDirective` de `DrawerComponent`.
 */
@Directive({})
export class DrawerTransitionDirective {
	private readonly _isTransitionedIn = signal(false);
	public readonly isTransitionedIn = this._isTransitionedIn.asReadonly();

	private pendingEntryFrame: number | null = null;

	/** Abre el diálogo y dispara el slide-in después de un frame (para que el navegador aplique primero el estado cerrado). */
	public open(element: HTMLDialogElement): void {
		element.showModal();
		this.pendingEntryFrame = requestAnimationFrame(() => {
			this.pendingEntryFrame = null;
			this._isTransitionedIn.set(true);
		});
	}

	/** Dispara la salida y llama a `onComplete` al terminar; válido en cualquier instante posterior a `open()`. */
	public close(element: HTMLDialogElement, onComplete: () => void): void {
		if (!element.open) {
			onComplete();
			return;
		}
		if (this.pendingEntryFrame !== null) {
			// La entrada aún no asentó: no hay transición que esperar y el frame vivo reabriría el panel.
			cancelAnimationFrame(this.pendingEntryFrame);
			this.pendingEntryFrame = null;
			element.close();
			onComplete();
			return;
		}
		this._isTransitionedIn.set(false);
		const handler = (event: Event): void => {
			if (event.target !== element) {
				return;
			}
			element.removeEventListener('transitionend', handler);
			element.close();
			onComplete();
		};
		element.addEventListener('transitionend', handler);
	}
}
