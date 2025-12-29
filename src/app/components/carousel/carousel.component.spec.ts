// Librería de pruebas
import { render, screen } from '@testing-library/angular';

// Componentes
import { CarouselComponent } from './carousel.component';

// Mocks
import { contentCampaignMock } from '@mocks/content-campaign.mock';
import { LayoutService } from '../../providers/layout.service';

// Servicios mock
class MockLayoutXsViewportService {
	biggerThan(viewport: string) {
		return viewport !== 'xs';
	}
}

class MockLayoutMdViewportService {
	biggerThan(viewport: string) {
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
			expect(link).toHaveClass('md:hidden');
		});
	});

	it('should apply md viewport-specific classes correctly', async () => {
		await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
			providers: [{ provide: LayoutService, useClass: MockLayoutMdViewportService }],
		});
		const slideLinks = screen.getAllByRole('link');
		slideLinks.forEach((link) => {
			expect(link).toHaveClass('max-md:hidden');
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
		component.selectSlide(1, 'left');
		fixture.detectChanges();

		// Esperar a que se complete la transición
		await new Promise((resolve) => setTimeout(resolve, 1300));

		component.prev();
		fixture.detectChanges();

		expect(component.activeIndex()).toBe(0);
	});

	it('should loop to first slide when at end', async () => {
		const { fixture } = await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
		});

		const component = fixture.componentInstance;
		const lastIndex = component.slideCount() - 1;

		// Ir a la última diapositiva
		component.selectSlide(lastIndex, 'left');
		fixture.detectChanges();

		// Esperar a que se complete la transición
		await new Promise((resolve) => setTimeout(resolve, 1300));

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

		expect(component.activeIndex()).toBe(component.slideCount() - 1);
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
		expect(component.isPlaying()).toBe(true);
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

	it('should have correct slide count', async () => {
		const { fixture } = await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
		});

		const component = fixture.componentInstance;
		expect(component.slideCount()).toBeGreaterThan(1);
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

	// Pruebas de señales computadas
	it('should calculate slideCount correctly', async () => {
		const { fixture } = await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
		});

		const component = fixture.componentInstance;
		expect(component.slideCount()).toBe(contentCampaignMock.length);
	});

	it('should return activeSlide correctly', async () => {
		const { fixture } = await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
		});

		const component = fixture.componentInstance;
		expect(component.activeSlide()).toBe(contentCampaignMock[0]);

		component.next();
		fixture.detectChanges();

		expect(component.activeSlide()).toBe(contentCampaignMock[1]);
	});

	it('should show controls on desktop viewport', async () => {
		const { fixture } = await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
			providers: [{ provide: LayoutService, useClass: MockLayoutMdViewportService }],
		});

		const component = fixture.componentInstance;
		expect(component.showControls()).toBe(true);
	});

	it('should hide controls on mobile viewport', async () => {
		const { fixture } = await render(CarouselComponent, {
			inputs: { slides: contentCampaignMock },
			providers: [{ provide: LayoutService, useClass: MockLayoutXsViewportService }],
		});

		const component = fixture.componentInstance;
		expect(component.showControls()).toBe(false);
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
		await new Promise((resolve) => setTimeout(resolve, 1300));
		expect(component.direction()).toBe(null);
	});
});
