import { advanceTimersByTime, fn, spyOn, useFakeTimers, useRealTimers, type Mock } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { WindowLayoutService } from './layout.provider';
import { Direction, type LayoutService } from './layout.interface';
import { WINDOW } from './window';
import { map, of, type Observable } from 'rxjs';
import type { Viewport } from '@utils/screen.utils';

// `isHeaderVisible$` es privado: es el detalle que alimenta el signal público `isHeaderVisible`. Se
// accede acá para probar la política de visibilidad del header —la lógica que el signal deriva— sin
// exponer el observable en el contrato.
const headerVisibility$ = (svc: WindowLayoutService): Observable<boolean> =>
	(svc as unknown as { readonly isHeaderVisible$: Observable<boolean> }).isHeaderVisible$;

describe('WindowLayoutService', () => {
	let service: WindowLayoutService;
	let mockWindow: {
		scrollY: number;
		innerWidth: number;
		addEventListener: Mock;
		removeEventListener: Mock;
		dispatchEvent: Mock;
	};

	// Los timers falsos se instalan antes de construir el servicio para que el estrangulado de sus
	// observables quede bajo control del test y no del reloj real.
	beforeEach(() => {
		useFakeTimers();

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

	afterEach(() => {
		useRealTimers();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	// El viewport es la única fuente que tiene quien decide qué contenido servir —el carousel, por
	// caso—, así que un cambio de tamaño que no lo actualice deja servido el contenido del ancho
	// anterior. Los eventos viajan estrangulados: hay que agotar la ventana para leer el tamaño final.
	describe('recálculo del viewport ante un cambio de tamaño', () => {
		const throttleWindow = 150;

		it('recalculates the viewport on resize, with no scrolling involved', () => {
			expect(service.isActual('xl')).toBe(true);

			mockWindow.innerWidth = 500;
			mockWindow.dispatchEvent(new Event('resize'));
			advanceTimersByTime(throttleWindow);

			expect(service.isActual('xs')).toBe(true);
		});

		it('recalculates the viewport on orientation change', () => {
			mockWindow.innerWidth = 500;
			mockWindow.dispatchEvent(new Event('orientationchange'));
			advanceTimersByTime(throttleWindow);

			expect(service.isActual('xs')).toBe(true);
		});

		// Arrastrar el borde de la ventana emite una ráfaga entera: lo que vale es dónde terminó, no
		// dónde empezó.
		it('keeps the last width of a burst of resize events', () => {
			mockWindow.innerWidth = 500;
			mockWindow.dispatchEvent(new Event('resize'));
			mockWindow.innerWidth = 1024;
			mockWindow.dispatchEvent(new Event('resize'));
			advanceTimersByTime(throttleWindow);

			expect(service.isActual('md')).toBe(true);
		});
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

	describe('política de visibilidad del header (deriva el signal isHeaderVisible)', () => {
		it('should emit true when the user scrolls up', () =>
			new Promise<void>((resolve) => {
				const scrollEvents = of([1200, 500]).pipe(map(([prev, curr]) => (curr < prev ? Direction.Up : Direction.Down)));
				spyOn(service, 'userHasScrolled$', 'get').mockReturnValue(scrollEvents);

				headerVisibility$(service).subscribe((isVisible) => {
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

				headerVisibility$(service).subscribe((isVisible) => {
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

				headerVisibility$(service).subscribe((isVisible) => {
					expect(isVisible).toBe(true);
					resolve();
				});
			}));

		it('should emit true when the user scrolls down for an md screen', () =>
			new Promise<void>((resolve) => {
				spyOn(service, 'setViewport').mockReturnValue();
				const scrollEvents = of([500, 1000]).pipe(map(([prev, curr]) => (curr < prev ? Direction.Up : Direction.Down)));
				spyOn(service, 'userHasScrolled$', 'get').mockReturnValue(scrollEvents);

				headerVisibility$(service).subscribe((isVisible) => {
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

describe('WindowLayoutService — paridad de superficie con el contrato LayoutService', () => {
	it('mantiene cada miembro público de WindowLayoutService cubierto por la interfaz LayoutService', () => {
		// Si WindowLayoutService gana un miembro público que LayoutService no declara, `ExtraPublicMembers`
		// deja de ser `never`, el tipo del literal `true` no calza contra `false` y esta asignación rompe el
		// typecheck con TS2322 — la señal de divergencia que antes no existía.
		type ExtraPublicMembers = Exclude<keyof WindowLayoutService, keyof LayoutService>;
		const parityHolds: ExtraPublicMembers extends never ? true : false = true;
		expect(parityHolds).toBe(true);
	});
});
