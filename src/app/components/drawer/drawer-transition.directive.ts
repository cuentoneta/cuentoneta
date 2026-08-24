import { Directive, signal } from '@angular/core';

/** Handle centinela de "sin frame pendiente": `cancelAnimationFrame` lo descarta sin efecto (spec WHATWG). */
const NO_PENDING_FRAME = -1;

/**
 * Fase del drawer al momento de pedir un cierre. `alreadyClosed`: el diálogo ya está cerrado (cierre
 * idempotente). `entryPending`: la apertura difirió su estado un frame y ese frame sigue vivo. `settled`:
 * la entrada asentó y hay transición que orquestar para la salida.
 */
type DrawerClosePhase = 'alreadyClosed' | 'entryPending' | 'settled';

type DrawerCloseStrategy = (element: HTMLDialogElement, onComplete: () => void) => void;

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

	/** Handle del frame diferido de la apertura; `NO_PENDING_FRAME` cuando no hay ninguno pendiente. */
	private pendingEntryFrame = NO_PENDING_FRAME;

	// Estrategias de cierre indexadas por fase: el mapa hace exhaustivo el manejo de fases a nivel de
	// tipos (una fase nueva sin estrategia no compila) y reemplaza el branching por una lookup O(1).
	private readonly closeStrategies: Record<DrawerClosePhase, DrawerCloseStrategy> = {
		alreadyClosed: (_element, onComplete) => onComplete(),
		entryPending: (element, onComplete) => {
			cancelAnimationFrame(this.pendingEntryFrame);
			this.pendingEntryFrame = NO_PENDING_FRAME;
			element.close();
			onComplete();
		},
		settled: (element, onComplete) => {
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
		},
	};

	/** Abre el diálogo y dispara el slide-in después de un frame (para que el navegador aplique primero el estado cerrado). */
	public open(element: HTMLDialogElement): void {
		element.showModal();
		this.pendingEntryFrame = requestAnimationFrame(() => {
			this.pendingEntryFrame = NO_PENDING_FRAME;
			this._isTransitionedIn.set(true);
		});
	}

	/**
	 * Cierra el drawer con la estrategia de su fase vigente, y llama a `onComplete` al terminar. Es idempotente
	 * en cualquier instante posterior a `open()`: sobre un diálogo ya cerrado completa de una vez, sin apilar
	 * listeners; si la apertura todavía no asentó, cierra de forma síncrona —la salida no tendría transición que
	 * esperar, y dejar el frame vivo reabriría el panel tras el cierre—.
	 */
	public close(element: HTMLDialogElement, onComplete: () => void): void {
		this.closeStrategies[this.closePhaseOf(element)](element, onComplete);
	}

	private closePhaseOf(element: HTMLDialogElement): DrawerClosePhase {
		return !element.open ? 'alreadyClosed' : this.pendingEntryFrame === NO_PENDING_FRAME ? 'settled' : 'entryPending';
	}
}
