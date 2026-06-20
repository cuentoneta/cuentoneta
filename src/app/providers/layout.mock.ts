import { Injectable, signal } from '@angular/core';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Viewport, VIEWPORT_WIDTHS_NUMERIC } from '@utils/screen.utils';
import { LayoutService } from './layout.service';

@Injectable()
export class InMemoryLayoutService {
	public readonly viewport = signal<Viewport>('lg');
	public readonly isHeaderVisible = signal(true);

	public setViewport(viewport: Viewport): void {
		this.viewport.set(viewport);
	}

	public biggerThan(test: Viewport): boolean {
		return VIEWPORT_WIDTHS_NUMERIC[this.viewport()] > VIEWPORT_WIDTHS_NUMERIC[test];
	}
}

export function provideLayoutServiceMock(
	service: InMemoryLayoutService = new InMemoryLayoutService(),
): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: LayoutService, useValue: service }]);
}
