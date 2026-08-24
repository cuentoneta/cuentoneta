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

	/** Frame diferido de la apertura; `null` una vez que corrió o fue cancelado por un cierre temprano. */
	private pendingEntryFrame: number | null = null;

	/** Abre el diálogo y dispara el slide-in después de un frame (para que el navegador aplique primero el estado cerrado). */
	public open(element: HTMLDialogElement): void {
		element.showModal();
		this.pendingEntryFrame = requestAnimationFrame(() => {
			this.pendingEntryFrame = null;
			this._isTransitionedIn.set(true);
		});
	}

	/**
	 * Dispara la transición de salida y llama a `onComplete` recién después de `transitionend`. Si la apertura
	 * todavía no asentó (frame diferido pendiente), cierra de forma síncrona: la salida no tendría transición que
	 * esperar —el estado de entrada ya era `false`—, y dejar el frame vivo reabriría el panel tras el cierre.
	 */
	public close(element: HTMLDialogElement, onComplete: () => void): void {
		if (this.pendingEntryFrame !== null) {
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
