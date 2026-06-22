import { fn, spyOn, type Mock } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { LayoutService, Direction } from './layout.service';
import { WINDOW } from './window';
import { Viewport } from '@utils/screen.utils';

describe('LayoutService', () => {
	let service: LayoutService;
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
			dispatchEvent: fn((event: { type: string }) => {
				mockWindow.addEventListener.mock.calls
					.filter(([type]: [string]) => type === event.type)
					.forEach(([, listener]: [string, (e: unknown) => void]) => listener(event));
			}),
		};

		TestBed.configureTestingModule({
			providers: [LayoutService, { provide: WINDOW, useValue: mockWindow }],
		});

		service = TestBed.inject(LayoutService);
	});

	const scrollTo = (scrollY: number): void => {
		mockWindow.scrollY = scrollY;
		mockWindow.dispatchEvent({ type: 'scroll' });
	};

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('userHasScrolled', () => {
		it('stays Up until a second scroll past 400px establishes a direction', () => {
			scrollTo(800); // primer scroll > 400: absorbed como baseline
			expect(service.userHasScrolled()).toBe(Direction.Up);

			scrollTo(500); // 500 < 800 → Up
			expect(service.userHasScrolled()).toBe(Direction.Up);
		});

		it('emits Down when scrolling down past 400px after the baseline scroll', () => {
			scrollTo(500); // baseline
			scrollTo(900); // 900 > 500 → Down
			expect(service.userHasScrolled()).toBe(Direction.Down);
		});

		it('ignores scroll events at or below 400px', () => {
			scrollTo(300);
			expect(service.userHasScrolled()).toBe(Direction.Up);

			scrollTo(400);
			expect(service.userHasScrolled()).toBe(Direction.Up);
		});

		it('toggles between Up and Down across direction changes', () => {
			scrollTo(800); // baseline
			scrollTo(500); // Up
			expect(service.userHasScrolled()).toBe(Direction.Up);

			scrollTo(900); // Down
			expect(service.userHasScrolled()).toBe(Direction.Down);

			scrollTo(600); // Up
			expect(service.userHasScrolled()).toBe(Direction.Up);
		});
	});

	describe('isHeaderVisible', () => {
		it('is visible when the user scrolls up on xs', () => {
			mockWindow.innerWidth = 500; // xs
			service.setViewport();

			scrollTo(800); // baseline
			scrollTo(500); // Up
			expect(service.isHeaderVisible()).toBe(true);
		});

		it('is hidden when the user scrolls down on xs', () => {
			mockWindow.innerWidth = 500; // xs
			service.setViewport();

			scrollTo(500); // baseline
			scrollTo(900); // Down
			expect(service.isHeaderVisible()).toBe(false);
		});

		it('stays visible when scrolling down on sm (bigger than xs)', () => {
			mockWindow.innerWidth = 768; // sm
			service.setViewport();

			scrollTo(500); // baseline
			scrollTo(900); // Down
			expect(service.isHeaderVisible()).toBe(true);
		});

		it('stays visible when scrolling down on md', () => {
			mockWindow.innerWidth = 960; // md
			service.setViewport();

			scrollTo(500); // baseline
			scrollTo(900); // Down
			expect(service.isHeaderVisible()).toBe(true);
		});

		it('recomputes to visible when the viewport grows past xs while the header is hidden', () => {
			mockWindow.innerWidth = 500; // xs
			service.setViewport();

			scrollTo(500); // baseline
			scrollTo(900); // Down → oculta en xs
			expect(service.isHeaderVisible()).toBe(false);

			mockWindow.innerWidth = 960; // md
			service.setViewport();
			expect(service.isHeaderVisible()).toBe(true);
		});

		it('is visible by default before any scroll', () => {
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
