import { fn, spyOn, type Mock } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { WindowLayoutService } from './layout.provider';
import { Direction, type LayoutService } from './layout.interface';
import { WINDOW } from './window';
import { map, of } from 'rxjs';
import { Viewport } from '@utils/screen.utils';

// `implements` no obliga al contrato a seguir al real: esta constante deja de compilar si
// `WindowLayoutService` gana un miembro público que el contrato no declare.
const contractCoversWindowLayoutService: Exclude<keyof WindowLayoutService, keyof LayoutService> extends never
	? true
	: false = true;

describe('WindowLayoutService', () => {
	let service: WindowLayoutService;

	it('should expose a public surface fully described by the LayoutService contract', () => {
		expect(contractCoversWindowLayoutService).toBe(true);
	});
	let mockWindow: {
		scrollY: number;
		innerWidth: number;
		addEventListener: Mock;
		removeEventListener: Mock;
		dispatchEvent: Mock;
	};

	beforeEach(() => {
		mockWindow = {
			scrollY: 0,
			innerWidth: 1920,
			addEventListener: fn(),
			removeEventListener: fn(),
			dispatchEvent: fn((event: Event) => {
				if (typeof event === 'object' && event.type) {
					mockWindow.addEventListener.mock.calls
						.filter(([type]) => type === event.type)
						.forEach(([, listener]) => listener(event));
				}
			}),
		};

		TestBed.configureTestingModule({
			providers: [WindowLayoutService, { provide: WINDOW, useValue: mockWindow }],
		});

		service = TestBed.inject(WindowLayoutService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('userHasScrolled$', () => {
		it('should emit Direction.Up when scrolling up', () =>
			new Promise<void>((resolve) => {
				const scrollEvents = of([800, 500]).pipe(map(([prev, curr]) => (curr < prev ? Direction.Up : Direction.Down)));
				spyOn(service, 'userHasScrolled$', 'get').mockReturnValue(scrollEvents);

				service.userHasScrolled$.subscribe((direction: string) => {
					expect(direction).toBe(Direction.Up);
					resolve();
				});
			}));

		it('should emit Direction.Down when scrolling down', () =>
			new Promise<void>((resolve) => {
				const scrollEvents = of([500, 900]).pipe(map(([prev, curr]) => (curr < prev ? Direction.Up : Direction.Down)));
				spyOn(service, 'userHasScrolled$', 'get').mockReturnValue(scrollEvents);

				service.userHasScrolled$.subscribe((direction: string) => {
					expect(direction).toBe(Direction.Down);
					resolve();
				});
			}));
	});

	describe('isHeaderVisible$', () => {
		it('should emit true when the user scrolls up', () =>
			new Promise<void>((resolve) => {
				const scrollEvents = of([1200, 500]).pipe(map(([prev, curr]) => (curr < prev ? Direction.Up : Direction.Down)));
				spyOn(service, 'userHasScrolled$', 'get').mockReturnValue(scrollEvents);

				service.isHeaderVisible$.subscribe((isVisible) => {
					expect(isVisible).toBe(true);
					resolve();
				});
			}));

		it('should emit false when the user scrolls down for an xs screen', () =>
			new Promise<void>((resolve) => {
				mockWindow.innerWidth = 500; // xs
				service.setViewport();
				const scrollEvents = of([500, 1000]).pipe(map(([prev, curr]) => (curr < prev ? Direction.Up : Direction.Down)));
				spyOn(service, 'userHasScrolled$', 'get').mockReturnValue(scrollEvents);

				service.isHeaderVisible$.subscribe((isVisible) => {
					expect(isVisible).toBe(false);
					resolve();
				});
			}));

		it('should emit true when the user scrolls down for an sm screen', () =>
			new Promise<void>((resolve) => {
				mockWindow.innerWidth = 768; // sm
				service.setViewport();
				const scrollEvents = of([500, 1000]).pipe(map(([prev, curr]) => (curr < prev ? Direction.Up : Direction.Down)));
				spyOn(service, 'userHasScrolled$', 'get').mockReturnValue(scrollEvents);

				service.isHeaderVisible$.subscribe((isVisible) => {
					expect(isVisible).toBe(true);
					resolve();
				});
			}));

		it('should emit true when the user scrolls down for an md screen', () =>
			new Promise<void>((resolve) => {
				spyOn(service, 'setViewport').mockReturnValue();
				const scrollEvents = of([500, 1000]).pipe(map(([prev, curr]) => (curr < prev ? Direction.Up : Direction.Down)));
				spyOn(service, 'userHasScrolled$', 'get').mockReturnValue(scrollEvents);

				service.isHeaderVisible$.subscribe((isVisible) => {
					expect(isVisible).toBe(true);
					resolve();
				});
			}));

		it('is visible by default via the signal before any scroll', () => {
			mockWindow.innerWidth = 500; // xs
			service.setViewport();
			expect(service.isHeaderVisible()).toBe(true);
		});

		describe('biggerThan', () => {
			it('should return true if the current viewport is larger than the test viewport', () => {
				mockWindow.innerWidth = 1440; // lg
				service.setViewport();
				expect(service.biggerThan('md')).toBe(true);

				mockWindow.innerWidth = 1920; // xl
				service.setViewport();
				expect(service.biggerThan('lg')).toBe(true);
			});

			it('should return false if the current viewport is not larger than the test viewport', () => {
				mockWindow.innerWidth = 1024; // md
				service.setViewport();
				expect(service.biggerThan('lg')).toBe(false);
				mockWindow.innerWidth = 768; // sm
				service.setViewport();
				expect(service.biggerThan('sm')).toBe(false);
			});

			it('should throw an error if an invalid viewport is provided', () => {
				expect(() => service.biggerThan('invalid' as Viewport)).toThrow();
			});
		});

		describe('smallerThan', () => {
			it('should return true if the current viewport is smaller than the test viewport', () => {
				mockWindow.innerWidth = 768; // sm
				service.setViewport();
				expect(service.smallerThan('md')).toBe(true);

				mockWindow.innerWidth = 1024; // md
				service.setViewport();
				expect(service.smallerThan('lg')).toBe(true);
			});

			it('should return false if the current viewport is not smaller than the test viewport', () => {
				mockWindow.innerWidth = 1440; // lg
				service.setViewport();
				expect(service.smallerThan('md')).toBe(false);

				mockWindow.innerWidth = 1920; // xl
				service.setViewport();
				expect(service.smallerThan('xl')).toBe(false);
			});

			it('should throw an error if an invalid viewport is provided', () => {
				expect(() => service.smallerThan('invalid' as Viewport)).toThrow();
			});
		});

		describe('setViewport', () => {
			it('should set viewport to md for server-side rendering', () => {
				spyOn(service, 'isPlatformServer').mockReturnValue(true);
				service.setViewport();
				expect(service.isActual('md')).toBe(true);
			});

			it('should set the correct viewport based on window width', () => {
				mockWindow.innerWidth = 500; // xs
				service.setViewport();
				expect(service.isActual('xs')).toBe(true);

				mockWindow.innerWidth = 768; // sm
				service.setViewport();
				expect(service.isActual('sm')).toBe(true);

				mockWindow.innerWidth = 1024; // md
				service.setViewport();
				expect(service.isActual('md')).toBe(true);

				mockWindow.innerWidth = 1440; // lg
				service.setViewport();
				expect(service.isActual('lg')).toBe(true);

				mockWindow.innerWidth = 1920; // xl
				service.setViewport();
				expect(service.isActual('xl')).toBe(true);
			});
		});
	});
});
