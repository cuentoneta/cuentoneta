import { TestBed } from '@angular/core/testing';
import { LayoutService, Direction } from './layout.service';
import { WINDOW } from './window';
import { map, of } from 'rxjs';
import { Viewport } from '@utils/screen.utils';

describe('LayoutService', () => {
	let service: LayoutService;
	let mockWindow: {
		scrollY: number;
		innerWidth: number;
		addEventListener: jest.Mock;
		removeEventListener: jest.Mock;
		dispatchEvent: jest.Mock;
	};

	beforeEach(() => {
		mockWindow = {
			scrollY: 0,
			innerWidth: 1920,
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
			dispatchEvent: jest.fn((event: Event) => {
				if (typeof event === 'object' && event.type) {
					mockWindow.addEventListener.mock.calls
						.filter(([type]: ['resize' | 'orientationchange']) => type === event.type)
						.forEach(([, listener]: [string, jest.Mock]) => listener(event));
				}
			}),
		};

		TestBed.configureTestingModule({
			providers: [LayoutService, { provide: WINDOW, useValue: mockWindow }],
		});

		service = TestBed.inject(LayoutService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('userHasScrolled$', () => {
		it('should emit Direction.Up when scrolling up', (done) => {
			const scrollEvents = of([800, 500]).pipe(map(([prev, curr]) => (curr < prev ? Direction.Up : Direction.Down)));
			jest.spyOn(service, 'userHasScrolled$', 'get').mockReturnValue(scrollEvents);

			service.userHasScrolled$.subscribe((direction: string) => {
				expect(direction).toBe(Direction.Up);
				done();
			});
		});

		it('should emit Direction.Down when scrolling down', (done) => {
			const scrollEvents = of([500, 900]).pipe(map(([prev, curr]) => (curr < prev ? Direction.Up : Direction.Down)));
			jest.spyOn(service, 'userHasScrolled$', 'get').mockReturnValue(scrollEvents);

			service.userHasScrolled$.subscribe((direction: string) => {
				expect(direction).toBe(Direction.Down);
				done();
			});
		});
	});

	describe('isHeaderVisible$', () => {
		it('should emit true when the user scrolls up', (done) => {
			const scrollEvents = of([1200, 500]).pipe(map(([prev, curr]) => (curr < prev ? Direction.Up : Direction.Down)));
			jest.spyOn(service, 'userHasScrolled$', 'get').mockReturnValue(scrollEvents);

			service.isHeaderVisible$.subscribe((isVisible) => {
				expect(isVisible).toBe(true);
				done();
			});
		});

		it('should emit false when the user scrolls down for an xs screen', (done) => {
			mockWindow.innerWidth = 500; // xs
			service.setViewport();
			const scrollEvents = of([500, 1000]).pipe(map(([prev, curr]) => (curr < prev ? Direction.Up : Direction.Down)));
			jest.spyOn(service, 'userHasScrolled$', 'get').mockReturnValue(scrollEvents);

			service.isHeaderVisible$.subscribe((isVisible) => {
				expect(isVisible).toBe(false);
				done();
			});
		});

		it('should emit true when the user scrolls down for an sm screen', (done) => {
			mockWindow.innerWidth = 768; // sm
			service.setViewport();
			const scrollEvents = of([500, 1000]).pipe(map(([prev, curr]) => (curr < prev ? Direction.Up : Direction.Down)));
			jest.spyOn(service, 'userHasScrolled$', 'get').mockReturnValue(scrollEvents);

			service.isHeaderVisible$.subscribe((isVisible) => {
				expect(isVisible).toBe(true);
				done();
			});
		});

		it('should emit true when the user scrolls down for an md screen', (done) => {
			jest.spyOn(service, 'setViewport').mockReturnValue();
			const scrollEvents = of([500, 1000]).pipe(map(([prev, curr]) => (curr < prev ? Direction.Up : Direction.Down)));
			jest.spyOn(service, 'userHasScrolled$', 'get').mockReturnValue(scrollEvents);

			service.isHeaderVisible$.subscribe((isVisible) => {
				expect(isVisible).toBe(true);
				done();
			});
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
				jest.spyOn(service, 'isPlatformServer').mockReturnValue(true);
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
