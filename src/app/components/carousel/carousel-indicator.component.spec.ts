// Librería de pruebas
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

// Componentes
import { CarouselIndicatorComponent } from './carousel-indicator.component';

// Mocks
import { contentCampaignMock } from '@mocks/content-campaign.mock';

describe('CarouselIndicatorComponent', () => {
	it('should render the component', async () => {
		const { container } = await render(CarouselIndicatorComponent, {
			inputs: {
				slides: contentCampaignMock,
				activeIndex: 0,
			},
		});
		expect(container).toBeInTheDocument();
	});

	it('should render indicator for each slide', async () => {
		await render(CarouselIndicatorComponent, {
			inputs: {
				slides: contentCampaignMock,
				activeIndex: 0,
			},
		});

		const indicators = screen.getAllByRole('button');
		expect(indicators.length).toBe(contentCampaignMock.length);
	});

	it('should mark active indicator with active class', async () => {
		await render(CarouselIndicatorComponent, {
			inputs: {
				slides: contentCampaignMock,
				activeIndex: 0,
			},
		});

		const indicators = screen.getAllByRole('button');
		const indicatorItems = indicators.map((btn) => btn.querySelector('.indicator-item'));

		// El primer elemento debe tener la clase 'active'
		expect(indicatorItems[0]).toHaveClass('active');

		// Los otros elementos no deben tener la clase 'active'
		for (let i = 1; i < indicatorItems.length; i++) {
			expect(indicatorItems[i]).not.toHaveClass('active');
		}
	});

	it('should emit indicatorClick with correct index when clicked', async () => {
		const user = userEvent.setup();
		const { fixture } = await render(CarouselIndicatorComponent, {
			inputs: {
				slides: contentCampaignMock,
				activeIndex: 0,
			},
		});

		let emittedIndex: number | undefined;
		fixture.componentInstance.indicatorClick.subscribe((index: number) => {
			emittedIndex = index;
		});

		const indicators = screen.getAllByRole('button');

		// Hacer clic en el segundo indicador
		await user.click(indicators[1]);

		expect(emittedIndex).toBe(1);
	});

	it('should apply desktop-specific styles when device is Desktop', async () => {
		const { container } = await render(CarouselIndicatorComponent, {
			inputs: {
				slides: contentCampaignMock,
				activeIndex: 0,
				device: 'Desktop',
			},
		});

		const indicatorContainer = container.querySelector('.carousel-indicator-container');
		expect(indicatorContainer).toHaveClass('desktop');
	});

	it('should apply mobile-specific styles when device is Mobile', async () => {
		const { container } = await render(CarouselIndicatorComponent, {
			inputs: {
				slides: contentCampaignMock,
				activeIndex: 0,
				device: 'Mobile',
			},
		});

		const indicatorContainer = container.querySelector('.carousel-indicator-container');
		expect(indicatorContainer).toHaveClass('mobile');
	});

	it('should have proper ARIA attributes', async () => {
		await render(CarouselIndicatorComponent, {
			inputs: {
				slides: contentCampaignMock,
				activeIndex: 0,
			},
		});

		const indicators = screen.getAllByRole('button');

		// Cada indicador debe tener aria-label
		indicators.forEach((indicator, index) => {
			expect(indicator).toHaveAttribute('aria-label', `Go to slide ${index + 1}`);
		});

		// El indicador activo debe tener aria-current="true"
		expect(indicators[0]).toHaveAttribute('aria-current', 'true');

		// Los indicadores inactivos deben tener aria-current="false"
		for (let i = 1; i < indicators.length; i++) {
			expect(indicators[i]).toHaveAttribute('aria-current', 'false');
		}
	});
});
