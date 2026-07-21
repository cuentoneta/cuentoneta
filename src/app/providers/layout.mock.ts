import { Injectable, makeEnvironmentProviders, signal, type EnvironmentProviders } from '@angular/core';
import { of, type Observable } from 'rxjs';
import { VIEWPORT_WIDTHS_NUMERIC, type Viewport } from '@utils/screen.utils';
import { LayoutService } from './layout.service';
import { Direction, type Layout } from './layout.interface';

@Injectable({ providedIn: 'root' })
export class InMemoryLayoutService implements Layout {
	private readonly viewport = signal<Viewport>('lg');

	public readonly isHeaderVisible = signal(true);
	public readonly userHasScrolled$: Observable<Direction> = of(Direction.Down);
	public readonly viewportHasChanged$: Observable<Event | null> = of(null);
	public readonly isHeaderVisible$: Observable<boolean> = of(true);

	/** Fija el viewport del doble. Es la operación que `setViewport()` no puede cubrir: el contrato lo define como
	 * detección desde `window`, y acá no hay `window` de la cual detectar. */
	public simulateViewport(viewport: Viewport): void {
		this.viewport.set(viewport);
	}

	public isPlatformBrowser(): boolean {
		return true;
	}

	public isPlatformServer(): boolean {
		return false;
	}

	public setViewport(): void {
		// Sin `window`, no hay nada que detectar: el viewport del doble se fija con simulateViewport().
	}

	public biggerThan(test: Viewport): boolean {
		const { currentWidth, testWidth } = this.getWidths(test);
		return currentWidth > testWidth;
	}

	public smallerThan(test: Viewport): boolean {
		const { currentWidth, testWidth } = this.getWidths(test);
		return currentWidth < testWidth;
	}

	public isActual(test: Viewport): boolean {
		const { currentWidth, testWidth } = this.getWidths(test);
		return currentWidth === testWidth;
	}

	private getWidths(test: Viewport): { currentWidth: number; testWidth: number } {
		const currentWidth = VIEWPORT_WIDTHS_NUMERIC[this.viewport()];
		const testWidth = VIEWPORT_WIDTHS_NUMERIC[test];

		if (currentWidth === undefined || testWidth === undefined) {
			throw new Error(`Viewport inválido: ${test}`);
		}

		return { currentWidth, testWidth };
	}
}

export function provideLayoutServiceMock(
	service: InMemoryLayoutService = new InMemoryLayoutService(),
): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: LayoutService, useValue: service }]);
}
