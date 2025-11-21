// Testing library
import { render, screen } from '@testing-library/angular';

// Components
import { ContentCampaignCarouselComponent } from './content-campaign-carousel.component';

// Mocks
import { contentCampaignMock } from '../../mocks/content-campaign.mock';
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
	it('should render the correct number of slides', async () => {
		await render(ContentCampaignCarouselComponent, {
			inputs: { slides: contentCampaignMock },
		});
		const slides = screen.getAllByRole('img');
		const sourceImages = new Set(slides.map((slide) => slide.getAttribute('src')));
		expect(sourceImages.size).toBe(contentCampaignMock.length);
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
