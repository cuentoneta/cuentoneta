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

	/** Abre el diálogo y dispara el slide-in después de un frame (para que el navegador aplique primero el estado cerrado). */
	public open(element: HTMLDialogElement): void {
		element.showModal();
		requestAnimationFrame(() => this._isTransitionedIn.set(true));
	}

	/** Dispara la transición de salida y llama a `onComplete` recién después de `transitionend`. */
	public close(element: HTMLDialogElement, onComplete: () => void): void {
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
