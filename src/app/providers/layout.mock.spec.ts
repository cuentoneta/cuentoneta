import { TestBed } from '@angular/core/testing';
import { InMemoryLayoutService, provideLayoutServiceMock } from './layout.mock';
import { LayoutService } from './layout.service';
import { Direction, type Layout } from './layout.interface';
import type { Viewport } from '@utils/screen.utils';

/**
 * `implements Layout` obliga al doble a seguir la interfaz, pero no obliga a la interfaz a seguir al real:
 * un miembro público agregado solo a `LayoutService` volvería a divergir sin señal. Esta constante deja de
 * compilar en ese caso, forzando a extender el contrato (y con él, al doble).
 */
const contractCoversLayoutService: Exclude<keyof LayoutService, keyof Layout> extends never ? true : false = true;

describe('InMemoryLayoutService', () => {
	it('should expose a Layout contract that covers the whole LayoutService public surface', () => {
		expect(contractCoversLayoutService).toBe(true);
	});

	let service: InMemoryLayoutService;

	beforeEach(() => {
		service = new InMemoryLayoutService();
	});

	it('should be created with lg as its default viewport', () => {
		expect(service.isActual('lg')).toBe(true);
	});

	describe('biggerThan', () => {
		it('should return true if the current viewport is larger than the test viewport', () => {
			service.simulateViewport('lg');
			expect(service.biggerThan('md')).toBe(true);

			service.simulateViewport('xl');
			expect(service.biggerThan('lg')).toBe(true);
		});

		it('should return false if the current viewport is not larger than the test viewport', () => {
			service.simulateViewport('md');
			expect(service.biggerThan('lg')).toBe(false);

			service.simulateViewport('sm');
			expect(service.biggerThan('sm')).toBe(false);
		});

		it('should throw an error if an invalid viewport is provided', () => {
			expect(() => service.biggerThan('invalid' as Viewport)).toThrow();
		});
	});

	describe('smallerThan', () => {
		it('should return true if the current viewport is smaller than the test viewport', () => {
			service.simulateViewport('sm');
			expect(service.smallerThan('md')).toBe(true);

			service.simulateViewport('md');
			expect(service.smallerThan('lg')).toBe(true);
		});

		it('should return false if the current viewport is not smaller than the test viewport', () => {
			service.simulateViewport('lg');
			expect(service.smallerThan('md')).toBe(false);

			service.simulateViewport('xl');
			expect(service.smallerThan('xl')).toBe(false);
		});

		it('should throw an error if an invalid viewport is provided', () => {
			expect(() => service.smallerThan('invalid' as Viewport)).toThrow();
		});
	});

	describe('isActual', () => {
		it('should return true only for the viewport last simulated', () => {
			service.simulateViewport('xs');
			expect(service.isActual('xs')).toBe(true);
			expect(service.isActual('md')).toBe(false);
		});

		it('should throw an error if an invalid viewport is provided', () => {
			expect(() => service.isActual('invalid' as Viewport)).toThrow();
		});
	});

	describe('setViewport', () => {
		it('should leave the simulated viewport untouched, since there is no window to detect it from', () => {
			service.simulateViewport('xs');

			service.setViewport();

			expect(service.isActual('xs')).toBe(true);
		});
	});

	describe('platform checks', () => {
		it('should report a browser platform', () => {
			expect(service.isPlatformBrowser()).toBe(true);
			expect(service.isPlatformServer()).toBe(false);
		});
	});

	describe('observables', () => {
		it('should emit a scroll direction on userHasScrolled$', () => {
			let emitted: Direction | undefined;
			service.userHasScrolled$.subscribe((direction) => (emitted = direction));

			expect(emitted).toBe(Direction.Down);
		});

		it('should emit on viewportHasChanged$', () => {
			let emitted: Event | null | undefined;
			let hasEmitted = false;
			service.viewportHasChanged$.subscribe((event) => {
				emitted = event;
				hasEmitted = true;
			});

			expect(hasEmitted).toBe(true);
			expect(emitted).toBeNull();
		});

		it('should emit a visible header on isHeaderVisible$', () => {
			let emitted: boolean | undefined;
			service.isHeaderVisible$.subscribe((isVisible) => (emitted = isVisible));

			expect(emitted).toBe(true);
		});
	});

	describe('provideLayoutServiceMock', () => {
		it('should substitute LayoutService with the provided instance', () => {
			TestBed.configureTestingModule({ providers: [provideLayoutServiceMock(service)] });

			expect(TestBed.inject(LayoutService)).toBe(service);
		});

		it('should substitute LayoutService with a fresh double when no instance is provided', () => {
			TestBed.configureTestingModule({ providers: [provideLayoutServiceMock()] });

			expect(TestBed.inject(LayoutService)).toBeInstanceOf(InMemoryLayoutService);
		});
	});
});
