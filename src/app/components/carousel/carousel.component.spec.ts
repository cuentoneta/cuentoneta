// Librería de pruebas
import { render, screen } from '@testing-library/angular';

// Componentes
import { CarouselComponent } from './carousel.component';

// Mocks
import { contentCampaignMock } from '@mocks/content-campaign.mock';
import { LayoutService } from '../../providers/layout.service';

// Servicios mock
class MockLayoutXsViewportService {
	public biggerThan(viewport: string) {
		return viewport !== 'xs';
	}
}

class MockLayoutMdViewportService {
	public biggerThan(viewport: string) {
		return viewport === 'xs';
	}
}

describe('CarouselComponent', () => {
	it('should render the component', async () => {
		const { container } = await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
		});
		expect(container).toBeInTheDocument();
	});

	it('should receive and render slides correctly', async () => {
		const { fixture } = await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
		});
		// Verificar que el componente recibe el número correcto de diapositivas
		expect(fixture.componentInstance.slides()).toHaveLength(contentCampaignMock.length);
		// Verificar que exactamente una diapositiva se renderiza (diapositiva activa)
		const images = screen.getAllByRole('img');
		expect(images.length).toBe(1);
	});

	it('should apply xs viewport-specific classes correctly', async () => {
		await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
			providers: [{ provide: LayoutService, useClass: MockLayoutXsViewportService }],
		});
		const slideLinks = screen.getAllByRole('link');
		slideLinks.forEach((link) => {
			expect(link).toHaveClass('sm:hidden');
		});
	});

	it('should apply md viewport-specific classes correctly', async () => {
		await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
			providers: [{ provide: LayoutService, useClass: MockLayoutMdViewportService }],
		});
		const slideLinks = screen.getAllByRole('link');
		slideLinks.forEach((link) => {
			expect(link).toHaveClass('max-sm:hidden');
		});
	});

	// Pruebas de navegación
	it('should navigate to next slide', async () => {
		const { fixture } = await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
		});

		const component = fixture.componentInstance;
		const initialIndex = component.activeIndex();
		expect(initialIndex).toBe(0);

		component.next();
		fixture.detectChanges();

		expect(component.activeIndex()).toBe(1);
	});

	it('should navigate to previous slide', async () => {
		const { fixture } = await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
		});

		const component = fixture.componentInstance;
		// Comenzar en la diapositiva 1
		component.onIndicatorClick(1);
		fixture.detectChanges();

		// Esperar a que se complete la transición
		await new Promise((resolve) => setTimeout(resolve, 700));

		component.prev();
		fixture.detectChanges();

		expect(component.activeIndex()).toBe(0);
	});

	it('should loop to first slide when at end', async () => {
		const { fixture } = await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
		});

		const component = fixture.componentInstance;
		const lastIndex = contentCampaignMock.length - 1;

		// Ir a la última diapositiva
		component.onIndicatorClick(lastIndex);
		fixture.detectChanges();

		// Esperar a que se complete la transición
		await new Promise((resolve) => setTimeout(resolve, 700));

		// Navegar siguiente (debería volver a la primera)
		component.next();
		fixture.detectChanges();

		expect(component.activeIndex()).toBe(0);
	});

	it('should loop to last slide when at start', async () => {
		const { fixture } = await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
		});

		const component = fixture.componentInstance;
		expect(component.activeIndex()).toBe(0);

		// Navegar anterior (debería volver a la última)
		component.prev();
		fixture.detectChanges();

		expect(component.activeIndex()).toBe(contentCampaignMock.length - 1);
	});

	it('should not allow navigation while transitioning', async () => {
		const { fixture } = await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
		});

		const component = fixture.componentInstance;
		expect(component.activeIndex()).toBe(0);

		// Iniciar transición
		component.next();
		fixture.detectChanges();
		expect(component.isTransitioning()).toBe(true);

		// Intentar navegar nuevamente mientras está en transición
		component.next();
		fixture.detectChanges();

		// Debe seguir en la diapositiva 1 (segunda navegación ignorada)
		expect(component.activeIndex()).toBe(1);
	});

	// Pruebas de reproducción automática
	it('should start with auto-play enabled', async () => {
		const { fixture } = await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
		});

		const component = fixture.componentInstance;
		// Auto-play is enabled when isPaused is false
		expect(component.isPaused()).toBe(false);
	});

	it('should pause auto-play when paused', async () => {
		const { fixture } = await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
		});

		const component = fixture.componentInstance;
		expect(component.isPaused()).toBe(false);

		component.pauseAutoPlay();

		expect(component.isPaused()).toBe(true);
	});

	it('should resume auto-play when resumed', async () => {
		const { fixture } = await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
		});

		const component = fixture.componentInstance;
		component.pauseAutoPlay();
		expect(component.isPaused()).toBe(true);

		component.resumeAutoPlay();

		expect(component.isPaused()).toBe(false);
	});

	// Pruebas de accesibilidad
	it('should have proper ARIA attributes on navigation buttons', async () => {
		await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
			providers: [{ provide: LayoutService, useClass: MockLayoutMdViewportService }],
		});

		const prevButton = screen.getByLabelText('Previous slide');
		const nextButton = screen.getByLabelText('Next slide');

		expect(prevButton).toBeInTheDocument();
		expect(nextButton).toBeInTheDocument();
	});

	it('should have proper ARIA attributes on indicators', async () => {
		await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
		});

		const indicators = screen
			.getAllByRole('button')
			.filter((btn) => btn.getAttribute('aria-label')?.includes('Go to slide'));

		expect(indicators.length).toBe(contentCampaignMock.length);

		// El primer indicador debe tener aria-current="true"
		expect(indicators[0]).toHaveAttribute('aria-current', 'true');

		// Los otros indicadores deben tener aria-current="false"
		for (let i = 1; i < indicators.length; i++) {
			expect(indicators[i]).toHaveAttribute('aria-current', 'false');
		}
	});

	it('should update aria-current when slide changes', async () => {
		const { fixture } = await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
		});

		const component = fixture.componentInstance;

		// Navegar a la segunda diapositiva
		component.next();
		fixture.detectChanges();

		const indicators = screen
			.getAllByRole('button')
			.filter((btn) => btn.getAttribute('aria-label')?.includes('Go to slide'));

		// El segundo indicador debe ahora tener aria-current="true"
		expect(indicators[1]).toHaveAttribute('aria-current', 'true');
		expect(indicators[0]).toHaveAttribute('aria-current', 'false');
	});

	// Pruebas de signals computadas
	it('should return active slide correctly based on activeIndex signal', async () => {
		const { fixture } = await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
		});

		const [firstSlide, secondSlide] = [contentCampaignMock[0], contentCampaignMock[1]];

		const component = fixture.componentInstance;
		expect(contentCampaignMock[component.activeIndex()]).toBe(firstSlide);

		component.next();
		fixture.detectChanges();

		expect(contentCampaignMock[component.activeIndex()]).toBe(secondSlide);
	});

	it('should show controls on desktop viewport', async () => {
		await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
			providers: [{ provide: LayoutService, useClass: MockLayoutMdViewportService }],
		});

		expect(screen.queryByLabelText('Previous slide')).toBeInTheDocument();
		expect(screen.queryByLabelText('Next slide')).toBeInTheDocument();
	});

	it('should hide controls on mobile viewport', async () => {
		await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
			providers: [{ provide: LayoutService, useClass: MockLayoutXsViewportService }],
		});

		expect(screen.queryByLabelText('Previous slide')).not.toBeInTheDocument();
		expect(screen.queryByLabelText('Next slide')).not.toBeInTheDocument();
	});

	// Pruebas de señal de dirección
	it('should set direction signal when navigating', async () => {
		const { fixture } = await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
		});

		const component = fixture.componentInstance;

		component.next();
		expect(component.direction()).toBe('left');

		// Esperar a que se complete la transición
		await new Promise((resolve) => setTimeout(resolve, 700));
		expect(component.direction()).toBe(null);
	});

	// Pruebas de navegación por gestos táctiles
	describe('Touch Gesture Navigation', () => {
		// Función auxiliar para crear eventos táctiles con propiedades completas
		function createTouchEvent(type: string, clientX: number, clientY: number): TouchEvent {
			const touch = {
				clientX,
				clientY,
				identifier: 0,
				pageX: clientX,
				pageY: clientY,
				screenX: clientX,
				screenY: clientY,
				target: document.createElement('div'),
				radiusX: 0,
				radiusY: 0,
				rotationAngle: 0,
				force: 1,
			} as Touch;

			return new TouchEvent(type, {
				touches: type !== 'touchend' ? [touch] : [],
				changedTouches: [touch],
				cancelable: true,
				bubbles: true,
			});
		}

		// Función auxiliar para simular una secuencia de deslizamiento
		function simulateSwipe(element: HTMLElement, startX: number, endX: number, y: number = 100): void {
			element.dispatchEvent(createTouchEvent('touchstart', startX, y));
			element.dispatchEvent(createTouchEvent('touchmove', endX, y));
			element.dispatchEvent(createTouchEvent('touchend', endX, y));
		}

		it('should navigate to next slide on left swipe', async () => {
			const { fixture } = await render(CarouselComponent, {
				inputs: { slides: contentCampaignMock },
			});

			const component = fixture.componentInstance;
			const element = fixture.nativeElement;

			// Simular deslizamiento a la izquierda (inicio en 200, fin en 100)
			simulateSwipe(element, 200, 100);

			expect(component.activeIndex()).toBe(1);
		});

		it('should navigate to previous slide on right swipe', async () => {
			const { fixture } = await render(CarouselComponent, {
				inputs: { slides: contentCampaignMock },
			});

			const component = fixture.componentInstance;
			const element = fixture.nativeElement;

			// Primero ir a la diapositiva 1
			component.next();
			await new Promise((resolve) => setTimeout(resolve, 700));

			// Simular deslizamiento a la derecha (inicio en 100, fin en 200)
			simulateSwipe(element, 100, 200);

			expect(component.activeIndex()).toBe(0);
		});

		it('should not navigate if swipe distance is below threshold', async () => {
			const { fixture } = await render(CarouselComponent, {
				inputs: { slides: contentCampaignMock },
			});

			const component = fixture.componentInstance;
			const element = fixture.nativeElement;
			const initialIndex = component.activeIndex();

			// Simular deslizamiento pequeño (30px, por debajo del umbral de 50px)
			simulateSwipe(element, 100, 130);

			expect(component.activeIndex()).toBe(initialIndex);
		});

		it('should pause auto-play during swipe', async () => {
			const { fixture } = await render(CarouselComponent, {
				inputs: { slides: contentCampaignMock },
			});

			const component = fixture.componentInstance;
			const element = fixture.nativeElement;
			expect(component.isPaused()).toBe(false);

			element.dispatchEvent(createTouchEvent('touchstart', 100, 100));

			expect(component.isPaused()).toBe(true);
		});

		it('should resume auto-play after swipe ends', async () => {
			const { fixture } = await render(CarouselComponent, {
				inputs: { slides: contentCampaignMock },
			});

			const component = fixture.componentInstance;
			const element = fixture.nativeElement;

			element.dispatchEvent(createTouchEvent('touchstart', 100, 100));
			element.dispatchEvent(createTouchEvent('touchend', 200, 100));

			expect(component.isPaused()).toBe(false);
		});

		it('should not navigate while transitioning', async () => {
			const { fixture } = await render(CarouselComponent, {
				inputs: { slides: contentCampaignMock },
			});

			const component = fixture.componentInstance;
			const element = fixture.nativeElement;
			component.next(); // Iniciar transición

			expect(component.isTransitioning()).toBe(true);

			const initialIndex = component.activeIndex();

			// Intentar deslizar durante la transición
			simulateSwipe(element, 200, 100);

			// No debe cambiar de diapositiva
			expect(component.activeIndex()).toBe(initialIndex);
		});
	});

	// Pruebas de transiciones con dos diapositivas
	describe('Dual-slide transitions', () => {
		it('should set previousIndex when navigating', async () => {
			const { fixture } = await render(CarouselComponent, {
				inputs: { slides: contentCampaignMock },
			});

			const component = fixture.componentInstance;
			expect(component.previousIndex()).toBeNull();

			// Navegar a la siguiente diapositiva
			component.next();
			fixture.detectChanges();

			// El índice anterior debe establecerse en 0 (la antigua diapositiva activa)
			expect(component.previousIndex()).toBe(0);
			expect(component.activeIndex()).toBe(1);
		});

		it('should clear previousIndex after transition completes', async () => {
			const { fixture } = await render(CarouselComponent, {
				inputs: { slides: contentCampaignMock },
			});

			const component = fixture.componentInstance;

			component.next();
			fixture.detectChanges();

			expect(component.previousIndex()).toBe(0);

			// Esperar a que se complete la transición
			await new Promise((resolve) => setTimeout(resolve, 700));

			// El índice anterior debe limpiarse
			expect(component.previousIndex()).toBeNull();
		});

		it('should render both slides during transition', async () => {
			const { fixture } = await render(CarouselComponent, {
				inputs: { slides: contentCampaignMock },
			});

			const component = fixture.componentInstance;

			component.next();
			fixture.detectChanges();

			// Durante la transición, ambas diapositivas deben estar visibles
			const images = screen.getAllByRole('img');
			expect(images.length).toBe(2);

			// El previousIndex debe estar establecido
			expect(component.previousIndex()).toBe(0);
			expect(component.activeIndex()).toBe(1);
		});

		it('should render only one slide when not transitioning', async () => {
			const { fixture } = await render(CarouselComponent, {
				inputs: { slides: contentCampaignMock },
			});

			const component = fixture.componentInstance;

			// Inicialmente, solo debe renderizarse una diapositiva
			const initialImages = screen.getAllByRole('img');
			expect(initialImages.length).toBe(1);

			// Navegar
			component.next();
			fixture.detectChanges();

			// Esperar a que se complete la transición
			await new Promise((resolve) => setTimeout(resolve, 700));
			fixture.detectChanges();

			// Después de la transición, solo una diapositiva nuevamente
			const finalImages = screen.getAllByRole('img');
			expect(finalImages.length).toBe(1);
		});
	});
});
