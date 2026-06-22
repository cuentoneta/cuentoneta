import { computed, inject, Injectable, PLATFORM_ID, signal, type Signal, type WritableSignal } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Viewport, VIEWPORT_WIDTHS_NUMERIC } from '@utils/screen.utils';
import { fromEventSignal } from '@utils/from-event-signal.utils';
import { WINDOW } from './window';

export const Direction = Object.freeze({ Up: 'Up', Down: 'Down' } as const);
export type Direction = (typeof Direction)[keyof typeof Direction];

@Injectable({
	providedIn: 'root',
})
export class LayoutService {
	private window = inject(WINDOW);
	private platformId = inject(PLATFORM_ID);

	private readonly viewport: WritableSignal<Viewport> = signal('xl');

	private lastScrollY = 0;
	private hasFirstScrollPastThreshold = false;
	private currentScrollDirection: Direction = Direction.Up;

	public readonly userHasScrolled: Signal<Direction> = fromEventSignal<Direction>(
		this.window,
		'scroll',
		() => this.computeScrollDirection(),
		Direction.Up,
	);

	// Su project sincroniza `viewport` ante resize/orientationchange; el valor de la signal
	// no se consume directamente (`isHeaderVisible` lee `viewport` vía `biggerThan`).
	private readonly viewportHasChanged = fromEventSignal<Viewport>(
		this.window,
		['resize', 'orientationchange'],
		() => this.setViewport(),
		this.viewport(),
	);

	public readonly isHeaderVisible: Signal<boolean> = computed(
		() => this.biggerThan('xs') || this.userHasScrolled() === Direction.Up,
	);

	constructor() {
		this.setViewport();
	}

	private computeScrollDirection(): Direction {
		const y = this.window.scrollY;
		if (y <= 400) {
			return this.currentScrollDirection;
		}
		if (!this.hasFirstScrollPastThreshold) {
			this.hasFirstScrollPastThreshold = true;
			this.lastScrollY = y;
			return this.currentScrollDirection;
		}
		this.currentScrollDirection = y < this.lastScrollY ? Direction.Up : Direction.Down;
		this.lastScrollY = y;
		return this.currentScrollDirection;
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

	public setViewport(): Viewport {
		// Para SSR, siempre devolver md dado que no se puede acceder a window
		if (this.isPlatformServer()) {
			this.viewport.set('md');
			return 'md';
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
		return currentViewport;
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
