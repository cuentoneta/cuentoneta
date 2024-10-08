import { ContentCampaignCarouselComponent } from './content-campaign-carousel.component';
import { render } from '@testing-library/angular';
import { contentCampaignMock } from '../../mocks/content-campaign.mock';

describe('ContentCampaignCarouselComponent', () => {
	it('should render the component', async () => {
		const { container } = await render(ContentCampaignCarouselComponent, {
			inputs: { slides: contentCampaignMock },
		});
		expect(container).toBeInTheDocument();
	});
});
