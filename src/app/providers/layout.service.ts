import {
	EnvironmentProviders,
	inject,
	Injectable,
	makeEnvironmentProviders,
	PLATFORM_ID,
	signal,
	type WritableSignal,
} from '@angular/core';
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
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Viewport, VIEWPORT_WIDTHS_NUMERIC } from '@utils/screen.utils';
import { Direction, LayoutService } from './layout.interface';

@Injectable({
	providedIn: 'root',
})
export class WindowLayoutService implements LayoutService {
	private readonly window = inject(WINDOW);
	private readonly platformId = inject(PLATFORM_ID);

	private readonly viewport: WritableSignal<Viewport> = signal('xl');

	private readonly _userHasScrolled$ = fromEvent(this.window, 'scroll').pipe(
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
	private readonly _viewportHasChanged$ = merge(
		fromEvent(this.window, 'resize').pipe(startWith(null)),
		fromEvent(this.window, 'orientationchange').pipe(startWith(null)),
	).pipe(takeUntilDestroyed(), throttleTime(100));

	public readonly isHeaderVisible = toSignal(this.isHeaderVisible$, { initialValue: true });

	public get userHasScrolled$() {
		return this._userHasScrolled$;
	}

	public get viewportHasChanged$() {
		return this._viewportHasChanged$;
	}

	public get isHeaderVisible$() {
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
	public isPlatformBrowser() {
		return isPlatformBrowser(this.platformId);
	}

	public isPlatformServer() {
		return isPlatformServer(this.platformId);
	}

	public setViewport(): void {
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

		this.viewport.set(currentViewport);
	}

	/**
	 * Chequea si el viewport actual es mayor al viewport de test
	 * @param test
	 */
	public biggerThan(test: Viewport): boolean {
		const currentWidth = VIEWPORT_WIDTHS_NUMERIC[this.viewport()];
		const testWidth = VIEWPORT_WIDTHS_NUMERIC[test];

		if (currentWidth === undefined || testWidth === undefined) {
			throw new Error(`Viewport inválido: ${test}`);
		}

		return currentWidth > testWidth;
	}

	/**
	 * Chequea si el viewport actual es menor al viewport de test
	 * @param test
	 */
	public smallerThan(test: Viewport): boolean {
		const currentWidth = VIEWPORT_WIDTHS_NUMERIC[this.viewport()];
		const testWidth = VIEWPORT_WIDTHS_NUMERIC[test];

		if (currentWidth === undefined || testWidth === undefined) {
			throw new Error(`Viewport inválido: ${test}`);
		}

		return currentWidth < testWidth;
	}

	public isActual(test: Viewport): boolean {
		const currentWidth = VIEWPORT_WIDTHS_NUMERIC[this.viewport()];
		const testWidth = VIEWPORT_WIDTHS_NUMERIC[test];

		if (currentWidth === undefined || testWidth === undefined) {
			throw new Error(`Viewport inválido: ${test}`);
		}

		return currentWidth === testWidth;
	}
}

export function provideLayout(): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: LayoutService, useExisting: WindowLayoutService }]);
}
