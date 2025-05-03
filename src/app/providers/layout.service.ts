import { inject, Injectable, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { WINDOW } from './window';
import {
	combineLatest,
	distinctUntilChanged,
	filter,
	fromEvent,
	map,
	merge,
	pairwise,
	startWith,
	throttleTime,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Viewport, VIEWPORT_WIDTHS_NUMERIC } from '@utils/screen.utils';

export const Direction = Object.freeze({
	Up: 'Up',
	Down: 'Down',
});

@Injectable({
	providedIn: 'root',
})
export class LayoutService {
	private window = inject(WINDOW);
	private platformId = inject(PLATFORM_ID);

	private viewport: WritableSignal<Viewport> = signal('xl');

	private _userHasScrolled$ = fromEvent(this.window, 'scroll').pipe(
		takeUntilDestroyed(),
		throttleTime(25),
		map(() => this.window?.scrollY),
		filter((scrollAmount) => scrollAmount > 400),
		pairwise(),
		map(([y1, y2]) => (y2 < y1 ? Direction.Up : Direction.Down)),
		distinctUntilChanged(),
	);

	/**
	 * Observable que se dispara cuando ocurre un cambio de orientación de pantalla
	 * o se recalcula el tamaño de pantalla asignado al navegador en el dispositivo.
	 * @private
	 */
	private _viewportHasChanged$ = merge(
		fromEvent(this.window, 'resize').pipe(startWith(null)),
		fromEvent(this.window, 'orientationchange').pipe(startWith(null)),
	).pipe(takeUntilDestroyed(), throttleTime(100));

	get userHasScrolled$() {
		return this._userHasScrolled$;
	}

	get viewportHasChanged$() {
		return this._viewportHasChanged$;
	}

	get isHeaderVisible$() {
		return combineLatest([this.viewportHasChanged$, this.userHasScrolled$]).pipe(
			map(([hasChanged, direction]) => {
				if (hasChanged) {
					this.setViewport();
				}

				return this.biggerThan('xs') || direction === Direction.Up;
			}),
		);
	}

	constructor() {
		this.setViewport();
	}

	/**
	 * Wrappers a las funciones nativas de Angular para detectar
	 * si el código se está ejecutando en el navegador o en el servidor.
	 * Se usan estos wrappers en vez de las implementaciones nativas
	 * a fin de permitir evaluar casos de pruebas unitarias variadas.
	 */
	isPlatformBrowser() {
		return isPlatformBrowser(this.platformId);
	}

	isPlatformServer() {
		return isPlatformServer(this.platformId);
	}

	setViewport() {
		// Para SSR, siempre devolver md dado que no se puede acceder a window
		if (this.isPlatformServer()) {
			this.viewport.set('md');
			return;
		}

		const breakpoints = [
			{ viewport: 'xs', maxWidth: VIEWPORT_WIDTHS_NUMERIC.sm - 1 },
			{ viewport: 'sm', maxWidth: VIEWPORT_WIDTHS_NUMERIC.md - 1 },
			{ viewport: 'md', maxWidth: VIEWPORT_WIDTHS_NUMERIC.lg - 1 },
			{ viewport: 'lg', maxWidth: VIEWPORT_WIDTHS_NUMERIC.xl - 1 },
			{ viewport: 'xl', maxWidth: Infinity },
		];

		const match = breakpoints.find((bp) => this.window.innerWidth <= bp.maxWidth);
		const currentViewport = (match?.viewport || 'md') as Viewport;

		// Actualizar el signal con el viewport actual
		this.viewport.set(currentViewport);
	}

	/**
	 * Chequea si el viewport actual es mayor al viewport de test
	 * @param viewport
	 * @param test
	 */
	biggerThan(test: Viewport): boolean {
		const currentWidth = VIEWPORT_WIDTHS_NUMERIC[this.viewport()];
		const testWidth = VIEWPORT_WIDTHS_NUMERIC[test];

		if (currentWidth === undefined || testWidth === undefined) {
			throw new Error(`Viewport inválido: ${test}`);
		}

		return currentWidth > testWidth;
	}

	/**
	 * Chequea si el viewport actual es menor al viewport de test
	 * @param viewport
	 * @param test
	 */
	smallerThan(test: Viewport): boolean {
		const currentWidth = VIEWPORT_WIDTHS_NUMERIC[this.viewport()];
		const testWidth = VIEWPORT_WIDTHS_NUMERIC[test];

		if (currentWidth === undefined || testWidth === undefined) {
			throw new Error(`Viewport inválido: ${test}`);
		}

		return currentWidth < testWidth;
	}

	isActual(test: Viewport): boolean {
		const currentWidth = VIEWPORT_WIDTHS_NUMERIC[this.viewport()];
		const testWidth = VIEWPORT_WIDTHS_NUMERIC[test];

		if (currentWidth === undefined || testWidth === undefined) {
			throw new Error(`Viewport inválido: ${test}`);
		}

		return currentWidth === testWidth;
	}
}
