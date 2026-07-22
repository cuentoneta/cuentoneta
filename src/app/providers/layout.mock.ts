import { signal, type WritableSignal } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { Viewport, compareViewports } from '@utils/screen.utils';
import { Direction, LayoutService } from './layout.interface';

/**
 * Doble de test de `LayoutService`. Se califica `Controllable*` —no `InMemory*`— porque no sustituye
 * almacenamiento sino el **entorno del navegador**: el viewport lo fija el test con `simulateViewport()`
 * en vez de derivarlo de `window` como hace el real (`WindowLayoutService`).
 *
 * `implements LayoutService` obliga a cubrir la superficie completa del contrato; su `biggerThan`/
 * `smallerThan`/`isActual` delegan en la misma `compareViewports()` que el real, así que su
 * comportamiento —incluido el error ante un viewport inválido— es idéntico por construcción.
 */
// Sin `@Injectable`: no tiene dependencias inyectadas y se instancia a mano (`new`) para proveerlo con
// `useValue` en los specs. No es un servicio del árbol de DI.
export class ControllableLayoutService implements LayoutService {
	private readonly viewport: WritableSignal<Viewport> = signal('lg');

	public readonly isHeaderVisible = signal(true);

	// Streams inertes: el doble controla estado puntual, no simula flujos de scroll/resize. Ningún
	// consumidor los lee sobre el doble; tipan el contrato y nada más.
	public readonly userHasScrolled$: Observable<Direction> = EMPTY;
	public readonly viewportHasChanged$: Observable<Event | null> = EMPTY;

	public isPlatformBrowser(): boolean {
		return true;
	}

	public isPlatformServer(): boolean {
		return false;
	}

	/** Operación del **contrato**: en el real detecta el viewport desde `window`; el doble no tiene entorno que detectar. */
	public setViewport(): void {
		// no-op: el viewport del doble se fija con `simulateViewport()`, no se detecta.
	}

	/** Operación **propia del doble** (fuera del contrato): fija el viewport que el test quiere simular. */
	public simulateViewport(viewport: Viewport): void {
		this.viewport.set(viewport);
	}

	public biggerThan(test: Viewport): boolean {
		return compareViewports(this.viewport(), test) > 0;
	}

	public smallerThan(test: Viewport): boolean {
		return compareViewports(this.viewport(), test) < 0;
	}

	public isActual(test: Viewport): boolean {
		return compareViewports(this.viewport(), test) === 0;
	}
}
