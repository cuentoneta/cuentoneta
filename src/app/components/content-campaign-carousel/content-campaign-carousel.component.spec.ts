// Testing library
import { render, screen } from '@testing-library/angular';

// Components
import { ContentCampaignCarouselComponent } from './content-campaign-carousel.component';

// Services
import { ThemeService } from '../../providers/theme.service';

// Mocks
import { contentCampaignMock } from '../../mocks/content-campaign.mock';

// Mocks ad-hoc
class MockThemeXsViewportService {
	viewport = 'xs';
}
class MockThemeMdViewportService {
	viewport = 'md';
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
			providers: [{ provide: ThemeService, useClass: MockThemeXsViewportService }],
		});
		const slideLinks = screen.getAllByRole('link');
		slideLinks.forEach((link) => {
			expect(link).toHaveClass('md:hidden');
		});
	});
	it('should apply md viewport-specific classes correctly', async () => {
		await render(ContentCampaignCarouselComponent, {
			inputs: { slides: contentCampaignMock },
			providers: [{ provide: ThemeService, useClass: MockThemeMdViewportService }],
		});
		const slideLinks = screen.getAllByRole('link');
		slideLinks.forEach((link) => {
			expect(link).toHaveClass('max-md:hidden');
		});
	});
	it('should render the correct title', async () => {
		await render(ContentCampaignCarouselComponent, {
			inputs: { slides: contentCampaignMock },
			providers: [{ provide: ThemeService, useClass: MockThemeXsViewportService }],
		});
		const titles = screen.getAllByRole('heading', { level: 2 });
		titles.forEach((title) => {
			expect(title).toBeInTheDocument();
		});
	});

	it('should render the correct subtitle', async () => {
		await render(ContentCampaignCarouselComponent, {
			inputs: { slides: contentCampaignMock },
			providers: [{ provide: ThemeService, useClass: MockThemeXsViewportService }],
		});
		const subtitles = screen.getAllByRole('heading', { level: 3 });
		subtitles.forEach((subtitle) => {
			expect(subtitle).toBeInTheDocument();
		});
	});
});
