import type { Signal } from '@angular/core';
import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Viewport } from '@utils/screen.utils';

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

	// El encabezado pinta su fondo propio; mientras una banda de la página lo cubre, lo suelta. La
	// banda es la única que mide su geometría: se declara acá al montarse y lo suelta al desmontarse.
	readonly isHeaderOverBand: Signal<boolean>;
	setHeaderOverBand(isOverBand: boolean): void;

	isPlatformBrowser(): boolean;
	isPlatformServer(): boolean;
	setViewport(): void;
	biggerThan(test: Viewport): boolean;
	smallerThan(test: Viewport): boolean;
	isActual(test: Viewport): boolean;
}

export const LayoutService = new InjectionToken<LayoutService>('LayoutService');
