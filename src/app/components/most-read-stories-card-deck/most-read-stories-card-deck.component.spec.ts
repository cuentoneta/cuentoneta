import { MostReadStoriesCardDeckComponent } from './most-read-stories-card-deck.component';
import { render } from '@testing-library/angular';
import { storyNavigationTeaserWithAuthorMock } from '../../mocks/story.mock';

describe('MostReadStoriesCardDeckComponent', () => {
	it('should render the component', async () => {
		const { container } = await render(MostReadStoriesCardDeckComponent, {
			componentInputs: {
				stories: [storyNavigationTeaserWithAuthorMock],
			},
		});
		expect(container).toBeTruthy();
	});
});
