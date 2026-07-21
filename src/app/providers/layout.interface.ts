import { InjectionToken, type Signal } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Viewport } from '@utils/screen.utils';

export const Direction = Object.freeze({ Up: 'Up', Down: 'Down' } as const);
export type Direction = (typeof Direction)[keyof typeof Direction];

export interface LayoutService {
	readonly isHeaderVisible: Signal<boolean>;
	readonly userHasScrolled$: Observable<Direction>;
	readonly viewportHasChanged$: Observable<Event | null>;
	readonly isHeaderVisible$: Observable<boolean>;
	isPlatformBrowser(): boolean;
	isPlatformServer(): boolean;
	setViewport(): void;
	biggerThan(test: Viewport): boolean;
	smallerThan(test: Viewport): boolean;
	isActual(test: Viewport): boolean;
}

export const LayoutService = new InjectionToken<LayoutService>('LayoutService');
