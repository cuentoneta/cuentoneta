import { makeEnvironmentProviders, signal, type EnvironmentProviders } from '@angular/core';
import { of, type Observable } from 'rxjs';
import { compareViewports, type Viewport } from '@utils/screen.utils';
import { Direction, LayoutService } from './layout.interface';

export class InMemoryLayoutService implements LayoutService {
	private readonly viewport = signal<Viewport>('lg');

	public readonly isHeaderVisible = signal(true);
	public readonly userHasScrolled$: Observable<Direction> = of(Direction.Down);
	public readonly viewportHasChanged$: Observable<Event | null> = of(null);
	public readonly isHeaderVisible$: Observable<boolean> = of(true);

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
		// no-op
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

export function provideLayoutMock(service: LayoutService = new InMemoryLayoutService()): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: LayoutService, useValue: service }]);
}
