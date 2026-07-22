import { InjectionToken, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Viewport } from '@utils/screen.utils';

export const Direction = Object.freeze({ Up: 'Up', Down: 'Down' } as const);
export type Direction = (typeof Direction)[keyof typeof Direction];

// Contrato del layout/viewport. La implementación real (`WindowLayoutService`) lo deriva de `window`;
// el doble de test (`ControllableLayoutService`) fija el viewport a mano. El token homónimo deja cada
// `inject(LayoutService)` intacto y la interfaz es la superficie contra la cual el compilador exige
// paridad entre real y doble.
export interface LayoutService {
	// La cara pública de la visibilidad del header es el **signal**; el observable que lo alimenta es
	// un detalle de implementación privado del real (ver `WindowLayoutService`).
	readonly isHeaderVisible: Signal<boolean>;
	readonly userHasScrolled$: Observable<Direction>;
	readonly viewportHasChanged$: Observable<Event | null>;
	isPlatformBrowser(): boolean;
	isPlatformServer(): boolean;
	setViewport(): void;
	biggerThan(test: Viewport): boolean;
	smallerThan(test: Viewport): boolean;
	isActual(test: Viewport): boolean;
}

export const LayoutService = new InjectionToken<LayoutService>('LayoutService');
