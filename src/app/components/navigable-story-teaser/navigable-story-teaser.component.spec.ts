import { render, screen } from '@testing-library/angular';
import { NavigableStoryTeaserComponent } from './navigable-story-teaser.component';
import { storyTeaserMock } from 'src/app/mocks/story.mock';

describe('NavigableStoryTeaserComponent', () => {
	const authorSlug = 'edgar-allan-poe';
	const title = storyTeaserMock.title;
	const approximateReadingTime = `${storyTeaserMock.approximateReadingTime} minutos de lectura`;

	const setup = async () => {
		return await render(NavigableStoryTeaserComponent, {
			inputs: {
				story: storyTeaserMock,
				selected: true,
				authorSlug: authorSlug,
			},
		});
	};
	it('Should render the component', async () => {
		const { container } = await setup();

		expect(container).toBeInTheDocument();
	});

	it('should render title and approximateReadingTime', async () => {
		await setup();

		const titleResourceElement = screen.getByText(title);
		const readingTiemResourceElement = screen.getByText(approximateReadingTime);

		expect(titleResourceElement).toBeInTheDocument();
		expect(readingTiemResourceElement).toBeInTheDocument();
	});
});
