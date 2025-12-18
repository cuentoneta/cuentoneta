// Testing library
import { render, screen } from '@testing-library/angular';

// Components
import { ContentCampaignCarouselComponent } from './content-campaign-carousel.component';

// Mocks
import { contentCampaignMock } from '@mocks/content-campaign.mock';
import { LayoutService } from '../../providers/layout.service';

// Mocks ad-hoc
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

describe('ContentCampaignCarouselComponent', () => {
	it('should render the component', async () => {
		const { container } = await render(ContentCampaignCarouselComponent, {
			inputs: { slides: contentCampaignMock },
		});
		expect(container).toBeInTheDocument();
	});
	it('should receive and render slides correctly', async () => {
		const { fixture } = await render(ContentCampaignCarouselComponent, {
			inputs: { slides: contentCampaignMock },
		});
		// Verify the component receives the correct number of slides
		expect(fixture.componentInstance.slides()).toHaveLength(contentCampaignMock.length);
		// Verify at least one slide is rendered in the carousel (carousel only renders active slides)
		const images = screen.getAllByRole('img');
		expect(images.length).toBeGreaterThanOrEqual(1);
	});
	it('should apply xs viewport-specific classes correctly', async () => {
		await render(ContentCampaignCarouselComponent, {
			inputs: { slides: contentCampaignMock },
			providers: [{ provide: LayoutService, useClass: MockLayoutXsViewportService }],
		});
		const slideLinks = screen.getAllByRole('link');
		slideLinks.forEach((link) => {
			expect(link).toHaveClass('md:hidden');
		});
	});

	it('should apply md viewport-specific classes correctly', async () => {
		await render(ContentCampaignCarouselComponent, {
			inputs: { slides: contentCampaignMock },
			providers: [{ provide: LayoutService, useClass: MockLayoutMdViewportService }],
		});
		const slideLinks = screen.getAllByRole('link');
		slideLinks.forEach((link) => {
			expect(link).toHaveClass('max-md:hidden');
		});
	});
});
